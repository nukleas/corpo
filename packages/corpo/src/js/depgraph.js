/**
 * corpo/depgraph.js
 * SVG milestone/initiative dependency graph. No dependencies.
 * Fills/strokes come from .cp-depgraph-* CSS (token-only). JS owns geometry + interaction.
 *
 * The engine is controlled: it never mutates node state on its own. Advance intent
 * is reported via onAdvance(id, node); the host applies it with setState/replaceModel.
 */

const NODE_W = 200;
const NODE_H = 56;
const NODE_R = 4;
const GAP_TIER = 90;
const GAP_LANE = 24;
const STATES = ['blocked', 'ready', 'in-progress', 'done'];
const STATE_LABELS = {
  'blocked': 'Blocked',
  'ready': 'Ready',
  'in-progress': 'In progress',
  'done': 'Done',
};

let instanceCounter = 0;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function stateOf(n) {
  return STATES.includes(n?.state) ? n.state : 'blocked';
}

function isDone(n) {
  return stateOf(n) === 'done';
}

/** Longest path from roots, honoring explicit `tier` overrides. */
function computeTiers(nodes) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const memo = {};
  const visiting = new Set();
  function tierOf(n) {
    if (Number.isFinite(n.tier)) return n.tier;
    if (memo[n.id] != null) return memo[n.id];
    if (visiting.has(n.id)) return 0; // cycle guard
    visiting.add(n.id);
    const deps = (n.dependsOn || []).map((id) => byId[id]).filter(Boolean);
    const t = deps.length ? Math.max(...deps.map(tierOf)) + 1 : 0;
    visiting.delete(n.id);
    memo[n.id] = t;
    return t;
  }
  const out = {};
  for (const n of nodes) out[n.id] = tierOf(n);
  return out;
}

/**
 * Layered layout: tiers become columns (ltr) or rows (ttb). Lane within a tier
 * is a single-pass barycenter of dependency lanes, ties broken by input order.
 */
function layout(nodes, direction) {
  const tierOf = computeTiers(nodes);
  const tierCount = nodes.length ? Math.max(...Object.values(tierOf)) + 1 : 0;
  const groups = Array.from({ length: tierCount }, () => []);
  nodes.forEach((n, idx) => groups[tierOf[n.id]].push({ n, idx }));

  const lane = {};
  for (const group of groups) {
    const scored = group.map(({ n, idx }) => {
      const depLanes = (n.dependsOn || [])
        .map((id) => lane[id])
        .filter((v) => v != null);
      const bary = depLanes.length
        ? depLanes.reduce((a, b) => a + b, 0) / depLanes.length
        : idx;
      return { n, idx, bary };
    });
    scored.sort((a, b) => a.bary - b.bary || a.idx - b.idx);
    const offset = (scored.length - 1) / 2;
    scored.forEach((s, slot) => { lane[s.n.id] = slot - offset; });
  }

  const tierPitch = (direction === 'ttb' ? NODE_H : NODE_W) + GAP_TIER;
  const lanePitch = direction === 'ttb'
    ? NODE_W + GAP_LANE
    : NODE_H + GAP_LANE;

  const pos = {};
  for (const n of nodes) {
    const t = tierOf[n.id] * tierPitch;
    const l = lane[n.id] * lanePitch;
    pos[n.id] = direction === 'ttb' ? { x: l, y: t } : { x: t, y: l };
  }
  const tiers = Array.from({ length: tierCount }, (_, t) => ({
    tier: t,
    at: t * tierPitch,
  }));
  return { pos, tiers, tierOf };
}

function edgeAnchors(a, b, direction) {
  if (direction === 'ttb') {
    return {
      from: { x: a.x + NODE_W / 2, y: a.y + NODE_H },
      to: { x: b.x + NODE_W / 2, y: b.y },
    };
  }
  return {
    from: { x: a.x + NODE_W, y: a.y + NODE_H / 2 },
    to: { x: b.x, y: b.y + NODE_H / 2 },
  };
}

function edgePath(a, b, direction) {
  const { from, to } = edgeAnchors(a, b, direction);
  if (direction === 'ttb') {
    const midY = (from.y + to.y) / 2;
    return `M${from.x},${from.y} V${midY} H${to.x} V${to.y}`;
  }
  const midX = (from.x + to.x) / 2;
  return `M${from.x},${from.y} H${midX} V${to.y} H${to.x}`;
}

/**
 * CpDepGraph(root, opts)
 *   → { select, getSelection, setState, replaceModel, fit, zoomTo, destroy }
 *
 * opts: {
 *   nodes: [{ id, label, tier?, state, dependsOn?, owner?, estimate?, color?, desc? }],
 *   direction?: 'ltr' | 'ttb',
 *   onSelect?, onAdvance?, onHover?,
 * }
 */
