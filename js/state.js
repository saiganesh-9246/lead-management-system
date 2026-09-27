/**
 * State Management & LocalStorage Persistence Engine
 */
import { generateId, autoAssignRoleByValue } from './utils/helpers.js';
import { calculateLeadScore } from './scoring.js';

const STORAGE_KEYS = {
  LEADS: 'crm_leads_data_v1',
  ACTIVITIES: 'crm_activities_data_v1',
  FOLLOWUPS: 'crm_followups_data_v1',
  USERS: 'crm_registered_users_clean',
  CURRENT_USER: 'crm_active_session_clean',
  THEME: 'crm_theme_preference_v1'
};

// Initial Seed Data with high quality realistic enterprise sales leads assigned to respected roles
const INITIAL_LEADS = [
  {
    id: 'lead_001',
    name: 'Aarav Patel',
    company: 'Apex Cloud Solutions',
    email: 'aarav.patel@apexcloud.io',
    phone: '+91 98201 44521',
    status: 'New',
    dealValue: 35000,
    source: 'Website',
    priority: 'High',
    industry: 'Cloud Infrastructure',
    assignedTo: 'Senior Sales Lead',
    assignedRole: 'Senior Sales Lead',
    notes: 'Interested in enterprise license for 150 users. Requested demo.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'lead_002',
    name: 'Priya Sundaram',
    company: 'FinEdge Technologies',
    email: 'priya.s@finedge.tech',
    phone: '+91 97412 88301',
    status: 'Contacted',
    dealValue: 54000,
    source: 'LinkedIn',
    priority: 'High',
    industry: 'FinTech',
    assignedTo: 'Enterprise Account Executive',
    assignedRole: 'Enterprise Account Executive',
    notes: 'Introductory discovery call completed. Sent technical spec proposal.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'lead_003',
    name: 'Marcus Vance',
    company: 'Nexis Logistics Global',
    email: 'm.vance@nexislogistics.com',
    phone: '+1 (415) 890-3412',
    status: 'Qualified',
    dealValue: 78000,
    source: 'Referral',
    priority: 'High',
    industry: 'Supply Chain',
    assignedTo: 'Enterprise Account Executive',
    assignedRole: 'Enterprise Account Executive',
    notes: 'Budget approved by VP of Sales. Security review in progress.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'lead_004',
    name: 'Ananya Deshmukh',
    company: 'HealthSync Systems',
    email: 'ananya@healthsync.org',
    phone: '+91 99304 11290',
    status: 'Converted',
    dealValue: 120000,
    source: 'Email Campaign',
    priority: 'High',
    industry: 'Healthcare AI',
    assignedTo: 'Enterprise Account Executive',
    assignedRole: 'Enterprise Account Executive',
    notes: 'Annual contract signed! Onboarding kickoff scheduled for Monday.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    convertedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    customerId: 'CUST-8840'
  },
  {
    id: 'lead_005',
    name: 'David Chen',
    company: 'Quantum Retail Labs',
    email: 'dchen@quantumretail.co',
    phone: '+1 (212) 555-0199',
    status: 'Lost',
    dealValue: 24000,
    source: 'Cold Call',
    priority: 'Low',
    industry: 'E-Commerce',
    assignedTo: 'Sales Representative',
    assignedRole: 'Sales Representative',
    notes: 'Went with in-house custom build due to internal budget constraints.',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    lostReason: 'Budget constraints'
  },
  {
    id: 'lead_006',
    name: 'Rohan Mehra',
    company: 'Starlight Media House',
    email: 'rohan.m@starlightmedia.in',
    phone: '+91 98110 33499',
    status: 'Contacted',
    dealValue: 18000,
    source: 'Advertisement',
    priority: 'Medium',
    industry: 'Digital Marketing',
    assignedTo: 'Business Development Rep',
    assignedRole: 'Business Development Rep',
    notes: 'Followed up after webinar. Scheduled live demo for team.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'lead_007',
    name: 'Elena Rostova',
    company: 'AeroDynamics Baltic',
    email: 'e.rostova@aerobaltic.eu',
    phone: '+44 20 7946 0912',
    status: 'Qualified',
    dealValue: 92000,
    source: 'Referral',
    priority: 'High',
    industry: 'Aerospace Engineering',
    assignedTo: 'Enterprise Account Executive',
    assignedRole: 'Enterprise Account Executive',
    notes: 'Key decision makers involved. Final contract terms in legal review.',
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 'lead_008',
    name: 'Vikramaditya Rao',
    company: 'Kavach Cyber Security',
    email: 'vikram@kavachsec.in',
    phone: '+91 98860 77123',
    status: 'New',
    dealValue: 45000,
    source: 'Website',
    priority: 'Medium',
    industry: 'Cybersecurity',
    assignedTo: 'Senior Sales Lead',
    assignedRole: 'Senior Sales Lead',
    notes: 'Inbound trial signup. Expressed urgency for SOC compliance reporting.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: 'act_001',
    leadId: 'lead_004',
    type: 'Deal Won',
    title: 'Lead Converted to Customer',
    description: 'Contract signed for $120,000 ARR. Customer ID #CUST-8840 generated.',
    performedBy: 'Rahul Sharma',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'act_002',
    leadId: 'lead_003',
    type: 'Meeting',
    title: 'Executive Demo with VP Sales',
    description: 'Presented pipeline analytics and API integrations. Positive response on security compliance.',
    performedBy: 'Rahul Sharma',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'act_003',
    leadId: 'lead_002',
    type: 'Call',
    title: 'Discovery Phone Call',
    description: 'Discussed team requirements and migration from legacy spreadsheet tracker.',
    performedBy: 'Rahul Sharma',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'act_004',
    leadId: 'lead_001',
    type: 'Email',
    title: 'Inbound Inquiry Received',
    description: 'Lead submitted request for enterprise pricing on public portal.',
    performedBy: 'System',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const INITIAL_FOLLOWUPS = [
  {
    id: 'fup_001',
    leadId: 'lead_003',
    leadName: 'Marcus Vance',
    company: 'Nexis Logistics Global',
    title: 'Security Compliance Review Call',
    type: 'Meeting',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'Pending',
    priority: 'High',
    notes: 'Walk through SOC2 certification and data encryption with their IT team.'
  },
  {
    id: 'fup_002',
    leadId: 'lead_002',
    leadName: 'Priya Sundaram',
    company: 'FinEdge Technologies',
    title: 'Send Revised Commercial Proposal',
    type: 'Email',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'Pending',
    priority: 'High',
    notes: 'Include 10% volume discount for 2-year upfront commitment.'
  },
  {
    id: 'fup_003',
    leadId: 'lead_008',
    leadName: 'Vikramaditya Rao',
    company: 'Kavach Cyber Security',
    title: 'Introductory Discovery Call',
    type: 'Call',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'Pending',
    priority: 'Medium',
    notes: 'Understand team size and CRM integration requirements.'
  }
];

const INITIAL_REGISTERED_USERS = [];

class StateManager {
  constructor() {
    this.leads = [];
    this.activities = [];
    this.followups = [];
    this.users = [];
    this.currentUser = null;
    this.theme = 'light';
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    try {
      // Purge legacy user keys to ensure pristine zero-account state
      localStorage.removeItem('crm_registered_users_v1');
      localStorage.removeItem('crm_active_session_v1');
      localStorage.removeItem('crm_user_session_v1');

      const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const savedFollowups = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);

      this.leads = savedLeads ? JSON.parse(savedLeads) : [...INITIAL_LEADS];
      this.activities = savedActivities ? JSON.parse(savedActivities) : [...INITIAL_ACTIVITIES];
      this.followups = savedFollowups ? JSON.parse(savedFollowups) : [...INITIAL_FOLLOWUPS];
      this.users = savedUsers ? JSON.parse(savedUsers) : [];
      this.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
      this.theme = savedTheme || 'light';

      // Ensure all leads have lead scoring attached
      this.leads = this.leads.map(lead => {
        const scoreData = calculateLeadScore(lead, this.activities);
        return {
          ...lead,
          score: scoreData.score,
          scoreCategory: scoreData.category,
          scoreBadgeClass: scoreData.badgeClass
        };
      });

      this.saveState();
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.leads = [...INITIAL_LEADS];
      this.activities = [...INITIAL_ACTIVITIES];
      this.followups = [...INITIAL_FOLLOWUPS];
      this.users = [];
      this.currentUser = null;
      this.theme = 'light';
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(this.leads));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.activities));
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(this.followups));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.setItem(STORAGE_KEYS.THEME, this.theme);
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn(this);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  // --- Authentication Methods ---
  isAuthenticated() {
    return this.currentUser !== null && !!this.currentUser.email;
  }

  login(email, password) {
    const user = this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error('Account not found. Please click "Create Account" to register.');
    }
    if (user.password && user.password !== password) {
      throw new Error('Invalid password. Please enter the password you registered with.');
    }

    this.currentUser = { ...user };
    this.saveState();
    return this.currentUser;
  }

  register(userData) {
    const existing = this.users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: generateId('usr'),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role || 'Sales Representative',
      company: userData.company || 'Acme Sales Global',
      department: userData.department || 'Sales & Growth',
      avatar: userData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUser = { ...newUser };

    // Initialize user-scoped private starter pipeline
    const userStarterLeads = INITIAL_LEADS.map((seedLead, index) => ({
      ...seedLead,
      id: `lead_${newUser.id}_${index + 1}`,
      ownerId: newUser.id,
      ownerEmail: newUser.email,
      assignedRole: seedLead.assignedRole || autoAssignRoleByValue(seedLead.dealValue),
      assignedTo: seedLead.assignedTo || seedLead.assignedRole || newUser.name,
      createdAt: new Date(Date.now() - (index * 2) * 86400000).toISOString()
    }));

    this.leads.push(...userStarterLeads);

    // Add initial activity
    this.addActivity({
      leadId: userStarterLeads[0].id,
      type: 'Note',
      title: 'Workspace Initialized',
      description: `Private sales pipeline initialized for ${newUser.name}.`,
      performedBy: newUser.name,
      ownerId: newUser.id,
      ownerEmail: newUser.email
    });

    this.saveState();
    return newUser;
  }

  logout() {
    this.currentUser = null;
    this.saveState();
  }

  deleteAccount(userId) {
    const isCurrent = this.currentUser && (this.currentUser.id === userId || this.currentUser.email === userId);
    this.users = this.users.filter(u => u.id !== userId && u.email !== userId);
    
    // Wipe all private data belonging to this account
    this.leads = this.leads.filter(l => l.ownerId !== userId);
    this.followups = this.followups.filter(f => f.ownerId !== userId);
    this.activities = this.activities.filter(a => a.ownerId !== userId);

    if (isCurrent) {
      this.currentUser = null;
    }
    this.saveState();
    return isCurrent;
  }

  clearAllAccounts() {
    this.users = [];
    this.currentUser = null;
    this.leads = [];
    this.followups = [];
    this.activities = [];
    this.saveState();
  }

  getRegisteredUsers() {
    return this.users;
  }

  // --- Lead Methods (Isolated per User) ---
  getLeads() {
    if (!this.currentUser) return [];
    return this.leads.filter(l => !l.ownerId || l.ownerId === this.currentUser.id || l.ownerEmail === this.currentUser.email);
  }

  getLeadById(id) {
    const userLeads = this.getLeads();
    return userLeads.find(l => l.id === id);
  }

  addLead(leadData) {
    const dealVal = parseFloat(leadData.dealValue) || 0;
    const assignedRole = leadData.assignedRole || leadData.assignedTo || autoAssignRoleByValue(dealVal);
    const assignedTo = leadData.assignedTo || assignedRole || (this.currentUser ? this.currentUser.name : 'Sales Rep');

    const newLead = {
      id: generateId('lead'),
      createdAt: new Date().toISOString(),
      ownerId: this.currentUser ? this.currentUser.id : null,
      ownerEmail: this.currentUser ? this.currentUser.email : null,
      assignedRole: assignedRole,
      assignedTo: assignedTo,
      status: leadData.status || 'New',
      dealValue: dealVal,
      priority: leadData.priority || 'Medium',
      source: leadData.source || 'Website',
      ...leadData
    };

    const scoreData = calculateLeadScore(newLead, this.activities);
    newLead.score = scoreData.score;
    newLead.scoreCategory = scoreData.category;
    newLead.scoreBadgeClass = scoreData.badgeClass;

    this.leads.unshift(newLead);

    // Log creation activity
    this.addActivity({
      leadId: newLead.id,
      type: 'Note',
      title: 'Lead Created',
      description: `New lead created from ${newLead.source} with potential value of $${newLead.dealValue.toLocaleString()} and assigned to role ${newLead.assignedRole}.`
    });

    this.saveState();
    return newLead;
  }

  updateLead(id, updates) {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return null;

    const oldStatus = this.leads[index].status;
    const oldRole = this.leads[index].assignedRole || this.leads[index].assignedTo;
    const updatedLead = { ...this.leads[index], ...updates };

    // Recalculate score
    const scoreData = calculateLeadScore(updatedLead, this.activities);
    updatedLead.score = scoreData.score;
    updatedLead.scoreCategory = scoreData.category;
    updatedLead.scoreBadgeClass = scoreData.badgeClass;

    this.leads[index] = updatedLead;

    // Log status change if updated
    if (updates.status && updates.status !== oldStatus) {
      this.addActivity({
        leadId: id,
        type: 'Status Change',
        title: `Status Changed: ${oldStatus} → ${updates.status}`,
        description: `Lead moved to stage "${updates.status}" by ${this.currentUser ? this.currentUser.name : 'System'}.`
      });
    }

    // Log role reassignment if updated
    if (updates.assignedRole && updates.assignedRole !== oldRole) {
      this.addActivity({
        leadId: id,
        type: 'Note',
        title: `Lead Reassigned: ${updates.assignedRole}`,
        description: `Lead role reassigned to "${updates.assignedRole}" by ${this.currentUser ? this.currentUser.name : 'System'}.`
      });
    }

    this.saveState();
    return updatedLead;
  }

  updateLeadStatus(id, newStatus) {
    return this.updateLead(id, { status: newStatus });
  }

  deleteLead(id) {
    const lead = this.getLeadById(id);
    if (!lead) return false;

    this.leads = this.leads.filter(l => l.id !== id);
    this.activities = this.activities.filter(a => a.leadId !== id);
    this.followups = this.followups.filter(f => f.leadId !== id);

    this.saveState();
    return true;
  }

  convertLeadToCustomer(id) {
    const lead = this.getLeadById(id);
    if (!lead) return null;
    if (lead.status === 'Lost') {
      throw new Error('Lost leads cannot be converted to customer.');
    }
    const customerId = lead.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const convertedLead = this.updateLead(id, {
      status: 'Converted',
      convertedAt: new Date().toISOString(),
      customerId: customerId
    });

    this.addActivity({
      leadId: id,
      type: 'Deal Won',
      title: '🎉 Converted to Customer!',
      description: `Lead successfully converted to paying customer (${customerId}) with deal value of $${lead.dealValue.toLocaleString()}.`
    });

    return convertedLead;
  }

  // --- Activities Methods (Isolated) ---
  getActivities(leadId = null) {
    if (!this.currentUser) return [];
    const userLeads = this.getLeads();
    const userLeadIds = new Set(userLeads.map(l => l.id));

    let userActivities = this.activities.filter(a =>
      (!a.ownerId || a.ownerId === this.currentUser.id || a.ownerEmail === this.currentUser.email) ||
      (a.leadId && userLeadIds.has(a.leadId))
    );

    if (leadId) {
      userActivities = userActivities.filter(a => a.leadId === leadId);
    }
    return userActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addActivity(activityData) {
    const newActivity = {
      id: generateId('act'),
      timestamp: new Date().toISOString(),
      ownerId: this.currentUser ? this.currentUser.id : null,
      ownerEmail: this.currentUser ? this.currentUser.email : null,
      performedBy: activityData.performedBy || (this.currentUser ? this.currentUser.name : 'System'),
      ...activityData
    };

    this.activities.unshift(newActivity);
    
    // Refresh score of associated lead if present
    if (newActivity.leadId) {
      const lead = this.getLeadById(newActivity.leadId);
      if (lead) {
        const scoreData = calculateLeadScore(lead, this.getActivities());
        lead.score = scoreData.score;
        lead.scoreCategory = scoreData.category;
        lead.scoreBadgeClass = scoreData.badgeClass;
      }
    }

    this.saveState();
    return newActivity;
  }

  // --- Follow-ups Methods (Isolated) ---
  getFollowups() {
    if (!this.currentUser) return [];
    const userLeads = this.getLeads();
    const userLeadIds = new Set(userLeads.map(l => l.id));

    return this.followups.filter(f =>
      (!f.ownerId || f.ownerId === this.currentUser.id || f.ownerEmail === this.currentUser.email) ||
      (f.leadId && userLeadIds.has(f.leadId))
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  addFollowup(followupData) {
    const newFollowup = {
      id: generateId('fup'),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ownerId: this.currentUser ? this.currentUser.id : null,
      ownerEmail: this.currentUser ? this.currentUser.email : null,
      ...followupData
    };

    this.followups.push(newFollowup);

    // Log activity
    this.addActivity({
      leadId: newFollowup.leadId,
      type: newFollowup.type || 'Task',
      title: `Scheduled Follow-up: ${newFollowup.title}`,
      description: `Due on ${new Date(newFollowup.dueDate).toLocaleDateString()} - ${newFollowup.notes || 'No notes'}`
    });

    this.saveState();
    return newFollowup;
  }

  toggleFollowupStatus(id) {
    const fup = this.followups.find(f => f.id === id);
    if (!fup) return null;

    fup.status = fup.status === 'Completed' ? 'Pending' : 'Completed';
    fup.completedAt = fup.status === 'Completed' ? new Date().toISOString() : null;

    if (fup.status === 'Completed') {
      this.addActivity({
        leadId: fup.leadId,
        type: 'Task',
        title: `Completed Follow-up: ${fup.title}`,
        description: `Marked as done by ${this.currentUser ? this.currentUser.name : 'System'}.`
      });
    }

    this.saveState();
    return fup;
  }

  deleteFollowup(id) {
    this.followups = this.followups.filter(f => f.id !== id);
    this.saveState();
    return true;
  }

  // --- User & Theme ---
  updateUser(userData) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...userData };
    // update in users array as well
    const idx = this.users.findIndex(u => u.id === this.currentUser.id || u.email === this.currentUser.email);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...userData };
    }
    this.saveState();
  }

  setTheme(themeName) {
    this.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    this.saveState();
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    return nextTheme;
  }

  // --- Reset to Demo Data ---
  resetToDemoData() {
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOWUPS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.loadState();
  }
}

export const stateManager = new StateManager();
