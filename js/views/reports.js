/**
 * Reports & Pipeline Analytics View
 */
import { formatCurrency, formatDate, escapeHtml, getRoleMeta, SALES_ROLES } from '../utils/helpers.js';
import { renderDonutChart, renderBarChart, renderPipelineFunnel } from '../utils/charts.js';

export function renderReportsView(container, state) {
  const leads = state.getLeads();
  const convertedLeads = leads.filter(l => l.status === 'Converted');
  const lostLeads = leads.filter(l => l.status === 'Lost');
  const openLeads = leads.filter(l => !['Converted', 'Lost'].includes(l.status));

  const totalWonRevenue = convertedLeads.reduce((s, l) => s + (parseFloat(l.dealValue) || 0), 0);
  const totalPipelineRevenue = leads.reduce((s, l) => s + (parseFloat(l.dealValue) || 0), 0);
  const winRate = (convertedLeads.length + lostLeads.length) > 0
    ? Math.round((convertedLeads.length / (convertedLeads.length + lostLeads.length)) * 100)
    : 0;

  // Source-wise analysis
  const sourcesMap = {};
  leads.forEach(l => {
    const src = l.source || 'Other';
    if (!sourcesMap[src]) {
      sourcesMap[src] = { total: 0, won: 0, lost: 0, revenue: 0 };
    }
    sourcesMap[src].total += 1;
    if (l.status === 'Converted') {
      sourcesMap[src].won += 1;
      sourcesMap[src].revenue += (parseFloat(l.dealValue) || 0);
    } else if (l.status === 'Lost') {
      sourcesMap[src].lost += 1;
    }
  });

  const sourceReportRows = Object.keys(sourcesMap).map(src => {
    const d = sourcesMap[src];
    const convRate = d.total > 0 ? Math.round((d.won / d.total) * 100) : 0;
    return {
      source: src,
      totalLeads: d.total,
      won: d.won,
      lost: d.lost,
      revenue: d.revenue,
      conversionRate: convRate
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Respected Roles Performance Matrix
  const rolesMap = {};
  SALES_ROLES.forEach(r => {
    rolesMap[r.id] = { roleMeta: r, total: 0, won: 0, lost: 0, pipelineVal: 0, revenue: 0 };
  });

  leads.forEach(l => {
    const roleMeta = getRoleMeta(l.assignedRole || l.assignedTo);
    const roleId = roleMeta.id;
    if (!rolesMap[roleId]) {
      rolesMap[roleId] = { roleMeta, total: 0, won: 0, lost: 0, pipelineVal: 0, revenue: 0 };
    }
    rolesMap[roleId].total += 1;
    rolesMap[roleId].pipelineVal += (parseFloat(l.dealValue) || 0);
    if (l.status === 'Converted') {
      rolesMap[roleId].won += 1;
      rolesMap[roleId].revenue += (parseFloat(l.dealValue) || 0);
    } else if (l.status === 'Lost') {
      rolesMap[roleId].lost += 1;
    }
  });

  const roleReportRows = Object.values(rolesMap).filter(r => r.total > 0 || r.pipelineVal > 0).sort((a, b) => b.pipelineVal - a.pipelineVal);

  // Rep leaderboard
  const repsMap = {};
  leads.forEach(l => {
    const rep = l.assignedTo || l.assignedRole || 'Unassigned';
    const role = l.assignedRole || rep;
    if (!repsMap[rep]) {
      repsMap[rep] = { name: rep, role: role, total: 0, won: 0, revenue: 0 };
    }
    repsMap[rep].total += 1;
    if (l.status === 'Converted') {
      repsMap[rep].won += 1;
      repsMap[rep].revenue += (parseFloat(l.dealValue) || 0);
    }
  });

  const repLeaderboard = Object.values(repsMap).sort((a, b) => b.revenue - a.revenue);

  container.innerHTML = `
    <div class="animate-fade-in">
      <!-- Header Toolbar -->
      <div class="toolbar">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">Sales Pipeline & Conversion Reports</h2>
          <p style="font-size: 0.82rem; color: var(--text-muted);">
            Analyze conversion performance, channel ROI, respected role productivity, and pipeline velocity
          </p>
        </div>
        <div class="toolbar-group">
          <button class="btn btn-outline" id="btn-print-report">
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Overview Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Total Closed Won</span>
            <div class="stat-icon-wrapper" style="background-color: #ecfdf5; color: #10b981;">🏆</div>
          </div>
          <div class="stat-value" style="color: #10b981;">${formatCurrency(totalWonRevenue)}</div>
          <div class="stat-subtext">Across ${convertedLeads.length} deals</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Win Rate (Won vs Lost)</span>
            <div class="stat-icon-wrapper" style="background-color: #eff6ff; color: #3b82f6;">🎯</div>
          </div>
          <div class="stat-value">${winRate}%</div>
          <div class="stat-subtext">${convertedLeads.length} won &bull; ${lostLeads.length} lost</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Active Open Pipeline</span>
            <div class="stat-icon-wrapper" style="background-color: #fef3c7; color: #d97706;">⚡</div>
          </div>
          <div class="stat-value">${openLeads.length} leads</div>
          <div class="stat-subtext">${formatCurrency(openLeads.reduce((s, l) => s + (l.dealValue || 0), 0))} in play</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Avg Won Deal Size</span>
            <div class="stat-icon-wrapper" style="background-color: #ede9fe; color: #8b5cf6;">📈</div>
          </div>
          <div class="stat-value">${formatCurrency(convertedLeads.length > 0 ? totalWonRevenue / convertedLeads.length : 0)}</div>
          <div class="stat-subtext">Per converted customer</div>
        </div>
      </div>

      <!-- Respected Sales Roles Performance Matrix -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>👔 Pipeline Allocation by Respected Sales Roles</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Deals mapped to specialized role tiers</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Respected Role</th>
                <th>Target Deal Tier</th>
                <th>Assigned Leads</th>
                <th>Won Deals</th>
                <th>Active Pipeline Value</th>
                <th>Closed Won Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${roleReportRows.map(r => `
                <tr>
                  <td>
                    <span class="badge-role ${r.roleMeta.badgeClass}">
                      <span>${r.roleMeta.icon}</span> ${r.roleMeta.label}
                    </span>
                  </td>
                  <td><span style="font-size: 0.8rem; color: var(--text-muted);">${r.roleMeta.tier}</span></td>
                  <td><strong>${r.total}</strong></td>
                  <td><span style="color: #10b981; font-weight: 700;">${r.won}</span></td>
                  <td><strong style="color: var(--text-main); font-size: 0.95rem;">${formatCurrency(r.pipelineVal)}</strong></td>
                  <td><strong style="color: var(--primary); font-size: 0.95rem;">${formatCurrency(r.revenue)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lead Channel Performance Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>🌐 Lead Channel Performance & Conversion Analysis</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Ranked by generated revenue</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lead Source / Channel</th>
                <th>Total Leads</th>
                <th>Won Deals</th>
                <th>Lost Deals</th>
                <th>Conversion Rate</th>
                <th>Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              ${sourceReportRows.map(r => `
                <tr>
                  <td><strong style="color: var(--text-main);">${escapeHtml(r.source)}</strong></td>
                  <td>${r.totalLeads}</td>
                  <td><span style="color: #10b981; font-weight: 600;">${r.won}</span></td>
                  <td><span style="color: #ef4444;">${r.lost}</span></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <div style="flex: 1; min-width: 60px; height: 6px; background-color: var(--bg-hover); border-radius: 9999px;">
                        <div style="width: ${r.conversionRate}%; height: 100%; background-color: var(--primary); border-radius: 9999px;"></div>
                      </div>
                      <strong>${r.conversionRate}%</strong>
                    </div>
                  </td>
                  <td><strong style="color: var(--primary); font-size: 0.95rem;">${formatCurrency(r.revenue)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rep Productivity Leaderboard -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>👥 Sales Representative & Role Performance Leaderboard</span>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Representative / Account Owner</th>
                <th>Respected Role</th>
                <th>Assigned Leads</th>
                <th>Won Customers</th>
                <th>Closed Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${repLeaderboard.map(rep => {
                const repRoleMeta = getRoleMeta(rep.role || rep.name);
                return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #059669, #3b82f6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">
                        ${rep.name.charAt(0)}
                      </div>
                      <strong style="color: var(--text-main);">${escapeHtml(rep.name)}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="badge-role ${repRoleMeta.badgeClass}">
                      <span>${repRoleMeta.icon}</span> ${repRoleMeta.label}
                    </span>
                  </td>
                  <td>${rep.total}</td>
                  <td><span style="color: #10b981; font-weight: 700;">${rep.won}</span></td>
                  <td><strong style="color: var(--primary); font-size: 0.95rem;">${formatCurrency(rep.revenue)}</strong></td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Print handler
  container.querySelector('#btn-print-report')?.addEventListener('click', () => {
    window.print();
  });
}
