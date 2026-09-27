/**
 * High-fidelity Data Visualization Generator (SVG & HTML5 Canvas)
 */

export function renderDonutChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No data available</div>`;
    return;
  }

  const size = options.size || 220;
  const strokeWidth = options.strokeWidth || 30;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const colors = options.colors || ['#059669', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  let svgSegments = '';
  data.forEach((item, index) => {
    const percentage = item.value / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    const color = item.color || colors[index % colors.length];

    svgSegments += `
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="transparent"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        style="transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease; cursor: pointer;"
        data-label="${item.label}"
        data-val="${item.value}"
        data-pct="${Math.round(percentage * 100)}%"
      >
        <title>${item.label}: ${item.value} (${Math.round(percentage * 100)}%)</title>
      </circle>
    `;
    currentOffset += percentage * circumference;
  });

  const legendHtml = `
    <div style="display: flex; flex-direction: column; gap: 0.5rem; justify-content: center; margin-left: 1.5rem;">
      ${data.map((item, idx) => `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color || colors[idx % colors.length]}; display: inline-block;"></span>
          <span style="color: var(--text-muted); min-width: 90px;">${item.label}</span>
          <strong style="color: var(--text-main);">${item.value}</strong>
          <span style="color: var(--text-subtle); font-size: 0.72rem;">(${Math.round((item.value / total) * 100)}%)</span>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 1rem;">
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); border-radius: 50%;">
          ${svgSegments}
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <span style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">${total}</span>
          <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Total</span>
        </div>
      </div>
      ${legendHtml}
    </div>
  `;
}

export function renderBarChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const height = options.height || 200;

  const barsHtml = data.map(item => {
    const percentage = Math.round((item.value / maxValue) * 100);
    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">${item.valueFormatted || item.value}</span>
        <div style="width: 100%; max-width: 44px; height: ${percentage}%; background: linear-gradient(180deg, var(--primary) 0%, #10b981 100%); border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);" title="${item.label}: ${item.value}"></div>
        <span style="font-size: 0.72rem; color: var(--text-muted); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px;">${item.label}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="height: ${height}px; display: flex; align-items: flex-end; gap: 1rem; padding-top: 1rem; border-bottom: 1px solid var(--border-color);">
      ${barsHtml}
    </div>
  `;
}

export function renderPipelineFunnel(containerId, stagesData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = stagesData.reduce((sum, s) => sum + s.count, 0) || 1;

  const funnelHtml = stagesData.map((stage) => {
    const pct = Math.round((stage.count / total) * 100);
    return `
      <div style="margin-bottom: 0.85rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
          <span style="font-weight: 600; color: var(--text-main);">${stage.label}</span>
          <span><strong style="color: var(--primary);">${stage.count} leads</strong> (${stage.valueFormatted}) &bull; ${pct}%</span>
        </div>
        <div style="width: 100%; height: 10px; background-color: var(--bg-hover); border-radius: 9999px; overflow: hidden;">
          <div style="height: 100%; width: ${pct}%; background-color: ${stage.color}; border-radius: 9999px; transition: width 0.6s ease;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = funnelHtml;
}
