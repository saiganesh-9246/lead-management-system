/**
 * Follow-up Scheduler View (Calendar/List, Due Tracking, Task Completion)
 */
import { formatDateTime, formatDate, escapeHtml } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

export function renderFollowupsView(container, state) {
  let filter = 'ALL'; // ALL, TODAY, UPCOMING, OVERDUE, COMPLETED

  function getFilteredFollowups() {
    const followups = state.getFollowups();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    return followups.filter(f => {
      const dueDate = new Date(f.dueDate).getTime();
      const isCompleted = f.status === 'Completed';

      if (filter === 'COMPLETED') return isCompleted;
      if (isCompleted && filter !== 'ALL') return false;

      if (filter === 'TODAY') {
        return dueDate >= todayStart && dueDate < todayEnd;
      }
      if (filter === 'UPCOMING') {
        return dueDate >= todayEnd;
      }
      if (filter === 'OVERDUE') {
        return dueDate < todayStart && !isCompleted;
      }
      return true;
    });
  }

  function render() {
    const followups = state.getFollowups();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    const pendingCount = followups.filter(f => f.status !== 'Completed').length;
    const dueTodayCount = followups.filter(f => {
      const d = new Date(f.dueDate).getTime();
      return f.status !== 'Completed' && d >= todayStart && d < todayEnd;
    }).length;
    const overdueCount = followups.filter(f => {
      const d = new Date(f.dueDate).getTime();
      return f.status !== 'Completed' && d < todayStart;
    }).length;
    const completedCount = followups.filter(f => f.status === 'Completed').length;

    const filtered = getFilteredFollowups();

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Toolbar -->
        <div class="toolbar">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">Follow-up & Task Scheduler</h2>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Stay ahead of your sales commitments, client meetings, discovery calls, and touchpoints
            </p>
          </div>
          <div class="toolbar-group">
            <button class="btn btn-primary" id="btn-add-followup-main">
              + Schedule Follow-up
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 1.5rem;">
          <div class="stat-card" style="cursor: pointer;" data-filter="ALL">
            <div class="stat-card-header">
              <span class="stat-label">Pending Tasks</span>
              <div class="stat-icon-wrapper" style="background-color: #eff6ff; color: #3b82f6;">📋</div>
            </div>
            <div class="stat-value">${pendingCount}</div>
            <div class="stat-subtext">Active items</div>
          </div>

          <div class="stat-card" style="cursor: pointer;" data-filter="TODAY">
            <div class="stat-card-header">
              <span class="stat-label">Due Today</span>
              <div class="stat-icon-wrapper" style="background-color: #fef3c7; color: #d97706;">⚡</div>
            </div>
            <div class="stat-value" style="color: #d97706;">${dueTodayCount}</div>
            <div class="stat-subtext">Needs action today</div>
          </div>

          <div class="stat-card" style="cursor: pointer;" data-filter="OVERDUE">
            <div class="stat-card-header">
              <span class="stat-label">Overdue</span>
              <div class="stat-icon-wrapper" style="background-color: #fee2e2; color: #ef4444;">⚠️</div>
            </div>
            <div class="stat-value" style="color: #ef4444;">${overdueCount}</div>
            <div class="stat-subtext">Requires immediate follow-up</div>
          </div>

          <div class="stat-card" style="cursor: pointer;" data-filter="COMPLETED">
            <div class="stat-card-header">
              <span class="stat-label">Completed</span>
              <div class="stat-icon-wrapper" style="background-color: #ecfdf5; color: #10b981;">✓</div>
            </div>
            <div class="stat-value" style="color: #10b981;">${completedCount}</div>
            <div class="stat-subtext">Finished tasks</div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="card" style="padding: 0.75rem 1.25rem; margin-bottom: 1.25rem;">
          <div class="tabs-header" style="margin-bottom: 0; border-bottom: none;">
            <button class="tab-btn ${filter === 'ALL' ? 'active' : ''}" data-f="ALL">All (${followups.length})</button>
            <button class="tab-btn ${filter === 'TODAY' ? 'active' : ''}" data-f="TODAY">Due Today (${dueTodayCount})</button>
            <button class="tab-btn ${filter === 'UPCOMING' ? 'active' : ''}" data-f="UPCOMING">Upcoming</button>
            <button class="tab-btn ${filter === 'OVERDUE' ? 'active' : ''}" data-f="OVERDUE" style="${overdueCount > 0 ? 'color: #ef4444;' : ''}">Overdue (${overdueCount})</button>
            <button class="tab-btn ${filter === 'COMPLETED' ? 'active' : ''}" data-f="COMPLETED">Completed (${completedCount})</button>
          </div>
        </div>

        <!-- Follow-ups List -->
        <div class="card">
          ${filtered.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
              <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-main); margin-bottom: 0.25rem;">All caught up!</div>
              <div>No follow-up tasks match the selected filter.</div>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${filtered.map(f => {
                const dueDateObj = new Date(f.dueDate);
                const isOverdue = dueDateObj.getTime() < todayStart && f.status !== 'Completed';

                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md); transition: transform var(--transition-fast);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <button class="btn-toggle-followup" data-id="${f.id}" style="width: 26px; height: 26px; border-radius: 6px; border: 2px solid ${f.status === 'Completed' ? 'var(--primary)' : 'var(--border-color)'}; background-color: ${f.status === 'Completed' ? 'var(--primary)' : 'transparent'}; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 800;" title="Toggle Complete">
                        ${f.status === 'Completed' ? '✓' : ''}
                      </button>
                      <div>
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); ${f.status === 'Completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                          ${escapeHtml(f.title)}
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">
                          <span style="font-weight: 600; color: var(--text-main); cursor: pointer;" class="btn-lead-link" data-id="${f.leadId}">${escapeHtml(f.leadName || 'Lead')}</span>
                          ${f.company ? ` (${escapeHtml(f.company)})` : ''} &bull; 
                          <span style="${isOverdue ? 'color: #ef4444; font-weight: 700;' : ''}">
                            ${isOverdue ? '⚠️ Overdue: ' : '📅 '} ${formatDateTime(f.dueDate)}
                          </span>
                        </div>
                        ${f.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; background: var(--bg-surface); padding: 0.35rem 0.65rem; border-radius: 4px; border-left: 3px solid var(--primary);">${escapeHtml(f.notes)}</div>` : ''}
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <span class="badge ${f.priority === 'High' ? 'score-hot' : 'score-warm'}">${f.priority || 'Medium'}</span>
                      <span class="badge" style="background-color: var(--bg-hover); color: var(--text-main);">${f.type || 'Task'}</span>
                      <button class="btn btn-sm btn-outline btn-delete-fup" data-id="${f.id}" style="color: #ef4444;" title="Delete task">
                        🗑️
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    attachListeners();
  }

  function attachListeners() {
    container.querySelector('#btn-add-followup-main')?.addEventListener('click', () => {
      window.CRMApp.openAddFollowupModal();
    });

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filter = e.currentTarget.dataset.f;
        render();
      });
    });

    container.querySelectorAll('.stat-card[data-filter]').forEach(card => {
      card.addEventListener('click', (e) => {
        filter = e.currentTarget.dataset.filter;
        render();
      });
    });

    container.querySelectorAll('.btn-toggle-followup').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        state.toggleFollowupStatus(id);
        render();
      });
    });

    container.querySelectorAll('.btn-delete-fup').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Delete this scheduled follow-up?')) {
          state.deleteFollowup(id);
          toast.info('Follow-up Removed', 'Task has been deleted.');
          render();
        }
      });
    });

    container.querySelectorAll('.btn-lead-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const leadId = e.currentTarget.dataset.id;
        if (leadId) window.CRMApp.openLeadDetail(leadId);
      });
    });
  }

  render();
}
