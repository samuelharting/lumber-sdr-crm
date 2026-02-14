import { DoesPublicWorks, UnionLikely, MultiJobsite, Lead } from '@prisma/client';

export const SCORING_CONFIG = {
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  
  // Complexity Fit (0-40)
  PUBLIC_WORKS_BONUS: 20,
  CERTIFIED_PAYROLL_BONUS: 10,
  UNION_BONUS: 10,

  // Size/Urgency (0-25)
  SWEET_SPOT_BONUS: 15,
  GROWTH_SIGNAL_BONUS: 10,

  // Workflow Pain (0-25)
  MANUAL_WORKFLOW_BONUS: 10,
  MULTI_JOBSITE_BONUS: 5,
  PAYROLL_PAIN_BONUS: 10,

  // Reachability/Data Quality (0-10)
  PRIMARY_CONTACT_BONUS: 10,
  ANY_CONTACT_BONUS: 3,

  // Keywords
  CERTIFIED_PAYROLL_KEYWORDS: ['certified payroll', 'prevailing wage', 'union wage', 'government contract'],
  GROWTH_KEYWORDS: ['hiring', 'growing', 'growing fast', 'multiple locations', 'expanding', 'new site'],
  MANUAL_KEYWORDS: ['manual', 'streadsheet', 'excel', 'paper', 'paper timecard', 'manually'],
  PAYROLL_PAIN_KEYWORDS: ['payroll errors', 'late payroll', 'rework', 'timesheet errors', 'incorrect hours'],
} as const;

export function evaluateComplexityFit(lead: Lead): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const painSignals = (lead.painSignals || '').toLowerCase();

  if (lead.doesPublicWorks === DoesPublicWorks.yes) {
    score += SCORING_CONFIG.PUBLIC_WORKS_BONUS;
    reasons.push('Public works / prevailing wage likely');
  }

  if (SCORING_CONFIG.CERTIFIED_PAYROLL_KEYWORDS.some(keyword => 
    painSignals.includes(keyword.toLowerCase())
  )) {
    score += SCORING_CONFIG.CERTIFIED_PAYROLL_BONUS;
    reasons.push('Mentions certified payroll/prevailing wage');
  }

  if (lead.unionLikely === UnionLikely.yes) {
    score += SCORING_CONFIG.UNION_BONUS;
    reasons.push('Union reporting likely');
  }

  return { score, reasons };
}

export function evaluateSizeUrgency(lead: Lead): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const painSignals = (lead.painSignals || '').toLowerCase();

  if (lead.employeeEstimate && 
      lead.employeeEstimate >= 30 && 
      lead.employeeEstimate <= 300) {
    score += SCORING_CONFIG.SWEET_SPOT_BONUS;
    reasons.push('30–300 employees sweet spot');
  }

  if (SCORING_CONFIG.GROWTH_KEYWORDS.some(keyword => 
    painSignals.includes(keyword.toLowerCase())
  )) {
    score += SCORING_CONFIG.GROWTH_SIGNAL_BONUS;
    reasons.push('Growth signals (hiring/multi-location)');
  }

  return { score, reasons };
}

export function evaluateWorkflowPain(lead: Lead): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const painSignals = (lead.painSignals || '').toLowerCase();

  if (SCORING_CONFIG.MANUAL_KEYWORDS.some(keyword => 
    painSignals.includes(keyword.toLowerCase())
  )) {
    score += SCORING_CONFIG.MANUAL_WORKFLOW_BONUS;
    reasons.push('Manual time/payroll workflow');
  }

  if (lead.multiJobsite === MultiJobsite.yes) {
    score += SCORING_CONFIG.MULTI_JOBSITE_BONUS;
    reasons.push('Multiple jobsites increases complexity');
  }

  if (SCORING_CONFIG.PAYROLL_PAIN_KEYWORDS.some(keyword => 
    painSignals.includes(keyword.toLowerCase())
  )) {
    score += SCORING_CONFIG.PAYROLL_PAIN_BONUS;
    reasons.push('Payroll corrections/rework pain');
  }

  return { score, reasons };
}

export function evaluateReachability(
  lead: Lead,
  primaryContactExists: boolean,
  hasDirectContactInfo: boolean
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (primaryContactExists && hasDirectContactInfo) {
    score += SCORING_CONFIG.PRIMARY_CONTACT_BONUS;
    reasons.push('Primary contact with direct info');
  } else if (primaryContactExists) {
    score += SCORING_CONFIG.ANY_CONTACT_BONUS;
    reasons.push('Contact exists, not primary/direct');
  }

  return { score, reasons };
}

export function determineRecommendedAngle(lead: Lead): string {
  const painSignals = (lead.painSignals || '').toLowerCase();

  if (lead.doesPublicWorks === DoesPublicWorks.yes || 
      SCORING_CONFIG.CERTIFIED_PAYROLL_KEYWORDS.some(keyword => 
        painSignals.includes(keyword.toLowerCase())
      )) {
    return 'Prevailing wage + certified payroll automation';
  }

  if (lead.unionLikely === UnionLikely.yes) {
    return 'Union reporting + compliance automation';
  }

  return 'Time tracking → payroll integration + fewer corrections';
}