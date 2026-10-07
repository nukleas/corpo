/**
 * corpo/relgraph.js
 * CpRelGraph — large interactive relationship graph. No dependencies.
 * Canvas 2D renderer targeting ~10k nodes / 20k edges at interactive framerates.
 *
 * Colors and type come from resolved --corpo-* tokens (canvas cannot read CSS
 * variables live — call refreshTheme() after a theme class change). JS owns
 * geometry, interaction, and painting; CSS owns the host, tooltip, minimap
 * chrome, and focus ring.
 *
 * The engine is controlled: it never mutates the caller's model. Selection
 * intent is reported via onSelect / onSelectIds; the host may sync it back
 * through select() / selectMany(). Dragged positions live on the internal
 * copies and are reported via onDrag; persist them by writing x/y back.
 */

import { createForceWorker, radialLayout, tierLayout } from './graph-layout.js';

const MIN_SCALE = 0.02;
const MAX_SCALE = 12;
const CLICK_SLOP = 4; // px of pointer travel before a press becomes a pan/drag
const DEFAULT_NODE_R = 4; // world units
const LABEL_MIN_SCALE = 0.75; // labels start fading in at this zoom
const LABEL_FULL_SCALE = 1.4; // fully opaque from here
const MAX_LABELS = 300; // per frame, highest-degree first
const HIT_SLOP = 6; // extra screen px around a node that still counts as a hit
const GUTTER_W = 128;
const GUTTER_H = 14;
const GUTTER_GAP = 2;
const GUTTER_PAD = 8;
const GUTTER_MAX = 24; // per side
const MINI_W = 140;
const MINI_H = 100;
const MINI_PAD = 6;

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
    miniBg: v('--corpo-bg', '#ffffff'),
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
 * deterministic, uniform density, used when a layout hasn't run yet.
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

/** Uniform spatial hash over node centers; rebuilt when positions or visibility change. */
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

/**
 * Pack gutter labels along one side so they don't overlap, staying as close
 * as possible to each node's screen y. Ported from cyberdesign's iso engine.
 */
function packGutter(items, height, labelH, pad, gap) {
  items.sort((a, b) => a.ty - b.ty);
  if (!items.length) return;
  const room = height - pad * 2;
  const need = items.length * labelH + Math.max(0, items.length - 1) * gap;
  if (need > room) {
    const span = room / items.length;
    items.forEach((it, i) => { it.ly = pad + i * span; });
    return;
  }
  let y = pad;
  for (const it of items) {
    it.ly = Math.max(y, Math.min(it.ty - labelH / 2, height - pad - labelH));
    y = it.ly + labelH + gap;
  }
  const last = items[items.length - 1];
  if (last.ly + labelH > height - pad) {
    const shift = last.ly + labelH - (height - pad);
    for (const it of items) it.ly -= shift;
    if (items[0].ly < pad) {
      const span = room / items.length;
      items.forEach((it, i) => { it.ly = pad + i * span; });
    }
  }
}

