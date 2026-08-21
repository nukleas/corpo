/**
 * corpo/charts.js
 * SVG business charts: CpLineChart, CpBarChart, CpSparkline. No dependencies.
 * Fills/strokes come from .cp-chart-* CSS (token-only). JS owns geometry + interaction.
 *
 * Series colors follow the fixed categorical order --corpo-chart-1…5 —
 * assigned by index, never re-assigned when series are filtered. More than
 * five series render in the neutral overflow color: fold extras into an
 * "Other" series instead of adding hues.
 */

const MARGIN = { top: 12, right: 16, bottom: 26, left: 48 };
const MAX_SERIES = 5;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function defaultFormat(v) {
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Compact axis labels (150k / 1.2M) — full values live in the tooltip. */
function axisFormat(v) {
  const abs = Math.abs(v);
  if (abs >= 1e6) return `${Number((v / 1e6).toFixed(1))}M`;
  if (abs >= 1e3) return `${Number((v / 1e3).toFixed(1))}k`;
  return defaultFormat(v);
}

/** Round tick steps covering [min, max] with ~count intervals. */
function niceTicks(min, max, count = 4) {
  if (min === max) max = min + 1;
  const span = max - min;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? step0;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e9) / 1e9);
  return { lo, hi, ticks };
}

function seriesClass(i) {
  return i < MAX_SERIES ? `cp-chart-series--${i + 1}` : 'cp-chart-series--overflow';
}

function seriesStyle(s) {
  return s.color ? ` style="--series-color:${esc(s.color)}"` : '';
}

function frame(root, variantClass) {
  root.classList.add('cp-chart');
  if (variantClass) root.classList.add(variantClass);
  root.innerHTML = `
    <div class="cp-chart__legend" hidden></div>
    <div class="cp-chart__plot">
      <svg class="cp-chart__svg" role="img"></svg>
      <div class="cp-chart__tip" hidden></div>
    </div>
  `;
  return {
    legend: root.querySelector('.cp-chart__legend'),
    plot: root.querySelector('.cp-chart__plot'),
    svg: root.querySelector('.cp-chart__svg'),
    tip: root.querySelector('.cp-chart__tip'),
  };
}

/** Legend renders only for 2+ series — a single series is named by the host UI. */
function renderLegend(legend, series) {
  if (series.length < 2) {
    legend.hidden = true;
    legend.innerHTML = '';
    return;
  }
  legend.hidden = false;
  legend.innerHTML = series
    .map((s, i) => `
      <span class="cp-chart__legend-item ${seriesClass(i)}"${seriesStyle(s)}>
        <span class="cp-chart__legend-chip" aria-hidden="true"></span>${esc(s.label)}
      </span>
    `)
    .join('');
}

