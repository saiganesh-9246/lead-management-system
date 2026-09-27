/**
 * Main Application Orchestrator & Controller
 */
import { stateManager } from './state.js';
import { toast } from './utils/toast.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLeadsView } from './views/leads.js';
import { renderKanbanBoard } from './views/kanban.js';
import { renderLeadDetailModal } from './views/leadDetail.js';
import { renderFollowupsView } from './views/followups.js';
import { renderReportsView } from './views/reports.js';
import { renderUserManagementView, renderAuthScreen } from './views/auth.js';
import { escapeHtml, autoAssignRoleByValue } from './utils/helpers.js';

class CRMApplication {
  constructor() {
    this.state = stateManager;
    this.currentView = 'dashboard';
    this.viewport = document.getElementById('content-viewport');
    this.modalContainer = document.getElementById('global-modal-root');
    this.authContainer = document.getElementById('auth-root');
    this.appContainer = document.getElementById('app');
    this.init();
  }

  init() {
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', this.state.theme);

    // Check Authentication
    if (!this.state.isAuthenticated()) {
      this.showAuthScreen();
      return;
    }

    this.showAppScreen();
  }

  showAuthScreen() {
    if (this.appContainer) this.appContainer.style.display = 'none';
    if (this.authContainer) {
      this.authContainer.style.display = 'block';
      renderAuthScreen(this.authContainer, this.state, () => {
        this.showAppScreen();
      });
    }
  }

  showAppScreen() {
    if (this.authContainer) this.authContainer.style.display = 'none';
    if (this.appContainer) this.appContainer.style.display = 'flex';

    // Setup navigation listeners
    this.setupNavigation();
    this.setupHeaderActions();
    this.updateSidebarUser();
    this.updateBadges();

    // Subscribe to state updates for live UI reactive changes
    this.state.subscribe(() => {
      this.updateBadges();
      this.updateSidebarUser();
    });

    // Initial view render
    this.navigateTo(this.currentView || 'dashboard');
  }

  handleLogout() {
    this.state.logout();
    toast.info('Signed Out', 'You have been safely signed out.');
    this.showAuthScreen();
  }

  setupNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.navigateTo(view);