export function CpDepGraph(root, opts = {}) {
  let nodes = (opts.nodes || []).map((n) => ({ ...n }));
  let direction = opts.direction === 'ttb' ? 'ttb' : 'ltr';
  const byId = () => Object.fromEntries(nodes.map((n) => [n.id, n]));

  instanceCounter += 1;
  const uid = instanceCounter;
  let selected = null;
  let cam = { x: 0, y: 0, z: 1 };
  let dragging = null;
  let dragMoved = false;
  let userCam = false;
  let placed = {};

  root.classList.add('cp-depgraph');
  root.innerHTML = `
    <svg class="cp-depgraph__svg" role="img">
      <g class="cp-depgraph__viewport"></g>
    </svg>
    <div class="cp-depgraph__tip" hidden></div>
  `;
  const world = root.querySelector('.cp-depgraph__viewport');
  const tip = root.querySelector('.cp-depgraph__tip');

  function depChain(id) {
    const rel = new Set();
    const map = byId();
    const walk = (nid) => {
      for (const did of map[nid]?.dependsOn || []) {
        if (!rel.has(did) && map[did]) {
          rel.add(did);
          walk(did);
        }
      }
    };
    walk(id);
    return rel;
  }

  function edgeList() {
    const map = byId();
    const edges = [];
    for (const n of nodes) {
      for (const did of n.dependsOn || []) {
        if (map[did]) edges.push({ from: did, to: n.id });
      }
    }
    return edges;
  }

  function edgeState(e) {
    const map = byId();
    const from = map[e.from];
    const to = map[e.to];
    if (isDone(from) && isDone(to)) return 'is-done';
    if (isDone(from)) return 'is-active';
    return '';
  }

  function nodeFrame(x, y) {
    return `x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="${NODE_R}"`;
  }

  function nodeMarkup(n, idx) {
    const { x, y } = placed[n.id];
    const color = n.color ? ` style="--node-color:${esc(n.color)}"` : '';
    const hasMeta = n.owner != null || n.estimate != null;
    const labelY = hasMeta ? y + 23 : y + NODE_H / 2 + 4;
    const dotY = labelY - 4;
    // SVG text neither wraps nor ellipsizes — clip node content to the frame,
    // and clip the owner short of the estimate so the two can't overlap.
    const clipId = `cp-dg-${uid}-${idx}`;
    const ownerClipId = `${clipId}-o`;
    const ownerMaxW = n.estimate != null ? NODE_W - 64 : NODE_W;
    const owner = n.owner != null
      ? `<clipPath id="${ownerClipId}"><rect x="${x}" y="${y}" width="${ownerMaxW}" height="${NODE_H}" /></clipPath>
         <text class="cp-depgraph-node__owner" clip-path="url(#${ownerClipId})" x="${x + 28}" y="${y + NODE_H - 12}">${esc(n.owner)}</text>`
      : '';
    const estimate = n.estimate != null
      ? `<text class="cp-depgraph-node__estimate" x="${x + NODE_W - 12}" y="${y + NODE_H - 12}">${esc(n.estimate)}</text>`
      : '';
    return `
      <g class="cp-depgraph-node is-${stateOf(n)}" data-id="${esc(n.id)}" tabindex="0"${color}>
        <clipPath id="${clipId}"><rect ${nodeFrame(x, y)} /></clipPath>
        <rect class="cp-depgraph-node__frame" ${nodeFrame(x, y)} />
        <g clip-path="url(#${clipId})">
          <circle class="cp-depgraph-node__dot" cx="${x + 16}" cy="${dotY}" r="4" />
          <text class="cp-depgraph-node__label" x="${x + 28}" y="${labelY}">${esc(n.label)}</text>
          ${owner}
          ${estimate}
        </g>
      </g>
    `;
  }

  function paint() {
    const { pos, tiers } = layout(nodes, direction);
    placed = pos;
    if (!nodes.length) {
      world.innerHTML = '';
      return;
    }

    const bounds = paintBounds();
    const tierLabels = tiers.map(({ tier, at }) => {
      const x = direction === 'ttb' ? bounds.minX - 26 : at + NODE_W / 2;
      const y = direction === 'ttb' ? at + NODE_H / 2 : bounds.minY - 22;
      return `<text class="cp-depgraph__tier-label" x="${x}" y="${y}">Phase ${tier + 1}</text>`;
    }).join('');

    const edgeMarkup = edgeList().map((e) => {
      const d = edgePath(placed[e.from], placed[e.to], direction);
      return `<path class="cp-depgraph-edge ${edgeState(e)}" data-from="${esc(e.from)}" data-to="${esc(e.to)}" d="${d}" />`;
    }).join('');

    world.innerHTML = `
      ${tierLabels}
      <g class="cp-depgraph__edges">${edgeMarkup}</g>
      <g class="cp-depgraph__nodes">${nodes.map(nodeMarkup).join('')}</g>
    `;

    bindNodeEvents();
    syncSelection();
    applyCam();
  }

  function paintBounds() {
    const xs = Object.values(placed);
    if (!xs.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    return {
      minX: Math.min(...xs.map((p) => p.x)),
      minY: Math.min(...xs.map((p) => p.y)),
      maxX: Math.max(...xs.map((p) => p.x + NODE_W)),
      maxY: Math.max(...xs.map((p) => p.y + NODE_H)),
    };
  }

  function applyCam() {
    const { width, height } = root.getBoundingClientRect();
    world.setAttribute(
      'transform',
      `translate(${width / 2 + cam.x},${height / 2 + cam.y}) scale(${cam.z})`,
    );
  }

  function toScreen(x, y) {
    const { width, height } = root.getBoundingClientRect();
    return {
      x: width / 2 + cam.x + x * cam.z,
      y: height / 2 + cam.y + y * cam.z,
    };
  }

  function showTip(id) {
    const n = byId()[id];
    if (!n) {
      tip.hidden = true;
      return;
    }
    const map = byId();
    const deps = (n.dependsOn || []).map((did) => {
      const d = map[did];
      const met = d && isDone(d);
      return `<span class="cp-depgraph__tip-dep cp-depgraph__tip-dep--${met ? 'met' : 'unmet'}"><span class="cp-depgraph__tip-dep-mark" aria-hidden="true">${met ? '✓' : '○'}</span>${esc(d ? d.label : did)}</span>`;
    }).join('');
    const row = (label, value) => `<span class="cp-depgraph__tip-row"><span class="cp-depgraph__tip-row-label">${label}</span><span class="cp-depgraph__tip-row-value">${value}</span></span>`;
    tip.innerHTML = `
      <strong class="cp-depgraph__tip-title">${esc(n.label)}</strong>
      ${row('Status', STATE_LABELS[stateOf(n)])}
      ${n.owner != null ? row('Owner', esc(n.owner)) : ''}
      ${n.estimate != null ? row('Estimate', esc(n.estimate)) : ''}
      ${n.desc ? `<span class="cp-depgraph__tip-desc">${esc(n.desc)}</span>` : ''}
      ${deps ? `<span class="cp-depgraph__tip-deps"><span class="cp-depgraph__tip-deps-title">Depends on</span>${deps}</span>` : ''}
    `;
    tip.hidden = false;
    const p = placed[n.id];
    const { width, height } = root.getBoundingClientRect();
    const nodeLeft = toScreen(p.x, p.y);
    const nodeRight = toScreen(p.x + NODE_W, p.y + NODE_H);
    // Measure the rendered tip, prefer the node's right side, then clamp.
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;
    let left = nodeRight.x + 10;
    if (left + tipW > width - 8) left = nodeLeft.x - tipW - 10;
    left = Math.min(Math.max(8, left), Math.max(8, width - tipW - 8));
    let top = nodeLeft.y;
    if (top + tipH > height - 8) top = nodeRight.y - tipH;
    top = Math.min(Math.max(8, top), Math.max(8, height - tipH - 8));
    tip.style.right = '';
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function bindNodeEvents() {
    root.querySelectorAll('.cp-depgraph-node').forEach((nodeEl) => {
      const id = nodeEl.dataset.id;
      nodeEl.addEventListener('pointerenter', () => {
        nodeEl.classList.add('is-hovered');
        showTip(id);
        opts.onHover?.(id);
      });
      nodeEl.addEventListener('pointerleave', () => {
        nodeEl.classList.remove('is-hovered');
        tip.hidden = true;
        opts.onHover?.(null);
      });
      nodeEl.addEventListener('click', (ev) => {
        ev.stopPropagation();
        activate(id);
      });
      nodeEl.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          activate(id);
        }
      });
    });
  }

  /** Select on first activation; advance request on activating the selection. */
  function activate(id) {
    const n = byId()[id];
    const s = n ? stateOf(n) : null;
    if (selected === id && n && (s === 'ready' || s === 'in-progress')) {
      opts.onAdvance?.(id, n);
      return;
    }
    select(id);
  }

  function syncSelection() {
    root.classList.toggle('is-focusing', Boolean(selected));
    root.querySelectorAll('.is-selected, .is-related').forEach((el) => {
      el.classList.remove('is-selected', 'is-related');
    });
    if (!selected) return;
    const rel = depChain(selected);
    root.querySelectorAll('.cp-depgraph-node').forEach((el) => {
      if (el.dataset.id === selected) el.classList.add('is-selected');
      else if (rel.has(el.dataset.id)) el.classList.add('is-related');
    });
    root.querySelectorAll('.cp-depgraph-edge').forEach((el) => {
      const onChain = (rel.has(el.dataset.from) || el.dataset.from === selected)
        && (rel.has(el.dataset.to) || el.dataset.to === selected);
      if (onChain) el.classList.add('is-related');
    });
  }

  function select(id) {
    selected = id;
    syncSelection();
    if (id) showTip(id);
    else tip.hidden = true;
    opts.onSelect?.(id, id ? byId()[id] : null);
  }

  function setState(id, state) {
    const n = byId()[id];
    if (!n || !STATES.includes(state)) return;
    n.state = state;
    paint();
    if (selected) showTip(selected);
  }

  /** Scale at which the whole scene fits the viewport. Padding shrinks on small hosts. */
  function fitScale(width, height, padding = 60) {
    const b = paintBounds();
    const w = Math.max(1, b.maxX - b.minX);
    const h = Math.max(1, b.maxY - b.minY);
    const pad = Math.min(padding, width / 8, height / 8);
    return { bounds: b, z: Math.min((width - pad * 2) / w, (height - pad * 2) / h, 1.4) };
  }

  function fit(padding = 60) {
    if (!nodes.length) return;
    const { width, height } = root.getBoundingClientRect();
    if (width < 40 || height < 40) return;
    const { bounds: b, z } = fitScale(width, height, padding);
    cam.z = z;
    cam.x = -((b.minX + b.maxX) / 2) * cam.z;
    cam.y = -((b.minY + b.maxY) / 2) * cam.z;
    userCam = false;
    applyCam();
  }

  function zoomTo(id) {
    const p = placed[id];
    if (!p) return;
    cam.z = Math.max(cam.z, 1);
    cam.x = -(p.x + NODE_W / 2) * cam.z;
    cam.y = -(p.y + NODE_H / 2) * cam.z;
    userCam = true;
    applyCam();
    if (selected) showTip(selected);
  }

  function onPointerDown(ev) {
    if (ev.target.closest('.cp-depgraph-node')) return;
    dragging = { x: ev.clientX - cam.x, y: ev.clientY - cam.y };
    dragMoved = false;
    root.setPointerCapture(ev.pointerId);
  }

  function onPointerMove(ev) {
    if (!dragging) return;
    cam.x = ev.clientX - dragging.x;
    cam.y = ev.clientY - dragging.y;
    dragMoved = true;
    userCam = true;
    applyCam();
    if (selected && tip.hidden === false) showTip(selected);
  }

  function onPointerUp() {
    dragging = null;
  }

  function onWheel(ev) {
    ev.preventDefault();
    const r = root.getBoundingClientRect();
    const mx = ev.clientX - r.left - r.width / 2;
    const my = ev.clientY - r.top - r.height / 2;
    const prev = cam.z;
    // Never trap the user above fit scale — small hosts may need to zoom below 0.25.
    // Epsilon floor: a zero-size host yields fit scale 0, which would NaN the camera.
    const minZ = Math.max(0.001, Math.min(0.25, fitScale(r.width, r.height).z));
    const next = Math.min(2.4, Math.max(minZ, cam.z * (ev.deltaY > 0 ? 0.92 : 1.08)));
    const k = next / prev;
    cam.x = mx - (mx - cam.x) * k;
    cam.y = my - (my - cam.y) * k;
    cam.z = next;
    userCam = true;
    applyCam();
    if (selected && tip.hidden === false) showTip(selected);
  }

  function onBgClick(ev) {
    if (dragMoved) return;
    if (ev.target.closest('.cp-depgraph-node')) return;
    select(null);
  }

  const ro = new ResizeObserver(() => {
    if (!userCam) fit();
    else applyCam();
    if (selected && !tip.hidden) showTip(selected);
  });
  ro.observe(root);
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('click', onBgClick);
  paint();
  requestAnimationFrame(() => fit());

  return {
    select,
    getSelection: () => selected,
    setState,
    replaceModel(next = {}) {
      nodes = (next.nodes || []).map((n) => ({ ...n }));
      if (next.direction) direction = next.direction === 'ttb' ? 'ttb' : 'ltr';
      if (selected && !byId()[selected]) {
        selected = null;
        opts.onSelect?.(null, null);
      }
      paint();
      if (selected && !tip.hidden) showTip(selected);
      if (!userCam) fit();
    },
    fit,
    zoomTo,
    destroy() {
      ro.disconnect();
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('click', onBgClick);
      root.innerHTML = '';
    },
  };
}
