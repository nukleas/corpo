/**
 * corpo/relgraph.js
 * CpRelGraph — large interactive relationship graph. No dependencies.
 * Canvas 2D renderer targeting ~10k nodes / 20k edges at interactive framerates.
 *
 * Colors and type come from resolved --corpo-* tokens (canvas cannot read CSS
 * variables live — call refreshTheme() after a theme class change). JS owns
 * geometry, interaction, and painting; CSS owns the host, tooltip, and focus ring.
 *
 * The engine is controlled: it never mutates the model. Selection intent is
 * reported via onSelect; the host may sync it back through select().
 */

import { createForceWorker, radialLayout, tierLayout } from './graph-layout.js';

const MIN_SCALE = 0.02;
const MAX_SCALE = 12;
const CLICK_SLOP = 4; // px of pointer travel before a press becomes a pan
const DEFAULT_NODE_R = 4; // world units
const LABEL_MIN_SCALE = 0.75; // labels start fading in at this zoom
const LABEL_FULL_SCALE = 1.4; // fully opaque from here
const MAX_LABELS = 300; // per frame, highest-degree first
const HIT_SLOP = 6; // extra screen px around a node that still counts as a hit

let instanceCounter = 0;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

/** Resolve the tokens the canvas needs; canvas can't use var() directly. */
function readTheme(el) {
  const cs = getComputedStyle(el);
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    bg: v('--corpo-bg-panel', '#ffffff'),
    edge: v('--corpo-border', '#c9d2de'),
    edgeStrong: v('--corpo-border-strong', '#a3b1c4'),
    text: v('--corpo-text', '#101623'),
    textSecondary: v('--corpo-text-secondary', '#3f4c63'),
    accent: v('--corpo-accent', '#0f6f80'),
    onAccent: v('--corpo-on-accent', '#ffffff'),
    overflow: v('--corpo-gray-500', '#75839a'),
    fontSans: v('--corpo-font-sans', 'sans-serif'),
    series: [1, 2, 3, 4, 5].map((i) => v(`--corpo-chart-${i}`, '#00819c')),
  };
}

/**
 * Golden-angle spiral placement for nodes without explicit coordinates —
 * deterministic, uniform density, no layout engine required (that's Layer 2).
 */
function placeMissing(nodes) {
  const GA = Math.PI * (3 - Math.sqrt(5));
  const spacing = 14;
  let i = 0;
  for (const n of nodes) {
    if (Number.isFinite(n.x) && Number.isFinite(n.y)) continue;
    const t = i++;
    const d = spacing * Math.sqrt(t + 0.5);
    n.x = Math.cos(t * GA) * d;
    n.y = Math.sin(t * GA) * d;
  }
}

/** Uniform spatial hash over node centers; static per model, used for hit-testing. */
function buildGrid(nodes, cell) {
  const map = new Map();
  for (const n of nodes) {
    const key = `${Math.floor(n.x / cell)},${Math.floor(n.y / cell)}`;
    const bucket = map.get(key);
    if (bucket) bucket.push(n);
    else map.set(key, [n]);
  }
  return {
    cell,
    /** All nodes within `r` world units of (x, y), nearest first. */
    near(x, y, r) {
      const out = [];
      const c0 = Math.floor((x - r) / cell);
      const c1 = Math.floor((x + r) / cell);
      const r0 = Math.floor((y - r) / cell);
      const r1 = Math.floor((y + r) / cell);
      for (let cx = c0; cx <= c1; cx++) {
        for (let cy = r0; cy <= r1; cy++) {
          const bucket = map.get(`${cx},${cy}`);
          if (!bucket) continue;
          for (const n of bucket) {
            const dx = n.x - x;
            const dy = n.y - y;
            if (dx * dx + dy * dy <= r * r) out.push(n);
          }
        }
      }
      out.sort((a, b) => ((a.x - x) ** 2 + (a.y - y) ** 2) - ((b.x - x) ** 2 + (b.y - y) ** 2));
      return out;
    },
  };
}