function placeTip(tip, plot, anchorX, anchorY) {
  const { width, height } = plot.getBoundingClientRect();
  const tipW = tip.offsetWidth;
  const tipH = tip.offsetHeight;
  let left = anchorX + 12;
  if (left + tipW > width - 4) left = anchorX - tipW - 12;
  left = Math.min(Math.max(4, left), Math.max(4, width - tipW - 4));
  let top = anchorY - tipH / 2;
  top = Math.min(Math.max(4, top), Math.max(4, height - tipH - 4));
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

function tipRows(series, index, yFormat) {
  return series
    .map((s, i) => {
      const v = s.data[index];
      if (v == null) return '';
      return `
        <span class="cp-chart__tip-row ${seriesClass(i)}"${seriesStyle(s)}>
          <span class="cp-chart__legend-chip" aria-hidden="true"></span>
          <span class="cp-chart__tip-label">${esc(s.label)}</span>
          <span class="cp-chart__tip-value">${esc(yFormat(v))}</span>
        </span>
      `;
    })
    .join('');
}

function yDomain(series) {
  let min = 0;
  let max = 1;
  let any = false;
  for (const s of series) {
    for (const v of s.data) {
      if (v == null) continue;
      if (!any) { min = Math.min(0, v); max = v; any = true; }
      else { min = Math.min(min, v); max = Math.max(max, v); }
    }
  }
  if (!any) return { min: 0, max: 1 };
  if (min === max) max = min + 1;
  return { min: Math.min(0, min), max };
}

function axesMarkup(ticks, yScale, xLabels, xAt, innerRight) {
  const grid = ticks.ticks
    .map((t) => {
      const y = yScale(t);
      return `
        <line class="cp-chart__grid" x1="${MARGIN.left}" y1="${y}" x2="${innerRight}" y2="${y}" />
        <text class="cp-chart__y-label" x="${MARGIN.left - 8}" y="${y + 3.5}">${esc(axisFormat(t))}</text>
      `;
    })
    .join('');
  // Thin x labels when they can't fit side by side (~6.5px/char at 11px)
  const pitch = xLabels.length > 1 ? Math.abs(xAt(1) - xAt(0)) : Infinity;
  const maxChars = Math.max(1, ...xLabels.map((l) => String(l).length));
  const step = Math.max(1, Math.ceil((maxChars * 6.5 + 8) / pitch));
  const xs = xLabels
    .map((l, i) => (i % step
      ? ''
      : `<text class="cp-chart__x-label" x="${xAt(i)}" y="0" data-i="${i}">${esc(l)}</text>`))
    .join('');
  return { grid, xs };
}

function setupCommon(root, opts) {
  const els = frame(root, opts.variantClass);
  const state = {
    series: (opts.series || []).map((s) => ({ ...s, data: [...(s.data || [])] })),
    labels: [...(opts.labels || [])],
    yFormat: opts.yFormat || defaultFormat,
  };
  return { els, state };
}

/**
 * CpLineChart(root, { series, labels, yFormat }) → { update, destroy }
 * series: [{ label, data: (number|null)[], color? }] — points align to `labels`.
 * Crosshair + shared tooltip on hover; 2px lines; 8px hover markers.
 */
export function CpLineChart(root, opts = {}) {
  const { els, state } = setupCommon(root, { ...opts, variantClass: 'cp-chart--line' });
  const { legend, plot, svg, tip } = els;
  let geom = null;

  function paint() {
    renderLegend(legend, state.series);
    const { width, height } = plot.getBoundingClientRect();
    if (width < 60 || height < 60 || !state.series.length) {
      svg.innerHTML = '';
      geom = null;
      return;
    }
    const n = Math.max(state.labels.length, ...state.series.map((s) => s.data.length), 2);
    const innerRight = width - MARGIN.right;
    const innerBottom = height - MARGIN.bottom;
    const dom = yDomain(state.series);
    const ticks = niceTicks(dom.min, dom.max);
    const yScale = (v) => innerBottom - ((v - ticks.lo) / (ticks.hi - ticks.lo)) * (innerBottom - MARGIN.top);
    const xAt = (i) => MARGIN.left + (i / (n - 1)) * (innerRight - MARGIN.left);
    geom = { n, xAt, yScale, innerBottom, innerRight };

    const { grid, xs } = axesMarkup(ticks, yScale, state.labels, xAt, innerRight);
    const lines = state.series
      .map((s, si) => {
        const d = s.data
          .map((v, i) => (v == null ? null : `${i === 0 || s.data[i - 1] == null ? 'M' : 'L'}${xAt(i)},${yScale(v)}`))
          .filter(Boolean)
          .join(' ');
        return `<g class="${seriesClass(si)}"${seriesStyle(s)}><path class="cp-chart__line" d="${d}" /></g>`;
      })
      .join('');

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = `
      ${grid}
      <g transform="translate(0,${innerBottom + 16})">${xs}</g>
      ${lines}
      <g class="cp-chart__hover-layer"></g>
      <rect class="cp-chart__overlay" x="${MARGIN.left}" y="${MARGIN.top}"
        width="${innerRight - MARGIN.left}" height="${innerBottom - MARGIN.top}" />
    `;
    bindHover();
  }

  function bindHover() {
    const overlay = svg.querySelector('.cp-chart__overlay');
    const layer = svg.querySelector('.cp-chart__hover-layer');
    overlay.addEventListener('pointermove', (ev) => {
      if (!geom) return;
      const rect = plot.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const i = Math.max(0, Math.min(geom.n - 1,
        Math.round(((px - MARGIN.left) / (geom.innerRight - MARGIN.left)) * (geom.n - 1))));
      const x = geom.xAt(i);
      layer.innerHTML = `
        <line class="cp-chart__crosshair" x1="${x}" y1="${MARGIN.top}" x2="${x}" y2="${geom.innerBottom}" />
        ${state.series
          .map((s, si) => {
            const v = s.data[i];
            if (v == null) return '';
            return `<g class="${seriesClass(si)}"${seriesStyle(s)}><circle class="cp-chart__marker" cx="${x}" cy="${geom.yScale(v)}" r="4" /></g>`;
          })
          .join('')}
      `;
      tip.innerHTML = `
        <strong class="cp-chart__tip-title">${esc(state.labels[i] ?? i + 1)}</strong>
        ${tipRows(state.series, i, state.yFormat)}
      `;
      tip.hidden = false;
      placeTip(tip, plot, x, ev.clientY - rect.top);
    });
    overlay.addEventListener('pointerleave', () => {
      layer.innerHTML = '';
      tip.hidden = true;
    });
  }

  const ro = new ResizeObserver(() => paint());
  ro.observe(root);
  requestAnimationFrame(paint);

  return {
    update(next = {}) {
      if (next.series) state.series = next.series.map((s) => ({ ...s, data: [...(s.data || [])] }));
      if (next.labels) state.labels = [...next.labels];
      if (next.yFormat) state.yFormat = next.yFormat;
      paint();
    },
    destroy() {
      ro.disconnect();
      root.innerHTML = '';
      root.classList.remove('cp-chart', 'cp-chart--line');
    },
  };
}

/**
 * CpBarChart(root, { series, labels, yFormat, stacked }) → { update, destroy }
 * Non-negative bars: grouped by default, stacked with `stacked: true`.
 * 4px rounded data-ends (the stack top when stacked), 2px surface gaps
 * between adjacent bars and between stacked fills, per-segment tooltip.
 */
export function CpBarChart(root, opts = {}) {
  const { els, state } = setupCommon(root, { ...opts, variantClass: 'cp-chart--bar' });
  state.stacked = Boolean(opts.stacked);
  const { legend, plot, svg, tip } = els;

  function barPath(x, yTop, w, h, r) {
    if (h <= 0 || w <= 0) return '';
    const rr = Math.min(r, w / 2, h);
    return `M${x},${yTop + h} L${x},${yTop + rr} Q${x},${yTop} ${x + rr},${yTop} L${x + w - rr},${yTop} Q${x + w},${yTop} ${x + w},${yTop + rr} L${x + w},${yTop + h} Z`;
  }

  function stackTotals(n) {
    return Array.from({ length: n }, (_, i) =>
      state.series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0));
  }

  function paint() {
    renderLegend(legend, state.series);
    const { width, height } = plot.getBoundingClientRect();
    if (width < 60 || height < 60 || !state.series.length) {
      svg.innerHTML = '';
      return;
    }
    const n = Math.max(state.labels.length, ...state.series.map((s) => s.data.length), 1);
    const k = state.series.length;
    const innerRight = width - MARGIN.right;
    const innerBottom = height - MARGIN.bottom;
    const maxVal = state.stacked ? Math.max(...stackTotals(n), 1) : yDomain(state.series).max;
    const ticks = niceTicks(0, maxVal);
    const yScale = (v) => innerBottom - ((v - ticks.lo) / (ticks.hi - ticks.lo)) * (innerBottom - MARGIN.top);
    const groupW = (innerRight - MARGIN.left) / n;
    const band = groupW * (state.stacked ? 0.55 : 0.72);
    const gap = 2;
    const barW = state.stacked ? band : Math.max(2, (band - gap * (k - 1)) / k);
    const xCenter = (i) => MARGIN.left + groupW * i + groupW / 2;

    const { grid, xs } = axesMarkup(ticks, yScale, state.labels, xCenter, innerRight);
    let bars;
    if (state.stacked) {
      // topmost non-null segment per column gets the rounded data-end
      const topSeries = Array.from({ length: n }, (_, i) => {
        for (let si = k - 1; si >= 0; si -= 1) if (state.series[si].data[i]) return si;
        return -1;
      });
      bars = state.series
        .map((s, si) => {
          const rects = s.data
            .map((v, i) => {
              if (!v) return '';
              const below = state.series.slice(0, si).reduce((sum, ss) => sum + (ss.data[i] ?? 0), 0);
              const x = xCenter(i) - band / 2;
              const yTop = yScale(below + v);
              // 2px surface gap between fills — trim the bottom of every
              // segment that sits on another fill
              const yBottom = yScale(below) - (below > 0 ? gap : 0);
              const h = yBottom - yTop;
              const isTop = topSeries[i] === si;
              const d = isTop
                ? barPath(x, yTop, barW, h, 4)
                : `M${x},${yTop} H${x + barW} V${yBottom} H${x} Z`;
              return `<path class="cp-chart__bar" data-series="${si}" data-i="${i}" d="${d}" />`;
            })
            .join('');
          return `<g class="${seriesClass(si)}"${seriesStyle(s)}>${rects}</g>`;
        })
        .join('');
    } else {
      bars = state.series
        .map((s, si) => {
          const rects = s.data
            .map((v, i) => {
              if (v == null) return '';
              const x = xCenter(i) - band / 2 + si * (barW + gap);
              const yTop = yScale(v);
              return `<path class="cp-chart__bar" data-series="${si}" data-i="${i}" d="${barPath(x, yTop, barW, innerBottom - yTop, 4)}" />`;
            })
            .join('');
          return `<g class="${seriesClass(si)}"${seriesStyle(s)}>${rects}</g>`;
        })
        .join('');
    }

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = `
      ${grid}
      <line class="cp-chart__baseline" x1="${MARGIN.left}" y1="${innerBottom}" x2="${innerRight}" y2="${innerBottom}" />
      <g transform="translate(0,${innerBottom + 16})">${xs}</g>
      ${bars}
    `;
    bindHover();
  }

  function bindHover() {
    svg.querySelectorAll('.cp-chart__bar').forEach((bar) => {
      bar.addEventListener('pointerenter', () => {
        const si = Number(bar.dataset.series);
        const i = Number(bar.dataset.i);
        const s = state.series[si];
        bar.classList.add('is-hovered');
        const total = state.stacked
          ? state.series.reduce((sum, ss) => sum + (ss.data[i] ?? 0), 0)
          : null;
        tip.innerHTML = `
          <strong class="cp-chart__tip-title">${esc(state.labels[i] ?? i + 1)}</strong>
          <span class="cp-chart__tip-row ${seriesClass(si)}"${seriesStyle(s)}>
            <span class="cp-chart__legend-chip" aria-hidden="true"></span>
            <span class="cp-chart__tip-label">${esc(s.label)}</span>
            <span class="cp-chart__tip-value">${esc(state.yFormat(s.data[i]))}</span>
          </span>
          ${total != null ? `
          <span class="cp-chart__tip-row">
            <span class="cp-chart__tip-label">Total</span>
            <span class="cp-chart__tip-value">${esc(state.yFormat(total))}</span>
          </span>` : ''}
        `;
        tip.hidden = false;
        const b = bar.getBoundingClientRect();
        const p = plot.getBoundingClientRect();
        placeTip(tip, plot, b.left - p.left + b.width / 2, b.top - p.top);
      });
      bar.addEventListener('pointerleave', () => {
        bar.classList.remove('is-hovered');
        tip.hidden = true;
      });
    });
  }

  const ro = new ResizeObserver(() => paint());
  ro.observe(root);
  requestAnimationFrame(paint);

  return {
    update(next = {}) {
      if (next.series) state.series = next.series.map((s) => ({ ...s, data: [...(s.data || [])] }));
      if (next.labels) state.labels = [...next.labels];
      if (next.yFormat) state.yFormat = next.yFormat;
      if (next.stacked != null) state.stacked = Boolean(next.stacked);
      paint();
    },
    destroy() {
      ro.disconnect();
      root.innerHTML = '';
      root.classList.remove('cp-chart', 'cp-chart--bar');
    },
  };
}

