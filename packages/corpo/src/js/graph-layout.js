/**
 * corpo/graph-layout.js
 * Shared graph layout algorithms for the scene engines. No dependencies.
 * - computeTiers: longest-path layering (used by CpDepGraph and tierLayout)
 * - tierLayout / radialLayout: synchronous position assignment
 * - createForceWorker: Barnes-Hut force simulation in a Web Worker, built from
 *   a Blob so the package stays a plain file export with no bundler coupling.
 */

/** Longest path from roots, honoring explicit `tier` overrides on nodes. */
export function computeTiers(nodes, getDeps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const memo = new Map();
  const visiting = new Set();
  function tierOf(n) {
    if (Number.isFinite(n.tier)) return n.tier;
    if (memo.has(n.id)) return memo.get(n.id);
    if (visiting.has(n.id)) return 0; // cycle guard
    visiting.add(n.id);
    const deps = getDeps(n).map((id) => byId.get(id)).filter(Boolean);
    const t = deps.length ? Math.max(...deps.map(tierOf)) + 1 : 0;
    visiting.delete(n.id);
    memo.set(n.id, t);
    return t;
  }
  const out = {};
  for (const n of nodes) out[n.id] = tierOf(n);
  return out;
}

function adjacency(nodes, edges) {
  const nbrs = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    nbrs.get(e.source)?.push(e.target);
    nbrs.get(e.target)?.push(e.source);
  }
  return nbrs;
}

/**
 * Layered left-to-right positions from edge direction (source before target).
 * One barycenter pass orders each tier by the mean position of its inbound
 * neighbors to reduce crossings.
 */
export function tierLayout(nodes, edges, { gapX = 90, gapY = 26 } = {}) {
  const inbound = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) inbound.get(e.target)?.push(e.source);
  const tiers = computeTiers(nodes, (n) => inbound.get(n.id) ?? []);

  const columns = new Map();
  for (const n of nodes) {
    const t = tiers[n.id];
    const col = columns.get(t);
    if (col) col.push(n);
    else columns.set(t, [n]);
  }

  const pos = new Map();
  for (const t of [...columns.keys()].sort((a, b) => a - b)) {
    const col = columns.get(t);
    col.sort((a, b) => {
      const mean = (n) => {
        const deps = inbound.get(n.id) ?? [];
        const ys = deps.map((id) => pos.get(id)?.y).filter((y) => y !== undefined);
        return ys.length ? ys.reduce((s, y) => s + y, 0) / ys.length : 0;
      };
      return mean(a) - mean(b);
    });
    col.forEach((n, i) => pos.set(n.id, { x: t * gapX, y: (i - (col.length - 1) / 2) * gapY }));
  }
  return pos;
}

/**
 * Concentric BFS rings per connected component, rooted at each component's
 * highest-degree node; components pack left to right.
 */
export function radialLayout(nodes, edges, { ringGap = 70, minArc = 16 } = {}) {
  const nbrs = adjacency(nodes, edges);
  const degree = new Map(nodes.map((n) => [n.id, nbrs.get(n.id).length]));
  const pos = new Map();
  const seen = new Set();
  const byDegree = [...nodes].sort((a, b) => degree.get(b.id) - degree.get(a.id));

  let offsetX = 0;
  for (const rootNode of byDegree) {
    if (seen.has(rootNode.id)) continue;

    // BFS rings; children inherit the parent's angle for the ring ordering.
    const rings = [[{ id: rootNode.id, angle: 0 }]];
    seen.add(rootNode.id);
    const angleOf = new Map([[rootNode.id, 0]]);
    while (true) {
      const ring = [];
      for (const { id } of rings[rings.length - 1]) {
        for (const next of nbrs.get(id)) {
          if (seen.has(next)) continue;
          seen.add(next);
          ring.push({ id: next, angle: angleOf.get(id) });
        }
      }
      if (!ring.length) break;
      ring.sort((a, b) => a.angle - b.angle);
      ring.forEach((entry, i) => angleOf.set(entry.id, (i / ring.length) * Math.PI * 2));
      rings.push(ring);
    }

    let maxR = 0;
    for (let depth = 0; depth < rings.length; depth++) {
      const ring = rings[depth];
      const r = depth === 0 ? 0 : Math.max(ringGap * depth, (ring.length * minArc) / (Math.PI * 2));
      if (r > maxR) maxR = r;
      for (const { id } of ring) {
        const a = angleOf.get(id);
        pos.set(id, { x: offsetX + Math.cos(a) * r, y: Math.sin(a) * r });
      }
    }
    offsetX += maxR * 2 + ringGap * 2;
  }
  return pos;
}

/**
 * Runs inside the worker; serialized into a Blob, so it must be fully
 * self-contained. Protocol: one init message {pos, edges, n, m}; the worker
 * streams {pos, alpha, done} batches (position buffer transferred) until the
 * simulation cools. Terminate the worker to stop early.
 */