function ellipsize(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return s ? `${s}…` : '…';
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

  const mini = document.createElement('canvas');
  mini.className = 'cp-relgraph__minimap';
  mini.width = MINI_W;
  mini.height = MINI_H;
  mini.setAttribute('aria-label', 'Graph overview');
  mini.tabIndex = 0;

  root.append(canvas, tip, live, mini);
  const ctx = canvas.getContext('2d');
  const mctx = mini.getContext('2d');

  let theme = readTheme(root);
  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;

  // camera: screen = world * k + (tx, ty)
  let k = 1;
  let tx = 0;
  let ty = 0;
  let userCam = false; // once the user pans/zooms, resize no longer refits
  let pendingJump = null;

  let nodes = [];
  let edges = [];
  let byId = new Map(); // id → { node, nbrs:Set<id>, degree, parent }
  let children = new Map(); // parent id → child ids
  let hasHierarchy = false;
  let byDegree = []; // nodes sorted by degree desc, drives label priority
  let grid = null;
  let kindColor = new Map();
  let currentKinds = {};

  let shown = [];
  let shownIds = new Set();
  let shownEdges = [];
  let inScope = null; // Set<id> | null

  let selected = new Set();
  let primary = null;
  let hoverId = null;
  let matches = new Set();
  let matchList = [];
  let matchIndex = 0;
  let frame = 0;

  let labelMode = opts.labels === 'gutter' || opts.labels === 'focus' ? opts.labels : 'lod';
  let kindFilter = new Set(opts.filters?.kinds ?? []);
  let groupFilter = new Set(opts.filters?.groups ?? []);
  let scopeId = opts.scopeId ?? null;
  let scopeHops = Number.isFinite(opts.scopeHops) ? Math.max(0, opts.scopeHops) : 1;
  let minimapOn = opts.minimap !== false;
  mini.hidden = !minimapOn;

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
    const pool = shown.length ? shown : nodes;
    const maxR = pool.reduce((m, n) => Math.max(m, n.r), DEFAULT_NODE_R);
    grid = buildGrid(pool, Math.max(maxR * 4, 48));
  }

  function buildScopeSet() {
    if (!scopeId || !byId.has(scopeId)) return null;
    const set = new Set();
    if (hasHierarchy) {
      const walk = (id) => {
        set.add(id);
        const kids = children.get(id);
        if (kids) for (const c of kids) walk(c);
      };
      walk(scopeId);
      return set;
    }
    set.add(scopeId);
    let frontier = [scopeId];
    for (let h = 0; h < scopeHops; h++) {
      const next = [];
      for (const id of frontier) {
        const rec = byId.get(id);
        if (!rec) continue;
        for (const nid of rec.nbrs) {
          if (!set.has(nid)) {
            set.add(nid);
            next.push(nid);
          }
        }
      }
      frontier = next;
    }
    return set;
  }

  function isShown(n) {
    if (inScope && !inScope.has(n.id)) return false;
    if (kindFilter.size && !kindFilter.has(n.kind ?? '')) return false;
    if (groupFilter.size && !groupFilter.has(n.group ?? '')) return false;
    return true;
  }

  function rebuildShown() {
    inScope = buildScopeSet();
    shown = [];
    shownIds = new Set();
    for (const n of nodes) {
      if (!isShown(n)) continue;
      shown.push(n);
      shownIds.add(n.id);
    }
    shownEdges = edges.filter((e) => shownIds.has(e.s.id) && shownIds.has(e.t.id));
    rebuildGrid();
    if (primary && !shownIds.has(primary)) {
      selected = new Set([...selected].filter((id) => shownIds.has(id)));
      primary = selected.size ? [...selected][selected.size - 1] : null;
    }
    if (hoverId && !shownIds.has(hoverId)) setHover(null);
  }

  function load(model) {
    nodes = (model.nodes ?? []).map((n) => ({ ...n, r: n.r ?? DEFAULT_NODE_R }));
    placeMissing(nodes);
    for (const n of nodes) {
      // preset baseline — runLayout('preset') restores these; drag writes back
      n.px = n.x;
      n.py = n.y;
    }

    byId = new Map(nodes.map((n) => [n.id, { node: n, nbrs: new Set(), degree: 0 }]));
    children = new Map();
    hasHierarchy = false;
    for (const n of nodes) {
      if (!n.parent || !byId.has(n.parent)) continue;
      hasHierarchy = true;
      const list = children.get(n.parent);
      if (list) list.push(n.id);
      else children.set(n.parent, [n.id]);
    }
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
    if (scopeId && !byId.has(scopeId)) scopeId = null;
    if (hoverId && !byId.has(hoverId)) hoverId = null;
    selected = new Set([...selected].filter((id) => byId.has(id)));
    if (primary && !selected.has(primary)) primary = selected.size ? [...selected][0] : null;
    matches = new Set([...matches].filter((id) => byId.has(id)));
    rebuildShown();
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
    mini.width = Math.round(MINI_W * dpr);
    mini.height = Math.round(MINI_H * dpr);
  }

  function boundsOf(pool) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of pool) {
      if (n.x - n.r < x0) x0 = n.x - n.r;
      if (n.y - n.r < y0) y0 = n.y - n.r;
      if (n.x + n.r > x1) x1 = n.x + n.r;
      if (n.y + n.r > y1) y1 = n.y + n.r;
    }
    return x0 <= x1 ? { x0, y0, x1, y1 } : { x0: 0, y0: 0, x1: 0, y1: 0 };
  }

  function bounds() {
    return boundsOf(shown.length ? shown : nodes);
  }

  function fit(padding = 40) {
    const pool = shown.length ? shown : nodes;
    if (!pool.length) return;
    const b = boundsOf(pool);
    const bw = Math.max(1, b.x1 - b.x0);
    const bh = Math.max(1, b.y1 - b.y0);
    const gx = labelMode === 'gutter' ? GUTTER_W + 8 : 0;
    k = Math.min((width - padding * 2 - gx * 2) / bw, (height - padding * 2) / bh);
    k = Math.min(Math.max(k, MIN_SCALE), MAX_SCALE);
    tx = width / 2 - ((b.x0 + b.x1) / 2) * k;
    ty = height / 2 - ((b.y0 + b.y1) / 2) * k;
    schedule();
  }

  function zoomTo(id) {
    const rec = byId.get(id);
    if (!rec) return;
    if (width < 40 || height < 40) {
      pendingJump = id;
      return;
    }
    pendingJump = null;
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

  function centerOn(wx, wy) {
    tx = width / 2 - wx * k;
    ty = height / 2 - wy * k;
    userCam = true;
    schedule();
  }

  // ── painting ──

  function relatedSet() {
    if (!selected.size) return null;
    const set = new Set(selected);
    for (const id of selected) {
      const rec = byId.get(id);
      if (rec) for (const nid of rec.nbrs) set.add(nid);
    }
    return set;
  }

  let boxRect = null; // screen-space { x0, y0, x1, y1 } while dragging a box

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
      for (const e of shownEdges) {
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
    for (const n of shown) {
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

    const rings = new Set([...selected, hoverId, ...matches].filter(Boolean));
    for (const id of rings) {
      const rec = byId.get(id);
      if (!rec || !shownIds.has(id)) continue;
      const n = rec.node;
      const r = Math.max(n.r * k, 1.5) + 3;
      ctx.beginPath();
      ctx.arc(n.x * k + tx, n.y * k + ty, r, 0, Math.PI * 2);
      ctx.strokeStyle = selected.has(id) ? theme.accent : matches.has(id) ? theme.edgeStrong : theme.edgeStrong;
      ctx.lineWidth = selected.has(id) || id === hoverId ? 2 : 1.5;
      ctx.stroke();
    }

    if (labelMode === 'gutter') paintGutter(visible, related);
    else paintLabels(visible, related);

    if (boxRect) {
      const x = Math.min(boxRect.x0, boxRect.x1);
      const y = Math.min(boxRect.y0, boxRect.y1);
      const w = Math.abs(boxRect.x1 - boxRect.x0);
      const h = Math.abs(boxRect.y1 - boxRect.y0);
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    }

    if (minimapOn) paintMinimap();
  }

  function paintLabels(visible, related) {
    const zoomAlpha = (k - LABEL_MIN_SCALE) / (LABEL_FULL_SCALE - LABEL_MIN_SCALE);
    const baseAlpha = labelMode === 'focus' ? 0 : Math.min(Math.max(zoomAlpha, 0), 1);
    if (baseAlpha <= 0 && !related && !hoverId && !matches.size) return;

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

    // Selection neighborhood, hover, and search hits always label.
    if (related) {
      for (const id of related) {
        if (drawn.size >= MAX_LABELS) break;
        const rec = byId.get(id);
        if (rec && shownIds.has(id)) draw(rec.node, 1, selected.has(id));
      }
    }
    if (hoverId) {
      const rec = byId.get(hoverId);
      if (rec) draw(rec.node, 1, true);
    }
    for (const id of matches) {
      if (drawn.size >= MAX_LABELS) break;
      const rec = byId.get(id);
      if (rec && shownIds.has(id)) draw(rec.node, 1, true);
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

  function paintGutter(visible, related) {
    const inView = new Set(visible.map((n) => n.id));
    const picks = [];
    const want = new Set([...selected, hoverId, ...matches].filter(Boolean));
    for (const n of byDegree) {
      if (!n.label || !shownIds.has(n.id)) continue;
      if (want.has(n.id) || inView.has(n.id)) picks.push(n);
      if (picks.length >= GUTTER_MAX * 2) break;
    }
    // Guarantee hot nodes even if they weren't high-degree enough.
    for (const id of want) {
      if (picks.some((n) => n.id === id)) continue;
      const rec = byId.get(id);
      if (rec?.node.label && shownIds.has(id)) picks.push(rec.node);
    }

    const pins = [];
    for (const n of picks) {
      const sx = n.x * k + tx;
      const sy = n.y * k + ty;
      pins.push({
        n,
        tx: sx,
        ty: sy,
        side: sx < width / 2 ? 'left' : 'right',
        hot: selected.has(n.id) || n.id === hoverId || matches.has(n.id) || related?.has(n.id),
      });
    }
    const rightH = minimapOn ? Math.max(80, height - MINI_H - 16) : height;
    packGutter(pins.filter((p) => p.side === 'left'), height, GUTTER_H, GUTTER_PAD, GUTTER_GAP);
    packGutter(pins.filter((p) => p.side === 'right'), rightH, GUTTER_H, GUTTER_PAD, GUTTER_GAP);

    ctx.font = `500 11px ${theme.fontSans}`;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    for (const pass of [false, true]) {
      ctx.beginPath();
      for (const it of pins) {
        if (Boolean(it.hot) !== pass) continue;
        const lx = it.side === 'left' ? GUTTER_PAD : width - GUTTER_PAD - GUTTER_W;
        const y = it.ly + GUTTER_H / 2;
        const x0 = it.side === 'left' ? lx + GUTTER_W : lx;
        const elbow = it.side === 'left'
          ? Math.min(it.tx - 12, x0 + 18)
          : Math.max(it.tx + 12, x0 - 18);
        ctx.moveTo(x0, y);
        ctx.lineTo(elbow, y);
        ctx.lineTo(elbow, it.ty);
        ctx.lineTo(it.tx, it.ty);
      }
      ctx.strokeStyle = theme.accent;
      ctx.globalAlpha = pass ? 0.9 : 0.35;
      ctx.lineWidth = pass ? 1.5 : 1;
      ctx.stroke();
    }

    for (const it of pins) {
      const lx = it.side === 'left' ? GUTTER_PAD : width - GUTTER_PAD - GUTTER_W;
      const y = it.ly + GUTTER_H / 2;
      ctx.beginPath();
      ctx.arc(it.tx, it.ty, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = it.hot ? theme.accent : colorOf(it.n);
      ctx.globalAlpha = it.hot ? 1 : 0.85;
      ctx.fill();

      ctx.fillStyle = colorOf(it.n);
      ctx.globalAlpha = 1;
      ctx.fillRect(it.side === 'left' ? lx : lx + GUTTER_W - 6, it.ly + 4, 6, 6);

      const textX = it.side === 'left' ? lx + 10 : lx + GUTTER_W - 10;
      ctx.textAlign = it.side === 'left' ? 'left' : 'right';
      ctx.fillStyle = it.hot ? theme.text : theme.textSecondary;
      ctx.fillText(ellipsize(ctx, it.n.label, GUTTER_W - 16), textX, y);
    }
    ctx.globalAlpha = 1;
  }

  function miniLayout() {
    const b = bounds();
    const bw = Math.max(1, b.x1 - b.x0);
    const bh = Math.max(1, b.y1 - b.y0);
    const s = Math.min((MINI_W - MINI_PAD * 2) / bw, (MINI_H - MINI_PAD * 2) / bh);
    return {
      s,
      ox: (MINI_W - bw * s) / 2 - b.x0 * s,
      oy: (MINI_H - bh * s) / 2 - b.y0 * s,
    };
  }

  function paintMinimap() {
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.fillStyle = theme.miniBg;
    mctx.fillRect(0, 0, MINI_W, MINI_H);
    if (!shown.length) return;
    const { s, ox, oy } = miniLayout();

    mctx.fillStyle = theme.edgeStrong;
    mctx.globalAlpha = 0.7;
    const dot = Math.max(1, 1.4);
    for (const n of shown) {
      mctx.fillRect(n.x * s + ox - dot / 2, n.y * s + oy - dot / 2, dot, dot);
    }
    mctx.globalAlpha = 1;

    const vx0 = -tx / k;
    const vy0 = -ty / k;
    const vx1 = (width - tx) / k;
    const vy1 = (height - ty) / k;
    const rx = vx0 * s + ox;
    const ry = vy0 * s + oy;
    const rw = (vx1 - vx0) * s;
    const rh = (vy1 - vy0) * s;
    mctx.strokeStyle = theme.accent;
    mctx.lineWidth = 1;
    mctx.strokeRect(rx + 0.5, ry + 0.5, rw, rh);
  }

  // ── selection / hover / scope / search ──

  function announce(msg) {
    live.textContent = msg;
  }

  function emitSelect() {
    const rec = primary ? byId.get(primary) : null;
    opts.onSelect?.(primary, rec ? rec.node : null);
    opts.onSelectIds?.([...selected]);
  }

  function selectMany(ids) {
    const next = [];
    for (const id of ids) {
      if (byId.has(id) && shownIds.has(id)) next.push(id);
    }
    const same = next.length === selected.size && next.every((id) => selected.has(id));
    if (same && (next[next.length - 1] ?? null) === primary) return;
    selected = new Set(next);
    primary = next.length ? next[next.length - 1] : null;
    if (primary) {
      const rec = byId.get(primary);
      const extra = selected.size > 1 ? ` and ${selected.size - 1} more` : '';
      announce(`Selected ${rec.node.label ?? rec.node.id}${extra} — ${rec.degree} connection${rec.degree === 1 ? '' : 's'}`);
    } else {
      announce('Selection cleared');
    }
    schedule();
    emitSelect();
  }

  function select(id) {
    selectMany(id ? [id] : []);
  }

  function toggleSelect(id) {
    if (!byId.has(id) || !shownIds.has(id)) return;
    const next = [...selected];
    const at = next.indexOf(id);
    if (at >= 0) next.splice(at, 1);
    else next.push(id);
    selectMany(next);
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
        ${n.group ? `<span class="cp-relgraph__tip-meta">${esc(n.group)}</span>` : ''}
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

  function setScope(id) {
    const rec = id ? byId.get(id) : null;
    const next = rec ? id : null;
    if (next === scopeId) {
      if (next) {
        userCam = false;
        fit();
      }
      return;
    }
    scopeId = next;
    rebuildShown();
    userCam = false;
    fit();
    if (scopeId) {
      announce(`Scoped to ${rec.node.label ?? rec.node.id}`);
    } else {
      announce('Scope cleared');
    }
    opts.onScope?.(scopeId, rec ? rec.node : null);
  }

  function find(query) {
    const q = String(query ?? '').trim().toLowerCase();
    if (!q) return [];
    const out = [];
    for (const n of shown) {
      if (n.id.toLowerCase().includes(q) || (n.label && n.label.toLowerCase().includes(q))) out.push(n);
    }
    return out;
  }

  function search(query) {
    const hits = find(query);
    matchList = hits.map((n) => n.id);
    matches = new Set(matchList);
    matchIndex = 0;
    if (hits.length) {
      select(hits[0].id);
      zoomTo(hits[0].id);
      announce(`${hits.length} match${hits.length === 1 ? '' : 'es'} for ${query}`);
    } else {
      announce(query.trim() ? `No matches for ${query}` : 'Search cleared');
      schedule();
    }
    return hits;
  }

  function clearSearch() {
    if (!matches.size) return;
    matches = new Set();
    matchList = [];
    matchIndex = 0;
    schedule();
  }

  function cycleMatch(dir) {
    if (!matchList.length) return;
    matchIndex = (matchIndex + dir + matchList.length) % matchList.length;
    const id = matchList[matchIndex];
    select(id);
    zoomTo(id);
  }

  function hitTest(sx, sy) {
    if (!grid) return null;
    const wx = (sx - tx) / k;
    const wy = (sy - ty) / k;
    const near = grid.near(wx, wy, (HIT_SLOP + 12) / k + DEFAULT_NODE_R);
    for (const n of near) {
      if (!shownIds.has(n.id)) continue;
      const r = Math.max(n.r * k, 1.5) + HIT_SLOP;
      const dx = (n.x - wx) * k;
      const dy = (n.y - wy) * k;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  }

  function nodesInBox(x0, y0, x1, y1) {
    const ax = Math.min(x0, x1);
    const bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1);
    const by = Math.max(y0, y1);
    const wx0 = (ax - tx) / k;
    const wx1 = (bx - tx) / k;
    const wy0 = (ay - ty) / k;
    const wy1 = (by - ty) / k;
    return shown.filter((n) => n.x >= wx0 && n.x <= wx1 && n.y >= wy0 && n.y <= wy1);
  }

  // ── events ──

  let press = null; // { kind, sx, sy, tx0, ty0, id, x0, y0, moved }

  function onPointerDown(ev) {
    if (ev.button !== 0) return;
    canvas.setPointerCapture(ev.pointerId);
    const hit = hitTest(ev.offsetX, ev.offsetY);
    if (ev.shiftKey && !hit) {
      press = { kind: 'box', sx: ev.offsetX, sy: ev.offsetY, moved: false };
      boxRect = { x0: ev.offsetX, y0: ev.offsetY, x1: ev.offsetX, y1: ev.offsetY };
      canvas.style.cursor = 'crosshair';
      return;
    }
    if (hit) {
      press = { kind: 'node', sx: ev.offsetX, sy: ev.offsetY, id: hit.id, x0: hit.x, y0: hit.y, moved: false };
      return;
    }
    press = { kind: 'pan', sx: ev.offsetX, sy: ev.offsetY, tx0: tx, ty0: ty, moved: false };
  }

  function onPointerMove(ev) {
    if (!press) {
      setHover(hitTest(ev.offsetX, ev.offsetY)?.id ?? null);
      return;
    }
    const dx = ev.offsetX - press.sx;
    const dy = ev.offsetY - press.sy;
    if (!press.moved && Math.hypot(dx, dy) > CLICK_SLOP) press.moved = true;

    if (press.kind === 'box') {
      boxRect = { x0: press.sx, y0: press.sy, x1: ev.offsetX, y1: ev.offsetY };
      schedule();
      return;
    }
    if (press.kind === 'node' && press.moved) {
      stopLayout();
      const rec = byId.get(press.id);
      if (rec) {
        const n = rec.node;
        if (!press.dragStarted) {
          press.dragStarted = true;
          opts.onDrag?.(n.id, { x: n.x, y: n.y }, 'start');
        }
        n.x = press.x0 + dx / k;
        n.y = press.y0 + dy / k;
        opts.onDrag?.(n.id, { x: n.x, y: n.y }, 'move');
        setHover(null);
        canvas.style.cursor = 'grabbing';
        schedule();
      }
      return;
    }
    if (press.kind === 'pan' && press.moved) {
      tx = press.tx0 + dx;
      ty = press.ty0 + dy;
      userCam = true;
      setHover(null);
      canvas.style.cursor = 'grabbing';
      schedule();
    }
  }

  function onPointerUp(ev) {
    const was = press;
    press = null;
    canvas.style.cursor = '';
    if (!was) return;

    if (was.kind === 'box') {
      const hits = nodesInBox(was.sx, was.sy, ev.offsetX, ev.offsetY);
      boxRect = null;
      if (was.moved) {
        const ids = hits.map((n) => n.id);
        if (ev.shiftKey) selectMany([...new Set([...selected, ...ids])]);
        else selectMany(ids);
      } else {
        select(null);
        schedule();
      }
      return;
    }
    if (was.kind === 'node') {
      if (was.dragStarted) {
        const rec = byId.get(was.id);
        if (rec) {
          rec.node.px = rec.node.x;
          rec.node.py = rec.node.y;
          opts.onDrag?.(was.id, { x: rec.node.x, y: rec.node.y }, 'end');
        }
        rebuildGrid();
        select(was.id);
        schedule();
        return;
      }
      if (ev.shiftKey) toggleSelect(was.id);
      else select(was.id !== primary || selected.size > 1 ? was.id : null);
      return;
    }
    if (was.kind === 'pan' && !was.moved) select(null);
  }

  function onWheel(ev) {
    ev.preventDefault();
    zoomAt(ev.offsetX, ev.offsetY, Math.exp(-ev.deltaY * 0.0015));
    setHover(hitTest(ev.offsetX, ev.offsetY)?.id ?? null);
  }

  function onDblClick(ev) {
    const hit = hitTest(ev.offsetX, ev.offsetY);
    if (hit) setScope(hit.id);
    else setScope(null);
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
      case ']': cycleMatch(1); return;
      case '[': cycleMatch(-1); return;
      case 'Enter':
        if (primary) setScope(primary);
        return;
      case 'Escape':
        if (selected.size) { select(null); return; }
        if (matches.size) { clearSearch(); announce('Search cleared'); return; }
        if (scopeId) { setScope(null); return; }
        return;
      default: return;
    }
    ev.preventDefault();
    userCam = true;
    schedule();
  }

  function miniToWorld(mx, my) {
    const { s, ox, oy } = miniLayout();
    return { x: (mx - ox) / s, y: (my - oy) / s };
  }

  function onMiniDown(ev) {
    if (ev.button !== 0) return;
    mini.setPointerCapture(ev.pointerId);
    const w = miniToWorld(ev.offsetX, ev.offsetY);
    centerOn(w.x, w.y);
    press = { kind: 'mini', moved: true };
  }

  function onMiniMove(ev) {
    if (!press || press.kind !== 'mini') return;
    const w = miniToWorld(ev.offsetX, ev.offsetY);
    centerOn(w.x, w.y);
  }

  function onMiniUp() {
    if (press?.kind === 'mini') press = null;
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', () => { if (!press) setHover(null); });
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('keydown', onKeyDown);
  mini.addEventListener('pointerdown', onMiniDown);
  mini.addEventListener('pointermove', onMiniMove);
  mini.addEventListener('pointerup', onMiniUp);
  mini.addEventListener('pointercancel', onMiniUp);

  const ro = new ResizeObserver(() => {
    resize();
    if (pendingJump) {
      const id = pendingJump;
      pendingJump = null;
      zoomTo(id);
    } else if (!userCam) fit();
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
    selectMany,
    getSelection: () => primary,
    getSelections: () => [...selected],
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
    setLabels(mode) {
      labelMode = mode === 'gutter' || mode === 'focus' ? mode : 'lod';
      if (!userCam) fit();
      else schedule();
    },
    getLabels: () => labelMode,
    setFilters(next = {}) {
      kindFilter = new Set(next.kinds ?? []);
      groupFilter = new Set(next.groups ?? []);
      rebuildShown();
      if (!userCam) fit();
      else schedule();
    },
    getFilters: () => ({
      kinds: kindFilter.size ? [...kindFilter] : [],
      groups: groupFilter.size ? [...groupFilter] : [],
    }),
    setScope,
    getScope: () => scopeId,
    setMinimap(on) {
      minimapOn = Boolean(on);
      mini.hidden = !minimapOn;
      schedule();
    },
    find,
    search,
    clearSearch,
    getModel: () => ({
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ source: e.s.id, target: e.t.id })),
      kinds: { ...currentKinds },
    }),
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
      mini.remove();
      root.classList.remove('cp-relgraph');
    },
  };
}