/**
 * CpDonutChart(root, { data, format, centerLabel }) → { update, destroy }
 * Composition donut: annular segments in fixed categorical order with 2px
 * surface gaps, the total as a center hero number, per-segment tooltip
 * (value + share), legend for 2+ segments. Five segments max — fold the
 * tail into an "Other" entry.
 */
export function CpDonutChart(root, opts = {}) {
  const els = frame(root, 'cp-chart--donut');
  const { legend, plot, svg, tip } = els;
  const state = {
    data: (opts.data || []).map((d) => ({ ...d })),
    format: opts.format || defaultFormat,
    centerLabel: opts.centerLabel ?? 'Total',
  };

  function arcPath(cx, cy, r0, r1, a0, a1) {
    const px = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${px(r1, a0)} A${r1},${r1} 0 ${large} 1 ${px(r1, a1)} L${px(r0, a1)} A${r0},${r0} 0 ${large} 0 ${px(r0, a0)} Z`;
  }

  function paint() {
    renderLegend(legend, state.data);
    const { width, height } = plot.getBoundingClientRect();
    const values = state.data.filter((d) => d.value > 0);
    const total = values.reduce((sum, d) => sum + d.value, 0);
    if (width < 60 || height < 60 || !values.length || total <= 0) {
      svg.innerHTML = '';
      return;
    }
    const cx = width / 2;
    const cy = height / 2;
    const r1 = Math.min(width, height) / 2 - 4;
    const r0 = r1 * 0.66;
    const rMid = (r0 + r1) / 2;
    // 2px surface gap between fills, angular — skipped for a lone segment
    const pad = values.length > 1 ? 1 / rMid : 0;

    let angle = -Math.PI / 2;
    const slices = values
      .map((d) => {
        const sweep = (d.value / total) * Math.PI * 2;
        const i = state.data.indexOf(d);
        const a0 = angle + pad;
        const a1 = Math.max(a0 + 0.004, angle + sweep - pad);
        angle += sweep;
        return `<g class="${seriesClass(i)}"${seriesStyle(d)}><path class="cp-chart__slice" data-i="${i}" d="${arcPath(cx, cy, r0, r1, a0, a1)}" /></g>`;
      })
      .join('');

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = `
      ${slices}
      <text class="cp-chart__donut-value" x="${cx}" y="${cy - 2}">${esc(state.format(total))}</text>
      <text class="cp-chart__donut-label" x="${cx}" y="${cy + 16}">${esc(state.centerLabel)}</text>
    `;
    bindHover(total);
  }

  function bindHover(total) {
    svg.querySelectorAll('.cp-chart__slice').forEach((slice) => {
      slice.addEventListener('pointerenter', () => {
        const d = state.data[Number(slice.dataset.i)];
        slice.classList.add('is-hovered');
        const share = Math.round((d.value / total) * 1000) / 10;
        tip.innerHTML = `
          <strong class="cp-chart__tip-title">${esc(d.label)}</strong>
          <span class="cp-chart__tip-row ${seriesClass(Number(slice.dataset.i))}"${seriesStyle(d)}>
            <span class="cp-chart__legend-chip" aria-hidden="true"></span>
            <span class="cp-chart__tip-label">${esc(state.format(d.value))}</span>
            <span class="cp-chart__tip-value">${esc(share)}%</span>
          </span>
        `;
        tip.hidden = false;
        const b = slice.getBoundingClientRect();
        const p = plot.getBoundingClientRect();
        placeTip(tip, plot, b.left - p.left + b.width / 2, b.top - p.top + b.height / 2);
      });
      slice.addEventListener('pointerleave', () => {
        slice.classList.remove('is-hovered');
        tip.hidden = true;
      });
    });
  }

  const ro = new ResizeObserver(() => paint());
  ro.observe(root);
  requestAnimationFrame(paint);

  return {
    update(next = {}) {
      if (next.data) state.data = next.data.map((d) => ({ ...d }));
      if (next.format) state.format = next.format;
      if (next.centerLabel != null) state.centerLabel = next.centerLabel;
      paint();
    },
    destroy() {
      ro.disconnect();
      root.innerHTML = '';
      root.classList.remove('cp-chart', 'cp-chart--donut');
    },
  };
}

/**
 * CpSparkline(root, { data, color }) → { update, destroy }
 * Inline trend line for stat tiles — 2px line, end dot, no axes or tooltip.
 */
export function CpSparkline(root, opts = {}) {
  root.classList.add('cp-sparkline');
  root.innerHTML = '<svg class="cp-sparkline__svg" role="img" aria-hidden="true"></svg>';
  const svg = root.querySelector('.cp-sparkline__svg');
  let data = [...(opts.data || [])];
  if (opts.color) root.style.setProperty('--series-color', opts.color);

  function paint() {
    const { width, height } = root.getBoundingClientRect();
    if (width < 8 || height < 8 || data.length < 2) {
      svg.innerHTML = '';
      return;
    }
    const pad = 3;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const x = (i) => pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = (v) => height - pad - ((v - min) / span) * (height - pad * 2);
    const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = `
      <path class="cp-sparkline__line" d="${d}" />
      <circle class="cp-sparkline__dot" cx="${x(data.length - 1)}" cy="${y(data[data.length - 1])}" r="3" />
    `;
  }

  const ro = new ResizeObserver(() => paint());
  ro.observe(root);
  requestAnimationFrame(paint);

  return {
    update(next = {}) {
      if (next.data) data = [...next.data];
      if (next.color != null) root.style.setProperty('--series-color', next.color);
      paint();
    },
    destroy() {
      ro.disconnect();
      root.innerHTML = '';
      root.classList.remove('cp-sparkline');
    },
  };
}