        // Close mobile sidebar if open
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      });
    });

    // Mobile menu button toggle
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('mobile-open');
    });

    // Top search input
    const topSearch = document.getElementById('top-global-search');
    topSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = topSearch.value;
        this.navigateTo('leads');
        const leadSearch = document.getElementById('lead-search-input');
        if (leadSearch) {
          leadSearch.value = query;
          leadSearch.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    // Sidebar Logout button
    document.getElementById('btn-sidebar-logout')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleLogout();
    });
  }

  setupHeaderActions() {
    // Theme toggle button
    const themeBtn = document.getElementById('btn-toggle-theme');
    themeBtn?.addEventListener('click', () => {
      const newTheme = this.state.toggleTheme();
      toast.info('Theme Changed', `Switched to ${newTheme} mode.`);
    });

    // Global Add Lead button in Topbar
    const addLeadBtn = document.getElementById('btn-top-add-lead');
    addLeadBtn?.addEventListener('click', () => {
      this.openAddLeadModal();
    });

    // Topbar Logout button
    document.getElementById('btn-top-logout')?.addEventListener('click', () => {
      this.handleLogout();
    });
  }

  updateSidebarUser() {
    const user = this.state.currentUser;
    if (!user) return;
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (avatarEl) avatarEl.textContent = user.avatar || 'RS';
  }

  updateBadges() {
    const leads = this.state.getLeads();
    const followups = this.state.getFollowups().filter(f => f.status === 'Pending');

    const leadsBadge = document.getElementById('badge-nav-leads');
    const followupsBadge = document.getElementById('badge-nav-followups');

    if (leadsBadge) leadsBadge.textContent = leads.length;
    if (followupsBadge) followupsBadge.textContent = followups.length;
  }

  navigateTo(viewName, params = {}) {
    this.currentView = viewName;

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Topbar Title
    const titleEl = document.getElementById('topbar-page-title');
    const subtitleEl = document.getElementById('topbar-page-subtitle');

    const TITLES = {
      dashboard: { title: 'Sales Dashboard', subtitle: 'Overview of lead conversion rates & pipeline health' },
      leads: { title: 'Lead Directory', subtitle: 'Manage, search, filter, and score all sales prospects' },
      kanban: { title: 'Pipeline Kanban', subtitle: 'Visual stage-by-stage sales pipeline workflow' },
      followups: { title: 'Follow-up Scheduler', subtitle: 'Track calls, meetings, reminders, and pending tasks' },
      reports: { title: 'Analytics & Reports', subtitle: 'Performance metrics, channel attribution, and velocity' },
      profile: { title: 'User Profile & Settings', subtitle: 'Account preferences and session configuration' }
    };

    if (titleEl && TITLES[viewName]) titleEl.textContent = TITLES[viewName].title;
    if (subtitleEl && TITLES[viewName]) subtitleEl.textContent = TITLES[viewName].subtitle;

    // Render View
    switch (viewName) {
      case 'dashboard':
        renderDashboard(this.viewport, this.state);
        break;
      case 'leads':
        renderLeadsView(this.viewport, this.state, params);
        break;
      case 'kanban':
        renderKanbanBoard(this.viewport, this.state);
        break;
      case 'followups':
        renderFollowupsView(this.viewport, this.state);
        break;
      case 'reports':
        renderReportsView(this.viewport, this.state);
        break;
      case 'profile':
        renderUserManagementView(this.viewport, this.state);
        break;
      default:
        renderDashboard(this.viewport, this.state);
    }
  }

  refreshCurrentView() {
    this.navigateTo(this.currentView);
  }

  openLeadDetail(leadId) {
    renderLeadDetailModal(leadId, this.state, () => {
      this.refreshCurrentView();
    });
  }

  // --- Add Lead Modal ---
  openAddLeadModal() {
    this.modalContainer.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">
              <span>➕ Capture New Lead</span>
            </div>
            <button class="close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-create-lead">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Full Contact Name</label>
                  <input type="text" name="name" class="form-control" placeholder="e.g. John Doe" required />
                </div>
                <div class="form-group">
                  <label class="form-label required">Company / Organization</label>
                  <input type="text" name="company" class="form-control" placeholder="e.g. Acme Corp" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Email Address</label>
                  <input type="email" name="email" class="form-control" placeholder="john@acme.com" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="text" name="phone" class="form-control" placeholder="+1 (555) 234-5678" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Estimated Deal Value ($)</label>
                  <input type="number" name="dealValue" id="lead-deal-val-input" class="form-control" placeholder="15000" min="0" step="500" />
                  <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; display: block;">
                    💡 Deal value auto-recommends role assignment tier.
                  </span>
                </div>
                <div class="form-group">
                  <label class="form-label">Lead Source</label>
                  <select name="source" class="form-control">
                    <option value="Website">Website</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Cold Call">Cold Call</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Assign to Respected Role</label>
                  <select name="assignedRole" id="lead-create-role-select" class="form-control" required>
                    <option value="Enterprise Account Executive">👔 Enterprise Account Executive (&gt; $50k Enterprise)</option>
                    <option value="Senior Sales Lead">⭐ Senior Sales Lead ($25k–$50k Mid-Market)</option>
                    <option value="Business Development Rep">🎯 Business Development Rep (Inbound / BDR)</option>
                    <option value="Sales Representative" selected>💼 Sales Representative (Commercial / SMB)</option>
                    <option value="Sales Director">👑 Sales Director (Strategic VIP Accounts)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Assigned Representative Name</label>
                  <input type="text" name="assignedTo" class="form-control" placeholder="e.g. Rahul Sharma" value="${this.state.currentUser ? escapeHtml(this.state.currentUser.name) : ''}" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Initial Pipeline Stage</label>
                  <select name="status" class="form-control">
                    <option value="New">📌 New Inbound</option>
                    <option value="Contacted">📞 Contacted</option>
                    <option value="Qualified">🔍 Qualified</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select name="priority" class="form-control">
                    <option value="High">🔥 High</option>
                    <option value="Medium" selected>⚡ Medium</option>
                    <option value="Low">❄️ Low</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Requirement Notes / Context</label>
                <textarea name="notes" class="form-control" rows="3" placeholder="Add specific client requirements, questions, or key timelines..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Create & Save Lead</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { this.modalContainer.innerHTML = ''; };
    this.modalContainer.querySelector('#btn-close-modal')?.addEventListener('click', close);
    this.modalContainer.querySelector('#btn-cancel-modal')?.addEventListener('click', close);

    // Dynamic auto-suggest role based on deal value input
    const dealInput = this.modalContainer.querySelector('#lead-deal-val-input');
    const roleSelect = this.modalContainer.querySelector('#lead-create-role-select');
    dealInput?.addEventListener('input', () => {
      const val = parseFloat(dealInput.value) || 0;
      if (val > 0) {
        const recommended = autoAssignRoleByValue(val);
        if (roleSelect) roleSelect.value = recommended;
      }
    });

    const form = this.modalContainer.querySelector('#form-create-lead');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const leadData = {
        name: fd.get('name'),
        company: fd.get('company'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        dealValue: parseFloat(fd.get('dealValue')) || 0,
        source: fd.get('source'),
        status: fd.get('status'),
        priority: fd.get('priority'),
        assignedRole: fd.get('assignedRole'),
        assignedTo: fd.get('assignedTo') || fd.get('assignedRole'),
        notes: fd.get('notes')
      };

      const newLead = this.state.addLead(leadData);
      toast.success('Lead Created!', `${newLead.name} (${newLead.company}) assigned to ${newLead.assignedRole}.`);
      close();
      this.refreshCurrentView();
    });
  }

  // --- Schedule Follow-up Modal ---
  openAddFollowupModal(preselectedLeadId = null) {
    const leads = this.state.getLeads();
    const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);

    this.modalContainer.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">
              <span>⏱️ Schedule Follow-up Task</span>
            </div>
            <button class="close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-create-followup">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label required">Select Associated Lead</label>
                <select name="leadId" class="form-control" required>
                  ${leads.map(l => `
                    <option value="${l.id}" ${l.id === preselectedLeadId ? 'selected' : ''}>
                      ${escapeHtml(l.name)} (${escapeHtml(l.company)})
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label required">Task Title / Agenda</label>
                <input type="text" name="title" class="form-control" placeholder="e.g. Discovery Call with CTO" required />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Activity Type</label>
                  <select name="type" class="form-control">
                    <option value="Call">📞 Call</option>
                    <option value="Meeting">🤝 Meeting</option>
                    <option value="Email">✉️ Email Follow-up</option>
                    <option value="Demo">💻 Product Demo</option>
                    <option value="Task">📋 General Task</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label required">Due Date & Time</label>
                  <input type="datetime-local" name="dueDate" class="form-control" value="${defaultDate}" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Priority</label>
                <select name="priority" class="form-control">
                  <option value="High">🔥 High</option>
                  <option value="Medium" selected>⚡ Medium</option>
                  <option value="Low">❄️ Low</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Task Instructions / Notes</label>
                <textarea name="notes" class="form-control" rows="2" placeholder="Key points to discuss or agenda checklist..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Schedule Task</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { this.modalContainer.innerHTML = ''; };
    this.modalContainer.querySelector('#btn-close-modal')?.addEventListener('click', close);
    this.modalContainer.querySelector('#btn-cancel-modal')?.addEventListener('click', close);

    const form = this.modalContainer.querySelector('#form-create-followup');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const leadId = fd.get('leadId');
      const targetLead = this.state.getLeadById(leadId);

      this.state.addFollowup({
        leadId: leadId,
        leadName: targetLead ? targetLead.name : 'Unknown Lead',
        company: targetLead ? targetLead.company : '',
        title: fd.get('title'),
        type: fd.get('type'),
        dueDate: new Date(fd.get('dueDate')).toISOString(),
        priority: fd.get('priority'),
        notes: fd.get('notes')
      });

      toast.success('Follow-up Scheduled', `Task added for ${targetLead?.name || 'Lead'}`);
      close();
      this.refreshCurrentView();
    });
  }

  promptConvertLead(leadId, callback = null) {
    const lead = this.state.getLeadById(leadId);
    if (!lead) return;
    if (lead.status === 'Lost') {
      toast.warning('Cannot Convert', 'Lost leads cannot be converted to customer.');
      return;
    }
    if (lead.status === 'Converted') {
      toast.info('Already Converted', 'This lead is already converted into a customer.');
      return;
    }

    this.modalContainer.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-dialog conversion-modal">
          <div class="conversion-badge-hero celebrate-icon">🏆</div>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">
            Convert Lead to Customer!
          </h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 440px; margin: 0 auto 1.5rem;">
            You are converting <strong>${escapeHtml(lead.name)}</strong> (${escapeHtml(lead.company)}) with a closed deal value of <strong>$${(lead.dealValue || 0).toLocaleString()}</strong>.
          </p>

          <div style="background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; text-align: left;">
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">Conversion Perks:</div>
            <div style="font-size: 0.85rem; color: var(--text-main); display: flex; flex-direction: column; gap: 0.35rem;">
              <span>✓ Auto-generates unique Customer ID</span>
              <span>✓ Moves lead to "Converted Won" pipeline stage</span>
              <span>✓ Adds revenue to team conversion metrics and charts</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button class="btn btn-secondary" id="btn-cancel-convert">Cancel</button>
            <button class="btn btn-success btn-lg" id="btn-confirm-convert">🎉 Confirm Conversion</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.modalContainer.innerHTML = ''; };
    this.modalContainer.querySelector('#btn-cancel-convert')?.addEventListener('click', close);

    this.modalContainer.querySelector('#btn-confirm-convert')?.addEventListener('click', () => {
      const converted = this.state.convertLeadToCustomer(leadId);
      toast.success('Congratulations! 🎉', `${converted.name} has been converted with ID ${converted.customerId}!`);
      close();
      if (callback) callback();
      this.refreshCurrentView();
    });
  }

  // --- Communication Simulator (Email & SMS) ---
  openCommunicationSimulator(leadId, type = 'email') {
    const lead = this.state.getLeadById(leadId);
    if (!lead) return;

    const isEmail = type === 'email';
    const defaultSubject = `Exploring Partnership: Data Alcott Solutions & ${lead.company}`;
    const defaultBody = isEmail
      ? `Hi ${lead.name.split(' ')[0]},\n\nIt was great speaking with you regarding your CRM and workflow scaling goals at ${lead.company}. I've attached our customized proposal for your review.\n\nLooking forward to our discussion next week!\n\nBest regards,\n${this.state.currentUser.name}\n${this.state.currentUser.company}`
      : `Hi ${lead.name.split(' ')[0]}, this is ${this.state.currentUser.name} from Data Alcott Systems. Just following up on our scheduled demo. Let me know if you need to adjust the timing!`;

    this.modalContainer.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">
              <span>${isEmail ? '✉️ Send Simulated Email' : '📱 Send Simulated SMS'}</span>
            </div>
            <button class="close-btn" id="btn-close-modal">&times;</button>
          </div>
          <form id="form-send-comm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Recipient</label>
                <input type="text" class="form-control" value="${escapeHtml(lead.name)} &lt;${escapeHtml(isEmail ? lead.email : lead.phone)}&gt;" readonly />
              </div>

              ${isEmail ? `
                <div class="form-group">
                  <label class="form-label required">Subject Line</label>
                  <input type="text" name="subject" class="form-control" value="${escapeHtml(defaultSubject)}" required />
                </div>
              ` : ''}

              <div class="form-group">
                <label class="form-label required">Message Content</label>
                <textarea name="body" class="form-control" rows="6" required>${defaultBody}</textarea>
              </div>

              <div class="comm-preview">
                <div class="comm-preview-header">
                  <strong>Simulated Outbox Channel:</strong> Deliver instantly to activity timeline
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">
                  This message will be dispatched and logged in the lead's 360° activity timeline.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">
                ${isEmail ? '🚀 Send Email' : '📤 Send SMS'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { this.modalContainer.innerHTML = ''; };
    this.modalContainer.querySelector('#btn-close-modal')?.addEventListener('click', close);
    this.modalContainer.querySelector('#btn-cancel-modal')?.addEventListener('click', close);

    const form = this.modalContainer.querySelector('#form-send-comm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const subject = isEmail ? fd.get('subject') : 'SMS Sent';
      const body = fd.get('body');

      this.state.addActivity({
        leadId: leadId,
        type: isEmail ? 'Email' : 'Call',
        title: `${isEmail ? 'Email Sent: ' : 'SMS Sent: '} ${subject}`,
        description: body
      });

      toast.success(isEmail ? 'Email Dispatched! ✉️' : 'SMS Sent! 📱', `Message successfully sent to ${lead.name}.`);
      close();
      this.refreshCurrentView();
    });
  }
}

// Instantiate global application
document.addEventListener('DOMContentLoaded', () => {
  window.CRMApp = new CRMApplication();
});
