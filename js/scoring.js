/**
 * Dynamic Lead Scoring Engine
 * Evaluates budget, contact completeness, source credibility, stage progression, and follow-up activities
 */

export function calculateLeadScore(lead, activities = []) {
  let score = 20; // Base score
  const breakdown = {
    budget: 0,
    completeness: 0,
    source: 0,
    engagement: 0,
    stage: 0
  };

  // 1. Deal Value / Budget scoring (max +25)
  const value = parseFloat(lead.dealValue) || 0;
  if (value >= 50000) {
    breakdown.budget = 25;
  } else if (value >= 20000) {
    breakdown.budget = 20;
  } else if (value >= 10000) {
    breakdown.budget = 15;
  } else if (value >= 3000) {
    breakdown.budget = 10;
  } else if (value > 0) {
    breakdown.budget = 5;
  }

  // 2. Profile Completeness (max +15)
  if (lead.email && lead.email.includes('@')) breakdown.completeness += 5;
  if (lead.phone && lead.phone.length >= 7) breakdown.completeness += 5;
  if (lead.company && lead.company.trim().length > 1) breakdown.completeness += 5;

  // 3. Lead Source Quality (max +15)
  const sourceScores = {
    'Referral': 15,
    'LinkedIn': 12,
    'Website': 10,
    'Email Campaign': 8,
    'Advertisement': 7,
    'Cold Call': 5
  };
  breakdown.source = sourceScores[lead.source] || 8;

  // 4. Activity & Engagement Count (max +15)
  const leadActivities = activities.filter(a => a.leadId === lead.id);
  const activityScore = Math.min(leadActivities.length * 3, 15);
  breakdown.engagement = activityScore;

  // 5. Pipeline Stage Progression (max +15)
  const stageScores = {
    'New': 5,
    'Contacted': 10,
    'Qualified': 15,
    'Converted': 15,
    'Lost': 0
  };
  breakdown.stage = stageScores[lead.status] || 5;

  // Total
  score += breakdown.budget + breakdown.completeness + breakdown.source + breakdown.engagement + breakdown.stage;
  
  // Clamp between 5 and 99
  score = Math.min(Math.max(score, 5), 99);

  let category = 'Warm';
  let badgeClass = 'score-warm';

  if (score >= 75) {
    category = 'Hot';
    badgeClass = 'score-hot';
  } else if (score < 45) {
    category = 'Cold';
    badgeClass = 'score-cold';
  }

  return {
    score,
    category,
    badgeClass,
    breakdown
  };
}
