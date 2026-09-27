/**
 * Leads Management View (Table, Multi-Filters, Search, CSV Import/Export, Bulk Actions)
 */
import { formatCurrency, formatDate, escapeHtml, getInitials, exportToCsv, parseCsv, getRoleMeta } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

export function renderLeadsView(container, state, initialFilter = {}) {
  let searchTerm = '';
  let statusFilter = initialFilter.status || 'ALL';
  let sourceFilter = 'ALL';
  let scoreFilter = 'ALL';
  let roleFilter = 'ALL';
  let sortBy = 'createdAt_desc';
  let selectedLeadIds = new Set();

  function getFilteredLeads() {
    let leads = [...state.getLeads()];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      leads = leads.filter(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.assignedRole && l.assignedRole.toLowerCase().includes(q)) ||
        (l.assignedTo && l.assignedTo.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      leads = leads.filter(l => l.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      leads = leads.filter(l => {
        const r = (l.assignedRole || l.assignedTo || '').toLowerCase();
        return r.includes(roleFilter.toLowerCase());
      });
    }

    // Source filter
    if (sourceFilter !== 'ALL') {
      leads = leads.filter(l => l.source === sourceFilter);
    }

    // Score filter
    if (scoreFilter !== 'ALL') {
      leads = leads.filter(l => l.scoreCategory === scoreFilter);
    }

    // Sorting
    leads.sort((a, b) => {
      if (sortBy === 'createdAt_desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'createdAt_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'value_desc') return (b.dealValue || 0) - (a.dealValue || 0);
      if (sortBy === 'value_asc') return (a.dealValue || 0) - (b.dealValue || 0);
      if (sortBy === 'score_desc') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return leads;
  }

  function render() {
    const filteredLeads = getFilteredLeads();
    const allLeads = state.getLeads();

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Page Title and Action Bar -->
        <div class="toolbar">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">All Leads Directory</h2>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Manage, score, nurture, and track your active sales pipeline leads (${filteredLeads.length} of ${allLeads.length})
            </p>
          </div>
          <div class="toolbar-group">
            <input type="file" id="csv-file-input" accept=".csv" style="display: none;" />
            <button class="btn btn-outline" id="btn-import-csv" title="Import Leads from CSV">
              📥 Import CSV
            </button>
            <button class="btn btn-outline" id="btn-export-csv" title="Export current list to CSV">
              📤 Export CSV
            </button>
            <button class="btn btn-primary" id="btn-add-lead-main">
              + Add Lead
            </button>
          </div>
        </div>

        <!-- Filter Controls Bar -->
        <div class="card" style="padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; gap: 0.85rem; align-items: center; flex-wrap: wrap;">
            
            <!-- Search Box -->
            <div style="flex: 1; min-width: 220px; position: relative;">
              <input
                type="text"
                id="lead-search-input"
                class="form-control"
                placeholder="🔍 Search by name, company, role, email..."
                value="${escapeHtml(searchTerm)}"
              />
            </div>

            <!-- Role Dropdown Filter -->
            <div style="min-width: 175px;">
              <select id="filter-role-select" class="form-control">
                <option value="ALL" ${roleFilter === 'ALL' ? 'selected' : ''}>All Sales Roles</option>
                <option value="Enterprise Account Executive" ${roleFilter === 'Enterprise Account Executive' ? 'selected' : ''}>👔 Enterprise AE (&gt;$50k)</option>
                <option value="Senior Sales Lead" ${roleFilter === 'Senior Sales Lead' ? 'selected' : ''}>⭐ Senior Sales Lead ($25k-$50k)</option>
                <option value="Business Development Rep" ${roleFilter === 'Business Development Rep' ? 'selected' : ''}>🎯 BDR (Inbound/Nurture)</option>
                <option value="Sales Representative" ${roleFilter === 'Sales Representative' ? 'selected' : ''}>💼 Sales Rep (Commercial)</option>
                <option value="Sales Director" ${roleFilter === 'Sales Director' ? 'selected' : ''}>👑 Sales Director (VIP Accounts)</option>
              </select>
            </div>

            <!-- Status Dropdown -->
            <div style="min-width: 140px;">
              <select id="filter-status-select" class="form-control">
                <option value="ALL" ${statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
                <option value="New" ${statusFilter === 'New' ? 'selected' : ''}>📌 New</option>
                <option value="Contacted" ${statusFilter === 'Contacted' ? 'selected' : ''}>📞 Contacted</option>
                <option value="Qualified" ${statusFilter === 'Qualified' ? 'selected' : ''}>🔍 Qualified</option>
                <option value="Lost" ${statusFilter === 'Lost' ? 'selected' : ''}>❌ Lost</option>
                <option value="Converted" ${statusFilter === 'Converted' ? 'selected' : ''}>✅ Converted</option>
              </select>
            </div>

            <!-- Source Dropdown -->
            <div style="min-width: 130px;">
              <select id="filter-source-select" class="form-control">
                <option value="ALL" ${sourceFilter === 'ALL' ? 'selected' : ''}>All Sources</option>
                <option value="Website" ${sourceFilter === 'Website' ? 'selected' : ''}>Website</option>
                <option value="LinkedIn" ${sourceFilter === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                <option value="Referral" ${sourceFilter === 'Referral' ? 'selected' : ''}>Referral</option>
                <option value="Email Campaign" ${sourceFilter === 'Email Campaign' ? 'selected' : ''}>Email Campaign</option>
                <option value="Advertisement" ${sourceFilter === 'Advertisement' ? 'selected' : ''}>Advertisement</option>
                <option value="Cold Call" ${sourceFilter === 'Cold Call' ? 'selected' : ''}>Cold Call</option>
              </select>
            </div>

            <!-- Score Filter -->
            <div style="min-width: 125px;">
              <select id="filter-score-select" class="form-control">
                <option value="ALL" ${scoreFilter === 'ALL' ? 'selected' : ''}>All Scores</option>
                <option value="Hot" ${scoreFilter === 'Hot' ? 'selected' : ''}>🔥 Hot (&ge;75)</option>
                <option value="Warm" ${scoreFilter === 'Warm' ? 'selected' : ''}>⚡ Warm (45-74)</option>
                <option value="Cold" ${scoreFilter === 'Cold' ? 'selected' : ''}>❄️ Cold (&lt;45)</option>
              </select>
            </div>

            <!-- Sort Select -->
            <div style="min-width: 140px;">
              <select id="sort-select" class="form-control">
                <option value="createdAt_desc" ${sortBy === 'createdAt_desc' ? 'selected' : ''}>Newest Added</option>
                <option value="createdAt_asc" ${sortBy === 'createdAt_asc' ? 'selected' : ''}>Oldest Added</option>
                <option value="value_desc" ${sortBy === 'value_desc' ? 'selected' : ''}>Deal Value: High to Low</option>
                <option value="value_asc" ${sortBy === 'value_asc' ? 'selected' : ''}>Deal Value: Low to High</option>
                <option value="score_desc" ${sortBy === 'score_desc' ? 'selected' : ''}>Lead Score: Highest</option>
                <option value="name_asc" ${sortBy === 'name_asc' ? 'selected' : ''}>Name: A to Z</option>
              </select>
            </div>

            <!-- Reset Filters -->
            ${(searchTerm || statusFilter !== 'ALL' || sourceFilter !== 'ALL' || scoreFilter !== 'ALL' || roleFilter !== 'ALL') ? `
              <button class="btn btn-outline btn-sm" id="btn-reset-filters" style="color: #ef4444;">
                ✕ Clear
              </button>
            ` : ''}

          </div>
        </div>

        <!-- Bulk Actions Bar (if any selected) -->
        ${selectedLeadIds.size > 0 ? `
          <div style="background-color: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius-sm); padding: 0.75rem 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: 600; color: var(--primary);">
              ${selectedLeadIds.size} lead(s) selected
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" id="btn-bulk-export">Export Selected</button>
              <button class="btn btn-sm btn-danger" id="btn-bulk-delete">Delete Selected</button>
            </div>
          </div>
        ` : ''}

        <!-- Leads Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">
                  <input type="checkbox" id="select-all-checkbox" ${selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0 ? 'checked' : ''} />
                </th>
                <th>Lead Info</th>
                <th>Contact Details</th>
                <th>Source</th>
                <th>Lead Score</th>
                <th>Status</th>
                <th>Deal Value</th>
                <th>Assigned Role & Rep</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLeads.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
                    <div style="font-weight: 600; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">No leads found</div>
                    <div>Try adjusting your search or filters to find what you're looking for.</div>
                  </td>
                </tr>
              ` : filteredLeads.map(lead => {
      const isSelected = selectedLeadIds.has(lead.id);
      const roleMeta = getRoleMeta(lead.assignedRole || lead.assignedTo);
      return `
                  <tr data-lead-id="${lead.id}">
                    <td style="text-align: center;">
                      <input type="checkbox" class="lead-checkbox" data-id="${lead.id}" ${isSelected ? 'checked' : ''} />
                    </td>
                    <td>
                      <div class="lead-cell-info">
                        <div class="lead-avatar">${getInitials(lead.name)}</div>
                        <div class="lead-name-company">
                          <span class="lead-name btn-view-lead" data-id="${lead.id}">${escapeHtml(lead.name)}</span>
                          <span class="lead-company">${escapeHtml(lead.company)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style="font-size: 0.8rem; color: var(--text-main);">${escapeHtml(lead.email)}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(lead.phone)}</div>
                    </td>
                    <td>
                      <span class="badge" style="background-color: var(--bg-hover); color: var(--text-muted); border: 1px solid var(--border-color);">
                        ${escapeHtml(lead.source)}
                      </span>
                    </td>
                    <td>
                      <span class="score-badge ${lead.scoreBadgeClass}">
                        ${lead.scoreCategory === 'Hot' ? '🔥' : lead.scoreCategory === 'Warm' ? '⚡' : '❄️'}
                        ${lead.score}/100
                      </span>
                    </td>
                    <td>
                      <select class="form-control quick-status-select" data-id="${lead.id}" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; width: auto; font-weight: 600;">
                        <option value="New" ${lead.status === 'New' ? 'selected' : ''}>📌 New</option>
                        <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>📞 Contacted</option>
                        <option value="Qualified" ${lead.status === 'Qualified' ? 'selected' : ''}>🔍 Qualified</option>
                        <option value="Lost" ${lead.status === 'Lost' ? 'selected' : ''}>❌ Lost</option>
                        <option value="Converted" ${lead.status === 'Converted' ? 'selected' : ''}>✅ Converted</option>
                      </select>
                    </td>
                    <td>
                      <strong style="color: var(--text-main);">${formatCurrency(lead.dealValue)}</strong>
                    </td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-start;">
                        <span class="badge-role ${roleMeta.badgeClass}">
                          <span>${roleMeta.icon}</span> ${roleMeta.label}
                        </span>
                        <span style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(lead.assignedTo || roleMeta.label)}</span>
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.35rem;">
                        <button class="btn btn-sm btn-outline btn-view-lead" data-id="${lead.id}" title="View 360° Lead Detail">
                          👁️ View
                        </button>
                        ${lead.status !== 'Converted' && lead.status !== 'Lost' ? `
                          <button class="btn btn-sm btn-success btn-convert-lead" data-id="${lead.id}" title="1-Click Convert to Customer">
                            ✓ Convert
                          </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline btn-delete-lead" data-id="${lead.id}" style="color: #ef4444;" title="Delete Lead">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Attach Event Listeners
    attachEventListeners();
  }

  function attachEventListeners() {
    // Search input
    const searchInput = container.querySelector('#lead-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      render();
      const updatedInput = container.querySelector('#lead-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(searchTerm.length, searchTerm.length);
      }
    });

    // Filters
    container.querySelector('#filter-role-select')?.addEventListener('change', (e) => {
      roleFilter = e.target.value;
      render();
    });

    container.querySelector('#filter-status-select')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    container.querySelector('#filter-source-select')?.addEventListener('change', (e) => {
      sourceFilter = e.target.value;
      render();
    });

    container.querySelector('#filter-score-select')?.addEventListener('change', (e) => {
      scoreFilter = e.target.value;
      render();
    });

    container.querySelector('#sort-select')?.addEventListener('change', (e) => {
      sortBy = e.target.value;
      render();
    });

    container.querySelector('#btn-reset-filters')?.addEventListener('click', () => {
      searchTerm = '';
      statusFilter = 'ALL';
      sourceFilter = 'ALL';
      scoreFilter = 'ALL';
      roleFilter = 'ALL';
      render();
    });

    // Add Lead
    container.querySelector('#btn-add-lead-main')?.addEventListener('click', () => {
      window.CRMApp.openAddLeadModal();
    });

    // Export CSV
    container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      const leads = getFilteredLeads();
      exportToCsv(leads, `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Export Successful', `Exported ${leads.length} leads to CSV.`);
    });

    // Import CSV
    const fileInput = container.querySelector('#csv-file-input');
    container.querySelector('#btn-import-csv')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result;
          const importedLeads = parseCsv(text);
          if (importedLeads.length > 0) {
            importedLeads.forEach(lead => state.addLead(lead));
            toast.success('Import Successful', `Successfully imported ${importedLeads.length} leads!`);
            render();
          } else {
            toast.error('Import Failed', 'No valid lead rows found in CSV file.');
          }
        } catch (err) {
          toast.error('Import Error', 'Failed to parse CSV file.');
        }
      };
      reader.readAsText(file);
    });

    // Checkboxes & Bulk selection
    container.querySelector('#select-all-checkbox')?.addEventListener('change', (e) => {
      const filtered = getFilteredLeads();
      if (e.target.checked) {
        selectedLeadIds = new Set(filtered.map(l => l.id));
      } else {
        selectedLeadIds.clear();
      }
      render();
    });

    container.querySelectorAll('.lead-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        if (e.target.checked) {
          selectedLeadIds.add(id);
        } else {
          selectedLeadIds.delete(id);
        }
        render();
      });
    });

    // Bulk Delete
    container.querySelector('#btn-bulk-delete')?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete ${selectedLeadIds.size} selected leads?`)) {
        selectedLeadIds.forEach(id => state.deleteLead(id));
        selectedLeadIds.clear();
        toast.success('Leads Deleted', 'Selected leads have been removed.');
        render();
      }
    });

    // Bulk Export
    container.querySelector('#btn-bulk-export')?.addEventListener('click', () => {
      const selected = state.getLeads().filter(l => selectedLeadIds.has(l.id));
      exportToCsv(selected, `selected_leads_${Date.now()}.csv`);
      toast.success('Export Successful', `Exported ${selected.length} selected leads.`);
    });

    // Quick Status Dropdown Change
    container.querySelectorAll('.quick-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        state.updateLeadStatus(id, newStatus);
        toast.success('Status Updated', `Lead status updated to ${newStatus}`);
        render();
      });
    });

    // View Lead Detail
    container.querySelectorAll('.btn-view-lead').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        window.CRMApp.openLeadDetail(id);
      });
    });

    // Convert Lead
    container.querySelectorAll('.btn-convert-lead').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        window.CRMApp.promptConvertLead(id);
      });
    });

    // Delete Single Lead
    container.querySelectorAll('.btn-delete-lead').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const lead = state.getLeadById(id);
        if (confirm(`Delete lead "${lead?.name || 'this lead'}"?`)) {
          state.deleteLead(id);
          toast.info('Lead Removed', 'Lead has been removed from system.');
          render();
        }
      });
    });
  }

  render();
}