function forceWorkerBody() {
  self.onmessage = (ev) => {
    const { pos, edges, n, m } = ev.data;
    if (!n) {
      self.postMessage({ pos, alpha: 0, done: true }, [pos.buffer]);
      return;
    }
    const vel = new Float32Array(2 * n);
    const deg = new Float32Array(n);
    for (let e = 0; e < m; e++) {
      deg[edges[2 * e]]++;
      deg[edges[2 * e + 1]]++;
    }

    const LINK_DIST = 30;
    const CHARGE = -180;
    const THETA2 = 0.81;
    const VELOCITY_DECAY = 0.6;
    const ALPHA_MIN = 0.005;
    const alphaDecay = 1 - ALPHA_MIN ** (1 / 250);
    let alpha = 1;

    function buildTree() {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < n; i++) {
        const x = pos[2 * i], y = pos[2 * i + 1];
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      const size = Math.max(x1 - x0, y1 - y0) || 1;
      const root = { x: x0, y: y0, s: size, cx: 0, cy: 0, mass: 0, kids: null, idx: -1 };
      for (let i = 0; i < n; i++) insert(root, i, 0);
      return root;
    }

    function insert(node, i, depth) {
      const x = pos[2 * i], y = pos[2 * i + 1];
      node.cx = (node.cx * node.mass + x) / (node.mass + 1);
      node.cy = (node.cy * node.mass + y) / (node.mass + 1);
      node.mass++;
      if (node.mass === 1) {
        node.idx = i;
        return;
      }
      if (!node.kids) {
        if (depth > 24) return; // coincident points; mass already counted
        node.kids = [null, null, null, null];
        const prev = node.idx;
        node.idx = -1;
        place(node, prev, depth);
      }
      place(node, i, depth);
    }

    function place(node, i, depth) {
      const h = node.s / 2;
      const qx = pos[2 * i] >= node.x + h ? 1 : 0;
      const qy = pos[2 * i + 1] >= node.y + h ? 1 : 0;
      const q = qy * 2 + qx;
      let kid = node.kids[q];
      if (!kid) {
        kid = { x: node.x + qx * h, y: node.y + qy * h, s: h, cx: 0, cy: 0, mass: 0, kids: null, idx: -1 };
        node.kids[q] = kid;
      }
      insert(kid, i, depth + 1);
    }

    function repulse(root, i) {
      const x = pos[2 * i], y = pos[2 * i + 1];
      let fx = 0, fy = 0;
      const stack = [root];
      while (stack.length) {
        const node = stack.pop();
        if (!node || !node.mass) continue;
        let dx = node.cx - x;
        let dy = node.cy - y;
        let d2 = dx * dx + dy * dy;
        const external = (node.s * node.s) / d2 < THETA2;
        if (external || !node.kids) {
          if (node.idx === i && !node.kids) continue;
          if (d2 < 1) {
            dx = (i % 7) - 3 || 0.5; // deterministic jitter for coincident points
            dy = (i % 5) - 2 || 0.5;
            d2 = dx * dx + dy * dy;
          }
          const f = (CHARGE * alpha * node.mass) / d2;
          fx += dx * f;
          fy += dy * f;
          continue;
        }
        for (const kid of node.kids) if (kid) stack.push(kid);
      }
      vel[2 * i] += fx;
      vel[2 * i + 1] += fy;
    }

    function step() {
      const root = buildTree();
      for (let i = 0; i < n; i++) repulse(root, i);

      for (let e = 0; e < m; e++) {
        const s = edges[2 * e], t = edges[2 * e + 1];
        let dx = pos[2 * t] + vel[2 * t] - pos[2 * s] - vel[2 * s];
        let dy = pos[2 * t + 1] + vel[2 * t + 1] - pos[2 * s + 1] - vel[2 * s + 1];
        if (!dx && !dy) dx = 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const strength = 1 / Math.min(deg[s], deg[t]);
        const f = ((dist - LINK_DIST) / dist) * strength * alpha;
        const bias = deg[s] / (deg[s] + deg[t]);
        vel[2 * t] -= dx * f * bias;
        vel[2 * t + 1] -= dy * f * bias;
        vel[2 * s] += dx * f * (1 - bias);
        vel[2 * s + 1] += dy * f * (1 - bias);
      }

      let mx = 0, my = 0;
      for (let i = 0; i < n; i++) {
        vel[2 * i] *= VELOCITY_DECAY;
        vel[2 * i + 1] *= VELOCITY_DECAY;
        pos[2 * i] += vel[2 * i];
        pos[2 * i + 1] += vel[2 * i + 1];
        mx += pos[2 * i];
        my += pos[2 * i + 1];
      }
      mx /= n;
      my /= n;
      for (let i = 0; i < n; i++) {
        pos[2 * i] -= mx;
        pos[2 * i + 1] -= my;
      }
      alpha += (0 - alpha) * alphaDecay;
    }

    function batch() {
      const t0 = performance.now();
      while (performance.now() - t0 < 12 && alpha > ALPHA_MIN) step();
      const done = alpha <= ALPHA_MIN;
      const out = pos.slice();
      self.postMessage({ pos: out, alpha, done }, [out.buffer]);
      if (!done) setTimeout(batch, 0);
    }
    batch();
  };
}

export function createForceWorker() {
  const src = `(${forceWorkerBody.toString()})()`;
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
