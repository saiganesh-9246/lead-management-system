/**
 * Dashboard View Module
 */
import { formatCurrency, formatDate, timeAgo, escapeHtml } from '../utils/helpers.js';
import { renderDonutChart, renderBarChart, renderPipelineFunnel } from '../utils/charts.js';

export function renderDashboard(container, state) {
  const leads = state.getLeads();
  const activities = state.getActivities().slice(0, 5);
  const followups = state.getFollowups().filter(f => f.status === 'Pending').slice(0, 4);

  // Compute Metrics (Lost deals are explicitly excluded from active pipeline and won revenue)
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'Converted');
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified');
  const contactedLeads = leads.filter(l => l.status === 'Contacted');
  const newLeads = leads.filter(l => l.status === 'New');
  const lostLeads = leads.filter(l => l.status === 'Lost');

  // Active pipeline excludes Lost leads
  const activeLeads = leads.filter(l => l.status !== 'Lost');
  const activePipelineValue = activeLeads.reduce((acc, l) => acc + (parseFloat(l.dealValue) || 0), 0);
  const convertedValue = convertedLeads.reduce((acc, l) => acc + (parseFloat(l.dealValue) || 0), 0);
  const lostValue = lostLeads.reduce((acc, l) => acc + (parseFloat(l.dealValue) || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads.length / totalLeads) * 100) : 0;

  // Source breakdown data for Donut chart
  const sourceCounts = {};
  leads.forEach(l => {
    const src = l.source || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const sourceChartData = Object.keys(sourceCounts).map(source => ({
    label: source,
    value: sourceCounts[source]
  }));

  // Stage Data for Funnel
  const stagesData = [
    { label: 'New Inbound', count: newLeads.length, valueFormatted: formatCurrency(newLeads.reduce((s, l) => s + (l.dealValue || 0), 0)), color: '#3b82f6' },
    { label: 'Contacted', count: contactedLeads.length, valueFormatted: formatCurrency(contactedLeads.reduce((s, l) => s + (l.dealValue || 0), 0)), color: '#f59e0b' },
    { label: 'Qualified', count: qualifiedLeads.length, valueFormatted: formatCurrency(qualifiedLeads.reduce((s, l) => s + (l.dealValue || 0), 0)), color: '#8b5cf6' },
    { label: 'Converted Won', count: convertedLeads.length, valueFormatted: formatCurrency(convertedValue), color: '#10b981' },
    { label: 'Lost', count: lostLeads.length, valueFormatted: formatCurrency(lostValue), color: '#f43f5e' }
  ];

  // Monthly simulated trends
  const monthlyData = [
    { label: 'May', value: 38000, valueFormatted: '$38k' },
    { label: 'Jun', value: 52000, valueFormatted: '$52k' },
    { label: 'Jul', value: 68000, valueFormatted: '$68k' },
    { label: 'Aug', value: 84000, valueFormatted: '$84k' },
    { label: 'Sep', value: activePipelineValue, valueFormatted: formatCurrency(activePipelineValue) }
  ];

  container.innerHTML = `
    <div class="animate-fade-in">
      <!-- Welcome Hero Banner -->
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%); border-radius: var(--radius-lg); padding: 1.75rem 2rem; margin-bottom: 1.75rem; color: #ffffff; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.25); position: relative; overflow: hidden;">
        <div style="position: relative; z-index: 2;">
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; margin-bottom: 0.65rem;">
            Data Alcott Systems CRM &bull; Active Pipeline
          </span>
          <h2 style="font-size: 1.65rem; font-weight: 800; margin-bottom: 0.35rem; color: #ffffff;">Welcome back, ${escapeHtml(state.currentUser ? state.currentUser.name : 'Sales Lead')}!</h2>
          <p style="font-size: 0.9rem; opacity: 0.9; max-width: 540px;">
            You have <strong>${followups.length} pending follow-ups</strong> today and <strong>${qualifiedLeads.length} qualified high-value deals</strong> in play.
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; position: relative; z-index: 2;" class="hero-actions">
          <button class="btn btn-secondary" id="btn-quick-add-lead" style="background-color: #ffffff; color: var(--primary); border: none; font-weight: 700;">
            + Add New Lead
          </button>
          <button class="btn btn-outline" id="btn-quick-view-kanban" style="border-color: rgba(255,255,255,0.4); color: #ffffff;">
            Pipeline Board →
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Active Pipeline Value</span>
            <div class="stat-icon-wrapper" style="background-color: var(--primary-light); color: var(--primary);">💰</div>
          </div>
          <div class="stat-value">${formatCurrency(activePipelineValue)}</div>
          <div class="stat-subtext">
            <span>Excludes <strong>${formatCurrency(lostValue)}</strong> lost deals</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Conversion Rate</span>
            <div class="stat-icon-wrapper" style="background-color: #eff6ff; color: #3b82f6;">🎯</div>
          </div>
          <div class="stat-value">${conversionRate}%</div>
          <div class="stat-subtext">
            <span class="stat-trend-up">↑ 4.2%</span> target: 20%
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Total Leads</span>
            <div class="stat-icon-wrapper" style="background-color: #ede9fe; color: #8b5cf6;">👥</div>
          </div>
          <div class="stat-value">${totalLeads}</div>
          <div class="stat-subtext">
            <strong>${newLeads.length}</strong> newly captured
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Won Revenue</span>
            <div class="stat-icon-wrapper" style="background-color: #ecfdf5; color: #10b981;">🏆</div>
          </div>
          <div class="stat-value">${formatCurrency(convertedValue)}</div>
          <div class="stat-subtext">
            <strong>${convertedLeads.length}</strong> converted customers
          </div>
        </div>
      </div>

      <!-- Charts & Visual Analytics Section -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.75rem;">
        
        <!-- Pipeline Stage Funnel -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title">
              <span>📊 Pipeline Stage Funnel</span>
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Real-time stage distribution</span>
          </div>
          <div id="chart-pipeline-funnel" style="padding: 0.5rem 0;"></div>
        </div>

        <!-- Lead Sources Breakdown -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title">
              <span>🌐 Lead Sources</span>
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Acquisition channels</span>
          </div>
          <div id="chart-lead-sources" style="padding: 0.5rem 0;"></div>
        </div>
      </div>

      <!-- Bottom Row: Activity Feed & Follow-up Tasks -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        
        <!-- Upcoming Follow-up Tasks -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title">
              <span>⏱️ Upcoming Follow-ups</span>
            </div>
            <button class="btn btn-sm btn-outline" id="btn-view-all-followups">View All</button>
          </div>
          <div>
            ${followups.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                🎉 No pending follow-ups! Great job staying on top of your deals.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${followups.map(f => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <button class="btn-check-followup" data-id="${f.id}" style="width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border-color); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--primary);" title="Mark Done">
                        ${f.status === 'Completed' ? '✓' : ''}
                      </button>
                      <div>
                        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">${escapeHtml(f.title)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(f.leadName)} &bull; ${formatDate(f.dueDate)}</div>
                      </div>
                    </div>
                    <span class="badge ${f.priority === 'High' ? 'score-hot' : 'score-warm'}">${f.priority}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title">
              <span>⚡ Recent Activity History</span>
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Audit log</span>
          </div>
          <div class="timeline">
            ${activities.map(a => `
              <div class="timeline-item">
                <div class="timeline-icon">📌</div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-title">${escapeHtml(a.title)}</span>
                    <span class="timeline-time">${timeAgo(a.timestamp)}</span>
                  </div>
                  <div class="timeline-body">${escapeHtml(a.description)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Render Charts
  setTimeout(() => {
    renderPipelineFunnel('chart-pipeline-funnel', stagesData);
    renderDonutChart('chart-lead-sources', sourceChartData, { size: 190, strokeWidth: 26 });
  }, 50);

  // Attach Event Handlers
  container.querySelector('#btn-quick-add-lead')?.addEventListener('click', () => {
    window.CRMApp.openAddLeadModal();
  });

  container.querySelector('#btn-quick-view-kanban')?.addEventListener('click', () => {
    window.CRMApp.navigateTo('kanban');
  });

  container.querySelector('#btn-view-all-followups')?.addEventListener('click', () => {
    window.CRMApp.navigateTo('followups');
  });

  container.querySelectorAll('.btn-check-followup').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      state.toggleFollowupStatus(id);
      renderDashboard(container, state);
    });
  });
}
