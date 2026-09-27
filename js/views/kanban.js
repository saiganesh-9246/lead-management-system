/**
 * Kanban Pipeline Board View (Drag-and-Drop Pipeline Stages)
 */
import { formatCurrency, escapeHtml, getInitials, getRoleMeta } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

export function renderKanbanBoard(container, state) {
  const STAGES = [
    { id: 'New', name: 'New Inbound', icon: '📌', pillClass: 'column-pill-new' },
    { id: 'Contacted', name: 'Contacted', icon: '📞', pillClass: 'column-pill-contacted' },
    { id: 'Qualified', name: 'Qualified', icon: '🔍', pillClass: 'column-pill-qualified' },
    { id: 'Lost', name: 'Lost', icon: '❌', pillClass: 'column-pill-lost' },
    { id: 'Converted', name: 'Converted Won', icon: '✅', pillClass: 'column-pill-converted' }
  ];

  const leads = state.getLeads();

  function render() {
    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Pipeline Header Toolbar -->
        <div class="toolbar">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">Sales Pipeline Kanban</h2>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Drag and drop cards across pipeline stages to nurture leads through the sales cycle
            </p>
          </div>
          <div class="toolbar-group">
            <button class="btn btn-primary" id="btn-add-lead-kanban">
              + Add Lead
            </button>
          </div>
        </div>

        <!-- Kanban Columns Container -->
        <div class="kanban-container">
          ${STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.status === stage.id);
            const totalStageValue = stageLeads.reduce((sum, l) => sum + (parseFloat(l.dealValue) || 0), 0);

            return `
              <div class="kanban-column" data-stage="${stage.id}">
                <!-- Column Header -->
                <div class="kanban-header">
                  <div class="kanban-column-title ${stage.pillClass}">
                    <span>${stage.icon}</span>
                    <span>${stage.name}</span>
                    <span class="kanban-counter">${stageLeads.length}</span>
                  </div>
                  <span class="kanban-column-value">${formatCurrency(totalStageValue)}</span>
                </div>

                <!-- Cards Wrapper (Drop Target) -->
                <div class="kanban-cards-wrapper" data-stage="${stage.id}">
                  ${stageLeads.length === 0 ? `
                    <div style="padding: 2rem 1rem; text-align: center; color: var(--text-subtle); font-size: 0.78rem; border: 1px dashed var(--border-color); border-radius: var(--radius-sm);">
                      Drop lead here
                    </div>
                  ` : stageLeads.map(lead => {
                    const roleMeta = getRoleMeta(lead.assignedRole || lead.assignedTo);
                    return `
                    <div
                      class="kanban-card"
                      draggable="true"
                      data-lead-id="${lead.id}"
                    >
                      <div class="kanban-card-top">
                        <span class="kanban-card-company">${escapeHtml(lead.company)}</span>
                        <span class="score-badge ${lead.scoreBadgeClass}">
                          ${lead.scoreCategory === 'Hot' ? '🔥' : lead.scoreCategory === 'Warm' ? '⚡' : '❄️'}
                          ${lead.score}
                        </span>
                      </div>

                      <div class="kanban-card-title btn-open-detail" data-id="${lead.id}">
                        ${escapeHtml(lead.name)}
                      </div>

                      <div style="margin: 0.35rem 0 0.45rem 0;">
                        <span class="badge-role ${roleMeta.badgeClass}" style="font-size: 0.68rem; padding: 0.15rem 0.5rem;">
                          <span>${roleMeta.icon}</span> ${roleMeta.label}
                        </span>
                      </div>

                      <div class="kanban-card-contact">
                        <span>✉️</span>
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(lead.email)}</span>
                      </div>

                      <div class="kanban-card-footer">
                        <div class="kanban-card-value">
                          ${formatCurrency(lead.dealValue)}
                        </div>
                        <div class="kanban-card-tags">
                          <button class="btn btn-sm btn-outline btn-open-detail" data-id="${lead.id}" title="View Details">
                            👁️
                          </button>
                          ${lead.status !== 'Converted' && lead.status !== 'Lost' ? `
                            <button class="btn btn-sm btn-success btn-quick-convert" data-id="${lead.id}" title="Convert to Customer">
                              ✓
                            </button>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    setupDragAndDrop();
    attachListeners();
  }

  function setupDragAndDrop() {
    let draggedCard = null;
    let draggedLeadId = null;

    const cards = container.querySelectorAll('.kanban-card');
    const dropZones = container.querySelectorAll('.kanban-cards-wrapper');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        draggedLeadId = card.dataset.leadId;
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedLeadId);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
        draggedLeadId = null;
        container.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
      });
    });

    dropZones.forEach(zone => {
      const column = zone.closest('.kanban-column');

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        column?.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
          column?.classList.remove('drag-over');
        }
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        column?.classList.remove('drag-over');
        const targetStage = zone.dataset.stage;
        const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;

        if (leadId && targetStage) {
          const currentLead = state.getLeadById(leadId);
          if (currentLead && currentLead.status !== targetStage) {
            state.updateLeadStatus(leadId, targetStage);
            toast.success('Stage Updated', `Moved ${currentLead.name} to ${targetStage}`);
            render();
          }
        }
      });
    });
  }

  function attachListeners() {
    container.querySelector('#btn-add-lead-kanban')?.addEventListener('click', () => {
      window.CRMApp.openAddLeadModal();
    });

    container.querySelectorAll('.btn-open-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        window.CRMApp.openLeadDetail(id);
      });
    });

    container.querySelectorAll('.btn-quick-convert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        window.CRMApp.promptConvertLead(id);
      });
    });
  }

  render();
}