export function CpRelGraph(root, opts = {}) {
  const instanceId = `cp-relgraph-${++instanceCounter}`;
  root.classList.add('cp-relgraph');

  const canvas = document.createElement('canvas');
  canvas.className = 'cp-relgraph__canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Relationship graph');
  canvas.setAttribute('aria-describedby', `${instanceId}-live`);

  const tip = document.createElement('div');
  tip.className = 'cp-relgraph__tip';
  tip.hidden = true;

  const live = document.createElement('div');
  live.id = `${instanceId}-live`;
  live.className = 'cp-relgraph__live';
  live.setAttribute('aria-live', 'polite');

  root.append(canvas, tip, live);
  const ctx = canvas.getContext('2d');

  let theme = readTheme(root);
  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;

  // camera: screen = world * k + (tx, ty)
  let k = 1;
  let tx = 0;
  let ty = 0;
  let userCam = false; // once the user pans/zooms, resize no longer refits

  let nodes = [];
  let edges = [];
  let byId = new Map(); // id → { node, nbrs:Set<id>, degree }
  let byDegree = []; // nodes sorted by degree desc, drives label priority
  let grid = null;
  let kindColor = new Map();
  let currentKinds = {};

  let selection = null;
  let hoverId = null;
  let frame = 0;

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      paint();
    });
  }

  function colorOf(n) {
    return kindColor.get(n.kind ?? '') ?? theme.series[0];
  }

  function assignKindColors() {
    // Explicit overrides win, then chart series in first-seen order, then the
    // neutral overflow tone past five (chart palette rule).
    kindColor = new Map();
    let next = 0;
    for (const n of nodes) {
      const kind = n.kind ?? '';
      if (kindColor.has(kind)) continue;
      const override = currentKinds[kind]?.color;
      kindColor.set(kind, override ?? (next < 5 ? theme.series[next++] : theme.overflow));
    }
  }

  function rebuildGrid() {
    const maxR = nodes.reduce((m, n) => Math.max(m, n.r), DEFAULT_NODE_R);
    grid = buildGrid(nodes, Math.max(maxR * 4, 48));
  }

  function load(model) {
    nodes = (model.nodes ?? []).map((n) => ({ ...n, r: n.r ?? DEFAULT_NODE_R }));
    placeMissing(nodes);
    for (const n of nodes) {
      // preset baseline — runLayout('preset') restores these
      n.px = n.x;
      n.py = n.y;
    }

    byId = new Map(nodes.map((n) => [n.id, { node: n, nbrs: new Set(), degree: 0 }]));
    edges = [];
    for (const e of model.edges ?? []) {
      const s = byId.get(e.source);
      const t = byId.get(e.target);
      if (!s || !t) continue;
      edges.push({ s: s.node, t: t.node });
      s.nbrs.add(e.target);
      t.nbrs.add(e.source);
      s.degree++;
      t.degree++;
    }
    byDegree = [...byId.values()].sort((a, b) => b.degree - a.degree).map((r) => r.node);

    currentKinds = model.kinds ?? {};
    assignKindColors();
    rebuildGrid();

    if (selection && !byId.has(selection)) selection = null;
    if (hoverId && !byId.has(hoverId)) setHover(null);
  }

  // ── layouts ──

  let layoutName = opts.layout ?? 'preset';
  let worker = null;

  function afterPositions() {
    rebuildGrid();
    if (!userCam) fit();
    else schedule();
  }

  function stopLayout() {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  }

  function runLayout(name = layoutName) {
    layoutName = name;
    stopLayout();
    if (name === 'preset') {
      for (const n of nodes) {
        n.x = n.px;
        n.y = n.py;
      }
      afterPositions();
      opts.onLayoutEnd?.(name);
      return;
    }
    if (name === 'radial' || name === 'tiers') {
      const edgeList = edges.map((e) => ({ source: e.s.id, target: e.t.id }));
      const pos = name === 'radial' ? radialLayout(nodes, edgeList) : tierLayout(nodes, edgeList);
      for (const n of nodes) {
        const p = pos.get(n.id);
        if (p) {
          n.x = p.x;
          n.y = p.y;
        }
      }
      afterPositions();
      opts.onLayoutEnd?.(name);
      return;
    }

    // force — Barnes-Hut in a worker; batches stream back until it cools
    const index = new Map(nodes.map((n, i) => [n.id, i]));
    const pos = new Float32Array(nodes.length * 2);
    nodes.forEach((n, i) => {
      pos[2 * i] = n.x;
      pos[2 * i + 1] = n.y;
    });
    const flat = new Int32Array(edges.length * 2);
    edges.forEach((e, i) => {
      flat[2 * i] = index.get(e.s.id);
      flat[2 * i + 1] = index.get(e.t.id);
    });
    worker = createForceWorker();
    worker.onmessage = (ev) => {
      const { pos: p, done } = ev.data;
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].x = p[2 * i];
        nodes[i].y = p[2 * i + 1];
      }
      afterPositions();
      if (done) {
        stopLayout();
        opts.onLayoutEnd?.('force');
      }
    };
    worker.postMessage({ pos, edges: flat, n: nodes.length, m: edges.length }, [pos.buffer, flat.buffer]);
  }

  // ── viewport ──

  function resize() {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function bounds() {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of nodes) {
      if (n.x - n.r < x0) x0 = n.x - n.r;
      if (n.y - n.r < y0) y0 = n.y - n.r;
      if (n.x + n.r > x1) x1 = n.x + n.r;
      if (n.y + n.r > y1) y1 = n.y + n.r;
    }
    return x0 <= x1 ? { x0, y0, x1, y1 } : { x0: 0, y0: 0, x1: 0, y1: 0 };
  }

  function fit(padding = 40) {
    if (!nodes.length) return;
    const b = bounds();
    const bw = Math.max(1, b.x1 - b.x0);
    const bh = Math.max(1, b.y1 - b.y0);
    k = Math.min((width - padding * 2) / bw, (height - padding * 2) / bh);
    k = Math.min(Math.max(k, MIN_SCALE), MAX_SCALE);
    tx = width / 2 - ((b.x0 + b.x1) / 2) * k;
    ty = height / 2 - ((b.y0 + b.y1) / 2) * k;
    schedule();
  }

  function zoomTo(id) {
    const rec = byId.get(id);
    if (!rec) return;
    k = Math.max(k, 2);
    tx = width / 2 - rec.node.x * k;
    ty = height / 2 - rec.node.y * k;
    userCam = true;
    schedule();
  }

  function zoomAt(sx, sy, factor) {
    const next = Math.min(Math.max(k * factor, MIN_SCALE), MAX_SCALE);
    // keep the world point under the cursor fixed
    tx = sx - ((sx - tx) / k) * next;
    ty = sy - ((sy - ty) / k) * next;
    k = next;
    userCam = true;
    schedule();
  }

  // ── painting ──

  function relatedSet() {
    if (!selection) return null;
    const rec = byId.get(selection);
    if (!rec) return null;
    const set = new Set(rec.nbrs);
    set.add(selection);
    return set;
  }

  function paint() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    const related = relatedSet();
    const vx0 = -tx / k;
    const vy0 = -ty / k;
    const vx1 = (width - tx) / k;
    const vy1 = (height - ty) / k;
    const margin = 20 / k;

    // Edges in two batched passes so the canvas state changes twice, not 20k
    // times: base pass (dimmed when a selection exists), then related pass.
    ctx.lineWidth = 1;
    for (let pass = 0; pass < (related ? 2 : 1); pass++) {
      const wantRelated = pass === 1;
      ctx.beginPath();
      for (const e of edges) {
        const { s, t } = e;
        if (Math.max(s.x, t.x) < vx0 - margin || Math.min(s.x, t.x) > vx1 + margin) continue;
        if (Math.max(s.y, t.y) < vy0 - margin || Math.min(s.y, t.y) > vy1 + margin) continue;
        const isRelated = related ? related.has(s.id) && related.has(t.id) : false;
        if (related && isRelated !== wantRelated) continue;
        ctx.moveTo(s.x * k + tx, s.y * k + ty);
        ctx.lineTo(t.x * k + tx, t.y * k + ty);
      }
      if (wantRelated) {
        ctx.strokeStyle = theme.edgeStrong;
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = theme.edge;
        ctx.globalAlpha = related ? 0.25 : 0.8;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Nodes batched per kind color; dimmed pass drawn at reduced alpha.
    const visible = [];
    for (const n of nodes) {
      if (n.x < vx0 - margin || n.x > vx1 + margin || n.y < vy0 - margin || n.y > vy1 + margin) continue;
      visible.push(n);
    }
    const buckets = new Map();
    for (const n of visible) {
      const dim = related ? !related.has(n.id) : false;
      const key = `${dim ? 'd' : 'f'}${colorOf(n)}`;
      const bucket = buckets.get(key);
      if (bucket) bucket.nodes.push(n);
      else buckets.set(key, { color: colorOf(n), dim, nodes: [n] });
    }
    for (const { color, dim, nodes: group } of buckets.values()) {
      ctx.beginPath();
      for (const n of group) {
        const r = Math.max(n.r * k, 1.5);
        ctx.moveTo(n.x * k + tx + r, n.y * k + ty);
        ctx.arc(n.x * k + tx, n.y * k + ty, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = color;
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const id of [hoverId, selection]) {
      const rec = id ? byId.get(id) : null;
      if (!rec) continue;
      const n = rec.node;
      const r = Math.max(n.r * k, 1.5) + 3;
      ctx.beginPath();
      ctx.arc(n.x * k + tx, n.y * k + ty, r, 0, Math.PI * 2);
      ctx.strokeStyle = id === selection ? theme.accent : theme.edgeStrong;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    paintLabels(visible, related);
  }

  function paintLabels(visible, related) {
    const zoomAlpha = (k - LABEL_MIN_SCALE) / (LABEL_FULL_SCALE - LABEL_MIN_SCALE);
    const baseAlpha = Math.min(Math.max(zoomAlpha, 0), 1);
    if (baseAlpha <= 0 && !related && !hoverId) return;

    ctx.font = `500 11px ${theme.fontSans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = theme.bg;

    const drawn = new Set();
    const draw = (n, alpha, emphasized) => {
      if (drawn.has(n.id) || !n.label) return;
      drawn.add(n.id);
      const sx = n.x * k + tx;
      const sy = n.y * k + ty + Math.max(n.r * k, 1.5) + 4;
      ctx.globalAlpha = alpha;
      ctx.strokeText(n.label, sx, sy);
      ctx.fillStyle = emphasized ? theme.text : theme.textSecondary;
      ctx.fillText(n.label, sx, sy);
    };

    // Selection neighborhood and hover always label, regardless of zoom.
    if (related) {
      for (const id of related) {
        if (drawn.size >= MAX_LABELS) break;
        const rec = byId.get(id);
        if (rec) draw(rec.node, 1, id === selection);
      }
    }
    if (hoverId) {
      const rec = byId.get(hoverId);
      if (rec) draw(rec.node, 1, true);
    }

    if (baseAlpha > 0) {
      const inView = new Set(visible.map((n) => n.id));
      for (const n of byDegree) {
        if (drawn.size >= MAX_LABELS) break;
        if (!inView.has(n.id)) continue;
        draw(n, related ? baseAlpha * 0.35 : baseAlpha, false);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── selection / hover ──

  function announce(msg) {
    live.textContent = msg;
  }

  function select(id) {
    const rec = id ? byId.get(id) : null;
    const next = rec ? id : null;
    if (next === selection) return;
    selection = next;
    if (rec) {
      announce(`Selected ${rec.node.label ?? rec.node.id} — ${rec.degree} connection${rec.degree === 1 ? '' : 's'}`);
    } else {
      announce('Selection cleared');
    }
    schedule();
    opts.onSelect?.(selection, rec ? rec.node : null);
  }

  function setHover(id) {
    if (id === hoverId) return;
    hoverId = id;
    const rec = id ? byId.get(id) : null;
    if (rec) {
      const n = rec.node;
      tip.innerHTML = `
        <span class="cp-relgraph__tip-title">${esc(n.label ?? n.id)}</span>
        ${n.kind ? `<span class="cp-relgraph__tip-kind" style="--tip-kind-color: ${colorOf(n)}">${esc(n.kind)}</span>` : ''}
        <span class="cp-relgraph__tip-meta">${rec.degree} connection${rec.degree === 1 ? '' : 's'}</span>`;
      tip.hidden = false;
      const sx = n.x * k + tx;
      const sy = n.y * k + ty;
      const pad = 8;
      tip.style.left = `${Math.min(Math.max(sx + 12, pad), width - tip.offsetWidth - pad)}px`;
      tip.style.top = `${Math.min(Math.max(sy + 12, pad), height - tip.offsetHeight - pad)}px`;
      canvas.style.cursor = 'pointer';
    } else {
      tip.hidden = true;
      canvas.style.cursor = '';
    }
    schedule();
    opts.onHover?.(hoverId);
  }

  function hitTest(sx, sy) {
    if (!grid) return null;
    const wx = (sx - tx) / k;
    const wy = (sy - ty) / k;
    const near = grid.near(wx, wy, (HIT_SLOP + 12) / k + DEFAULT_NODE_R);
    for (const n of near) {
      const r = Math.max(n.r * k, 1.5) + HIT_SLOP;
      const dx = (n.x - wx) * k;
      const dy = (n.y - wy) * k;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  }

  // ── events ──

  let press = null; // { sx, sy, tx0, ty0, moved }

  function onPointerDown(ev) {
    if (ev.button !== 0) return;
    canvas.setPointerCapture(ev.pointerId);
    press = { sx: ev.offsetX, sy: ev.offsetY, tx0: tx, ty0: ty, moved: false };
  }

  function onPointerMove(ev) {
    if (press) {
      const dx = ev.offsetX - press.sx;
      const dy = ev.offsetY - press.sy;
      if (!press.moved && Math.hypot(dx, dy) > CLICK_SLOP) press.moved = true;
      if (press.moved) {
        tx = press.tx0 + dx;
        ty = press.ty0 + dy;
        userCam = true;
        setHover(null);
        schedule();
      }
      return;
    }
    setHover(hitTest(ev.offsetX, ev.offsetY)?.id ?? null);
  }

  function onPointerUp(ev) {
    const wasClick = press && !press.moved;
    press = null;
    if (wasClick) {
      const hit = hitTest(ev.offsetX, ev.offsetY);
      select(hit && hit.id !== selection ? hit.id : null);
    }
  }

  function onWheel(ev) {
    ev.preventDefault();
    zoomAt(ev.offsetX, ev.offsetY, Math.exp(-ev.deltaY * 0.0015));
    // the world moves under a stationary cursor — re-resolve hover
    setHover(hitTest(ev.offsetX, ev.offsetY)?.id ?? null);
  }

  function onDblClick(ev) {
    const hit = hitTest(ev.offsetX, ev.offsetY);
    if (hit) zoomTo(hit.id);
  }

  function onKeyDown(ev) {
    const pan = 40;
    switch (ev.key) {
      case 'ArrowLeft': tx += pan; break;
      case 'ArrowRight': tx -= pan; break;
      case 'ArrowUp': ty += pan; break;
      case 'ArrowDown': ty -= pan; break;
      case '+':
      case '=': zoomAt(width / 2, height / 2, 1.25); return;
      case '-': zoomAt(width / 2, height / 2, 0.8); return;
      case '0': userCam = false; fit(); return;
      case 'Escape': select(null); return;
      default: return;
    }
    ev.preventDefault();
    userCam = true;
    schedule();
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', () => setHover(null));
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('keydown', onKeyDown);

  const ro = new ResizeObserver(() => {
    resize();
    if (!userCam) fit();
    else schedule();
  });
  ro.observe(root);

  // ── init ──

  load(opts);
  resize();
  fit();
  if (layoutName !== 'preset') runLayout(layoutName);

  return {
    select,
    getSelection: () => selection,
    replaceModel(model) {
      load(model);
      if (layoutName !== 'preset') runLayout(layoutName);
      else afterPositions();
    },
    fit(padding) {
      userCam = false;
      fit(padding);
    },
    zoomTo,
    runLayout(name) {
      userCam = false;
      runLayout(name);
    },
    stopLayout,
    refreshTheme() {
      theme = readTheme(root);
      assignKindColors();
      schedule();
    },
    destroy() {
      stopLayout();
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      canvas.remove();
      tip.remove();
      live.remove();
      root.classList.remove('cp-relgraph');
    },
  };
}
