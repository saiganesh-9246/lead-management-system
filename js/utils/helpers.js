/**
 * Helper Utilities for CRM Lead Management System
 */

export function generateId(prefix = 'lead') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'LD';
}

export const SALES_ROLES = [
  { id: 'Enterprise Account Executive', label: 'Enterprise Account Executive', badgeClass: 'badge-role-enterprise', icon: '👔', tier: 'Enterprise ($50k+)' },
  { id: 'Senior Sales Lead', label: 'Senior Sales Lead', badgeClass: 'badge-role-senior', icon: '⭐', tier: 'Mid-Market ($25k-$50k)' },
  { id: 'Business Development Rep', label: 'Business Development Rep', badgeClass: 'badge-role-bdr', icon: '🎯', tier: 'Inbound / Prospecting' },
  { id: 'Sales Representative', label: 'Sales Representative', badgeClass: 'badge-role-rep', icon: '💼', tier: 'Commercial / SMB' },
  { id: 'Sales Director', label: 'Sales Director', badgeClass: 'badge-role-director', icon: '👑', tier: 'Strategic / Executive' }
];

export function getRoleMeta(roleName) {
  if (!roleName) return SALES_ROLES[3]; // default Sales Representative
  const clean = String(roleName).trim().toLowerCase();
  const direct = SALES_ROLES.find(r => r.id.toLowerCase() === clean || r.label.toLowerCase() === clean);
  if (direct) return direct;

  if (clean.includes('enterprise') || clean.includes('executive') || clean.includes('eae')) return SALES_ROLES[0];
  if (clean.includes('senior') || clean.includes('lead')) return SALES_ROLES[1];
  if (clean.includes('bdr') || clean.includes('development') || clean.includes('sdr')) return SALES_ROLES[2];
  if (clean.includes('director') || clean.includes('vp') || clean.includes('head')) return SALES_ROLES[4];
  return SALES_ROLES[3];
}

export function autoAssignRoleByValue(dealValue) {
  const val = parseFloat(dealValue) || 0;
  if (val >= 50000) return 'Enterprise Account Executive';
  if (val >= 25000) return 'Senior Sales Lead';
  if (val >= 10000) return 'Sales Representative';
  return 'Business Development Rep';
}

/**
 * Export array of leads to CSV download
 */
export function exportToCsv(leads, filename = 'leads_export.csv') {
  if (!leads || !leads.length) return;

  const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Deal Value', 'Source', 'Score', 'Assigned Role', 'Assigned To', 'Created Date'];
  
  const rows = leads.map(l => [
    l.id,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${(l.company || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    l.status,
    l.dealValue || 0,
    l.source,
    l.score || 0,
    `"${(l.assignedRole || l.assignedTo || '').replace(/"/g, '""')}"`,
    `"${(l.assignedTo || '').replace(/"/g, '""')}"`,
    l.createdAt
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse CSV text into lead objects
 */
export function parseCsv(csvText) {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const leads = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(val => val.replace(/^"(.*)"$/, '$1').trim());
    if (values.length >= 4) {
      const dealVal = parseFloat(values[6]) || 5000;
      const role = values[9] || autoAssignRoleByValue(dealVal);
      leads.push({
        id: generateId('lead'),
        name: values[1] || values[0] || 'Imported Lead',
        company: values[2] || values[1] || 'General Corp',
        email: values[3] || 'imported@example.com',
        phone: values[4] || '+1 (555) 000-0000',
        status: values[5] && ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'].includes(values[5]) ? values[5] : 'New',
        dealValue: dealVal,
        source: values[7] || 'Website',
        priority: 'Medium',
        assignedRole: role,
        assignedTo: values[10] || role,
        notes: 'Imported via CSV',
        createdAt: new Date().toISOString()
      });
    }
  }
  return leads;
}

