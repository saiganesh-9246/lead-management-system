/**
 * 360° Lead Detail View & Interaction Hub
 */
import { formatCurrency, formatDate, formatDateTime, timeAgo, escapeHtml, getInitials, getRoleMeta, autoAssignRoleByValue } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

export function renderLeadDetailModal(leadId, state, onClose) {
  const lead = state.getLeadById(leadId);
  if (!lead) {
    toast.error('Not Found', 'Lead could not be found.');
    return;
  }

  let activeTab = 'overview';
  const activities = state.getActivities(leadId);
  const followups = state.getFollowups().filter(f => f.leadId === leadId);

  // Modal Backdrop Container
  let modalWrapper = document.getElementById('lead-detail-modal-root');
  if (!modalWrapper) {
    modalWrapper = document.createElement('div');
    modalWrapper.id = 'lead-detail-modal-root';
    document.body.appendChild(modalWrapper);
  }

  function renderModal() {
    const currentLead = state.getLeadById(leadId);
    if (!currentLead) return;

    const currentActivities = state.getActivities(leadId);
    const currentFollowups = state.getFollowups().filter(f => f.leadId === leadId);
    const roleMeta = getRoleMeta(currentLead.assignedRole || currentLead.assignedTo);

    modalWrapper.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-dialog" style="max-width: 840px; max-height: 92vh;">
          
          <!-- Modal Header -->
          <div class="modal-header" style="background-color: var(--bg-surface-elevated);">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="lead-avatar" style="width: 44px; height: 44px; font-size: 1.1rem;">
                ${getInitials(currentLead.name)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                  <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0;">
                    ${escapeHtml(currentLead.name)}
                  </h3>
                  <span class="badge badge-${currentLead.status.toLowerCase()}">${currentLead.status}</span>
                  <span class="badge-role ${roleMeta.badgeClass}">
                    <span>${roleMeta.icon}</span> ${roleMeta.label}
                  </span>
                  <span class="score-badge ${currentLead.scoreBadgeClass}">
                    ${currentLead.scoreCategory === 'Hot' ? '🔥' : currentLead.scoreCategory === 'Warm' ? '⚡' : '❄️'}
                    Score: ${currentLead.score}/100
                  </span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
                  ${escapeHtml(currentLead.company)} &bull; ${escapeHtml(currentLead.industry || 'General Industry')} &bull; Handled by <strong style="color: var(--text-main);">${escapeHtml(currentLead.assignedTo || roleMeta.label)}</strong>
                </div>
              </div>
            </div>
            
            <button class="close-btn" id="btn-close-lead-detail" style="font-size: 1.5rem;">&times;</button>
          </div>

          <!-- Quick Action Buttons Toolbar -->
          <div style="padding: 0.75rem 1.5rem; background-color: var(--bg-input); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline btn-comm-email" title="Simulate Sending Email">
                ✉️ Send Email
              </button>
              <button class="btn btn-sm btn-outline btn-comm-sms" title="Simulate SMS">
                📱 Send SMS
              </button>
              <button class="btn btn-sm btn-outline btn-add-lead-followup" title="Schedule Follow-up Task">
                ⏱️ Schedule Follow-up
              </button>
              ${currentLead.status === 'Converted' ? `
                <span class="badge badge-converted">🎉 Converted (${currentLead.customerId || 'Customer'})</span>
              ` : currentLead.status === 'Lost' ? `
                <span class="badge badge-lost">❌ Lost Lead (Closed)</span>
              ` : `
                <button class="btn btn-sm btn-success btn-convert-now" title="Convert Lead to Customer">
                  ✓ Convert to Customer
                </button>
              `}
            </div>
            <div>
              <strong style="color: var(--primary); font-size: 1.05rem;">
                ${formatCurrency(currentLead.dealValue)}
              </strong>
            </div>
          </div>

          <!-- Tabs Header -->
          <div style="padding: 0 1.5rem; background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color);">
            <div class="tabs-header" style="margin-bottom: 0;">
              <button class="tab-btn ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                📋 Overview & Edit
              </button>
              <button class="tab-btn ${activeTab === 'timeline' ? 'active' : ''}" data-tab="timeline">
                ⚡ Activity History (${currentActivities.length})
              </button>
              <button class="tab-btn ${activeTab === 'followups' ? 'active' : ''}" data-tab="followups">
                ⏱️ Follow-ups (${currentFollowups.length})
              </button>
              <button class="tab-btn ${activeTab === 'scoring' ? 'active' : ''}" data-tab="scoring">
                🎯 Lead Score Breakdown
              </button>
            </div>
          </div>

          <!-- Modal Body Content based on active tab -->
          <div class="modal-body" style="flex: 1; padding: 1.5rem;">
            
            <!-- TAB 1: OVERVIEW & EDIT -->
            ${activeTab === 'overview' ? `
              <form id="lead-edit-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label required">Full Name</label>
                    <input type="text" name="name" class="form-control" value="${escapeHtml(currentLead.name)}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label required">Company Name</label>
                    <input type="text" name="company" class="form-control" value="${escapeHtml(currentLead.company)}" required />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label required">Email Address</label>
                    <input type="email" name="email" class="form-control" value="${escapeHtml(currentLead.email)}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="text" name="phone" class="form-control" value="${escapeHtml(currentLead.phone || '')}" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Estimated Deal Value ($)</label>
                    <input type="number" name="dealValue" id="detail-edit-deal-val" class="form-control" value="${currentLead.dealValue || 0}" min="0" step="500" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Lead Pipeline Status</label>
                    <select name="status" class="form-control">
                      <option value="New" ${currentLead.status === 'New' ? 'selected' : ''}>📌 New</option>
                      <option value="Contacted" ${currentLead.status === 'Contacted' ? 'selected' : ''}>📞 Contacted</option>
                      <option value="Qualified" ${currentLead.status === 'Qualified' ? 'selected' : ''}>🔍 Qualified</option>
                      <option value="Lost" ${currentLead.status === 'Lost' ? 'selected' : ''}>❌ Lost</option>
                      <option value="Converted" ${currentLead.status === 'Converted' ? 'selected' : ''}>✅ Converted</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Lead Source</label>
                    <select name="source" class="form-control">
                      <option value="Website" ${currentLead.source === 'Website' ? 'selected' : ''}>Website</option>
                      <option value="LinkedIn" ${currentLead.source === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                      <option value="Referral" ${currentLead.source === 'Referral' ? 'selected' : ''}>Referral</option>
                      <option value="Email Campaign" ${currentLead.source === 'Email Campaign' ? 'selected' : ''}>Email Campaign</option>
                      <option value="Advertisement" ${currentLead.source === 'Advertisement' ? 'selected' : ''}>Advertisement</option>
                      <option value="Cold Call" ${currentLead.source === 'Cold Call' ? 'selected' : ''}>Cold Call</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label required">Assigned Respected Role</label>
                    <select name="assignedRole" id="detail-edit-role-select" class="form-control" required>
                      <option value="Enterprise Account Executive" ${(currentLead.assignedRole === 'Enterprise Account Executive' || currentLead.assignedTo === 'Enterprise Account Executive') ? 'selected' : ''}>👔 Enterprise Account Executive (&gt; $50k Enterprise)</option>
                      <option value="Senior Sales Lead" ${(currentLead.assignedRole === 'Senior Sales Lead' || currentLead.assignedTo === 'Senior Sales Lead') ? 'selected' : ''}>⭐ Senior Sales Lead ($25k–$50k Mid-Market)</option>
                      <option value="Business Development Rep" ${(currentLead.assignedRole === 'Business Development Rep' || currentLead.assignedTo === 'Business Development Rep') ? 'selected' : ''}>🎯 Business Development Rep (Inbound / BDR)</option>
                      <option value="Sales Representative" ${(currentLead.assignedRole === 'Sales Representative' || currentLead.assignedTo === 'Sales Representative' || (!currentLead.assignedRole && !currentLead.assignedTo)) ? 'selected' : ''}>💼 Sales Representative (Commercial / SMB)</option>
                      <option value="Sales Director" ${(currentLead.assignedRole === 'Sales Director' || currentLead.assignedTo === 'Sales Director') ? 'selected' : ''}>👑 Sales Director (Strategic VIP Accounts)</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Assigned Representative / Account Owner</label>
                    <input type="text" name="assignedTo" class="form-control" value="${escapeHtml(currentLead.assignedTo || roleMeta.label)}" placeholder="e.g. Rahul Sharma" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Industry Sector</label>
                    <input type="text" name="industry" class="form-control" value="${escapeHtml(currentLead.industry || '')}" placeholder="e.g. Cloud Infrastructure" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Notes & Requirements</label>
                  <textarea name="notes" class="form-control" rows="3">${escapeHtml(currentLead.notes || '')}</textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                  <button type="submit" class="btn btn-primary">Save Lead Updates</button>
                </div>
              </form>
            ` : ''}

            <!-- TAB 2: ACTIVITY TIMELINE -->
            ${activeTab === 'timeline' ? `
              <div>
                <!-- Add Quick Note/Activity Box -->
                <div style="background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.5rem;">
                  <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-main);">
                    📝 Log Activity or Meeting Note
                  </div>
                  <form id="form-log-activity">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                      <select id="log-activity-type" class="form-control" style="width: 140px;">
                        <option value="Call">📞 Call Log</option>
                        <option value="Meeting">🤝 Meeting</option>
                        <option value="Email">✉️ Email</option>
                        <option value="Note">📝 Note</option>
                      </select>
                      <input type="text" id="log-activity-title" class="form-control" placeholder="Activity summary..." required />
                    </div>
                    <textarea id="log-activity-desc" class="form-control" rows="2" placeholder="Details or discussion points..." required></textarea>
                    <div style="text-align: right; margin-top: 0.5rem;">
                      <button type="submit" class="btn btn-sm btn-primary">+ Post Activity</button>
                    </div>
                  </form>
                </div>

                <!-- Timeline Items -->
                <div class="timeline">
                  ${currentActivities.length === 0 ? `
                    <div style="color: var(--text-muted); font-size: 0.85rem;">No activities logged yet.</div>
                  ` : currentActivities.map(act => `
                    <div class="timeline-item">
                      <div class="timeline-icon">
                        ${act.type === 'Call' ? '📞' : act.type === 'Meeting' ? '🤝' : act.type === 'Email' ? '✉️' : act.type === 'Deal Won' ? '🏆' : '📌'}
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <span class="timeline-title">${escapeHtml(act.title)}</span>
                          <span class="timeline-time">${formatDateTime(act.timestamp)} (${timeAgo(act.timestamp)})</span>
                        </div>
                        <div class="timeline-body">${escapeHtml(act.description)}</div>
                        <div style="font-size: 0.72rem; color: var(--text-subtle); margin-top: 0.25rem;">
                          Logged by ${escapeHtml(act.performedBy)}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- TAB 3: FOLLOW-UPS -->
            ${activeTab === 'followups' ? `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <h4 style="font-weight: 700;">Scheduled Follow-up Tasks</h4>
                  <button class="btn btn-sm btn-primary btn-add-lead-followup">+ Schedule New</button>
                </div>

                ${currentFollowups.length === 0 ? `
                  <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                    ⏱️ No follow-ups scheduled for this lead.
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${currentFollowups.map(f => `
                      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <input type="checkbox" class="toggle-fup-checkbox" data-id="${f.id}" ${f.status === 'Completed' ? 'checked' : ''} />
                          <div>
                            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); ${f.status === 'Completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                              ${escapeHtml(f.title)}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                              ${f.type} &bull; Due: ${formatDateTime(f.dueDate)}
                            </div>
                            ${f.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${escapeHtml(f.notes)}</div>` : ''}
                          </div>
                        </div>
                        <span class="badge ${f.status === 'Completed' ? 'badge-converted' : 'badge-contacted'}">
                          ${f.status}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            ` : ''}

            <!-- TAB 4: SCORING BREAKDOWN -->
            ${activeTab === 'scoring' ? `
              <div>
                <div style="background-color: var(--bg-input); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                  <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary); line-height: 1;">
                    ${currentLead.score} <span style="font-size: 1.25rem; color: var(--text-muted);">/ 100</span>
                  </div>
                  <div style="font-weight: 700; margin-top: 0.35rem; font-size: 1rem;">
                    ${currentLead.scoreCategory} Lead Qualification
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); max-width: 480px; margin: 0.5rem auto 0;">
                    Calculated in real-time based on deal budget, profile completeness, acquisition source credibility, engagement frequency, and sales stage progression.
                  </p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
                      <span>Budget & Deal Value</span>
                      <strong>${currentLead.dealValue >= 20000 ? 'High Budget (+25 pts)' : 'Standard (+15 pts)'}</strong>
                    </div>
                    <div style="height: 8px; background-color: var(--bg-input); border-radius: 9999px; overflow: hidden;">
                      <div style="height: 100%; width: ${Math.min((currentLead.dealValue / 100000) * 100, 100)}%; background-color: var(--primary);"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
                      <span>Contact Profile Completeness</span>
                      <strong>${currentLead.email && currentLead.phone ? '100% (+15 pts)' : 'Partial (+10 pts)'}</strong>
                    </div>
                    <div style="height: 8px; background-color: var(--bg-input); border-radius: 9999px; overflow: hidden;">
                      <div style="height: 100%; width: ${currentLead.email && currentLead.phone ? '100%' : '60%'}; background-color: #3b82f6;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
                      <span>Channel Source Quality (${currentLead.source})</span>
                      <strong>${currentLead.source === 'Referral' ? 'Top Tier (+15 pts)' : '+10 pts'}</strong>
                    </div>
                    <div style="height: 8px; background-color: var(--bg-input); border-radius: 9999px; overflow: hidden;">
                      <div style="height: 100%; width: ${currentLead.source === 'Referral' ? '100%' : '70%'}; background-color: #8b5cf6;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
                      <span>Engagement & Interactions (${currentActivities.length} logs)</span>
                      <strong>${currentActivities.length >= 3 ? 'High Touch (+15 pts)' : 'Active (+9 pts)'}</strong>
                    </div>
                    <div style="height: 8px; background-color: var(--bg-input); border-radius: 9999px; overflow: hidden;">
                      <div style="height: 100%; width: ${Math.min(currentActivities.length * 25, 100)}%; background-color: #f59e0b;"></div>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

          </div>
        </div>
      </div>
    `;

    attachModalListeners();
  }

  function attachModalListeners() {
    // Close button & backdrop click
    modalWrapper.querySelector('#btn-close-lead-detail')?.addEventListener('click', () => {
      close();
    });

    const backdrop = modalWrapper.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    // Tab switching
    modalWrapper.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.dataset.tab;
        renderModal();
      });
    });

    // Auto-suggest role when deal value changes in edit form
    const editDealInput = modalWrapper.querySelector('#detail-edit-deal-val');
    const editRoleSelect = modalWrapper.querySelector('#detail-edit-role-select');
    editDealInput?.addEventListener('input', () => {
      const val = parseFloat(editDealInput.value) || 0;
      if (val > 0 && editRoleSelect) {
        editRoleSelect.value = autoAssignRoleByValue(val);
      }
    });

    // Form Edit Submit
    const editForm = modalWrapper.querySelector('#lead-edit-form');
    editForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(editForm);
      const updates = {
        name: formData.get('name'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dealValue: parseFloat(formData.get('dealValue')) || 0,
        status: formData.get('status'),
        source: formData.get('source'),
        assignedRole: formData.get('assignedRole'),
        assignedTo: formData.get('assignedTo') || formData.get('assignedRole'),
        industry: formData.get('industry'),
        notes: formData.get('notes')
      };

      state.updateLead(leadId, updates);
      toast.success('Lead Updated', 'Changes saved and role updated successfully.');
      renderModal();
    });

    // Log Activity Form
    const logActivityForm = modalWrapper.querySelector('#form-log-activity');
    logActivityForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = modalWrapper.querySelector('#log-activity-type').value;
      const title = modalWrapper.querySelector('#log-activity-title').value;
      const desc = modalWrapper.querySelector('#log-activity-desc').value;

      state.addActivity({
        leadId: leadId,
        type: type,
        title: title,
        description: desc
      });

      toast.success('Activity Logged', 'New activity added to timeline.');
      renderModal();
    });

    // Toggle Followup Checkbox
    modalWrapper.querySelectorAll('.toggle-fup-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const fupId = e.target.dataset.id;
        state.toggleFollowupStatus(fupId);
        renderModal();
      });
    });

    // Schedule Follow-up button
    modalWrapper.querySelectorAll('.btn-add-lead-followup').forEach(btn => {
      btn.addEventListener('click', () => {
        window.CRMApp.openAddFollowupModal(leadId);
      });
    });

    // Convert button
    modalWrapper.querySelectorAll('.btn-convert-now').forEach(btn => {
      btn.addEventListener('click', () => {
        window.CRMApp.promptConvertLead(leadId, () => {
          renderModal();
        });
      });
    });

    // Communication Simulator Buttons (Email & SMS)
    modalWrapper.querySelector('.btn-comm-email')?.addEventListener('click', () => {
      window.CRMApp.openCommunicationSimulator(leadId, 'email');
    });

    modalWrapper.querySelector('.btn-comm-sms')?.addEventListener('click', () => {
      window.CRMApp.openCommunicationSimulator(leadId, 'sms');
    });
  }

  function close() {
    modalWrapper.innerHTML = '';
    if (onClose) onClose();
  }

  renderModal();
}
