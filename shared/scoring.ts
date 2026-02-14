export interface ScoringResult {
  score: number;
  scoreReasons: string[];
  recommendedAngle: string;
}

export interface LeadForScoring {
  id: string;
  companyName: string;
  website?: string;
  industryTrade?: string;
  locations?: string;
  employeeEstimate?: number;
  doesPublicWorks: 'yes' | 'no' | 'unknown';
  unionLikely: 'yes' | 'no' | 'unknown';
  multiJobsite: 'yes' | 'no' | 'unknown';
  currentStack?: string;
  painSignals?: string;
}

export const ScoringWeights = {
  COMPLEXITY_INFO: 40,
  SIZE_URGENCY: 25,
  WORKFLOW_PAIN: 25,
  REACHABILITY: 10,
} as const;

export const ScoringConstants = {
  PUBLIC_WORKS_BONUS: 20,
  CERTIFIED_PAYROLL_KEYWORDS: ['certified payroll', 'prevailing wage'],
  UNION_BONUS: 10,
  SWEET_SPOT_MIN: 30,
  SWEET_SPOT_MAX: 300,
  GROWTH_KEYWORDS: ['hiring', 'growing', 'multiple locations'],
  MANUAL_KEYWORDS: ['manual', 'spreadsheet', 'paper timecard'],
  PAYROLL_PAIN_KEYWORDS: ['payroll errors', 'late payroll', 'rework'],
  MULTI_JOBSITE_BONUS: 5,
  PRIMARY_CONTACT_BONUS: 10,
  ANY_CONTACT_BONUS: 3,
} as const;

export const RecommendedAngles = {
  PUBLIC_WORKS: 'Prevailing wage + certified payroll automation',
  UNION: 'Union reporting + compliance automation',
  GENERAL: 'Time tracking → payroll integration + fewer corrections',
} as const;