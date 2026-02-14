export enum DoesPublicWorks {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown'
}

export enum UnionLikely {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown'
}

export enum MultiJobsite {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown'
}

export enum Stage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST'
}

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  PROGRESS = 'PROGRESS',
  STATUS_CHANGE = 'STATUS_CHANGE'
}

export interface Lead {
  id: string;
  companyName: string;
  website?: string;
  industryTrade?: string;
  locations?: string;
  employeeEstimate?: number;
  doesPublicWorks: DoesPublicWorks;
  unionLikely: UnionLikely;
  multiJobsite: MultiJobsite;
  currentStack?: string;
  painSignals?: string;
  score: number;
  scoreReasons?: string;
  recommendedAngle?: string;
  stage: Stage;
  status?: string;
  nextAction?: string;
  nextActionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  leadId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  isPrimary: boolean;
}

export interface Activity {
  id: string;
  leadId: string;
  contactId?: string;
  type: ActivityType;
  result?: string;
  notes?: string;
  timestamp: string;
}

export interface LeadWithScoring {
  id: string;
  companyName: string;
  website?: string;
  industryTrade?: string;
  locations?: string;
  employeeEstimate?: number;
  doesPublicWorks: DoesPublicWorks;
  unionLikely: UnionLikely;
  multiJobsite: MultiJobsite;
  currentStack?: string;
  painSignals?: string;
  score: number;
  scoreReasons?: string;
  recommendedAngle?: string;
  stage: Stage;
  status?: string;
  nextAction?: string;
  nextActionDate?: string;
  createdAt: string;
  updatedAt: string;
}