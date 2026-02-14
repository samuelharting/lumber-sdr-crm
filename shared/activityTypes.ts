export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  VOICEMAIL = 'voicemail',
  LINKEDIN = 'linkedin',
  NOTE = 'note'
}

export enum LeadStage {
  NEW = 'NEW',
  RESEARCHED = 'RESEARCHED',
  QUEUED = 'QUEUED',
  ATTEMPTING = 'ATTEMPTING',
  WORKING = 'WORKING',
  ENGAGED = 'ENGAGED',
  MEETING_SET = 'MEETING_SET',
  NURTURE = 'NURTURE',
  CLOSED_LOST = 'CLOSED_LOST'
}

export enum ActivityResult {
  NO_ANSWER = 'no answer',
  LEFT_VM = 'left vm',
  CONNECTED = 'connected',
  SENT = 'sent',
  REPLIED = 'replied',
  BOUNCED = 'bounced',
  NOT_NOW = 'not now',
  WRONG_PERSON = 'wrong person',
  MEETING_SET = 'meeting set',
  DO_NOT_CONTACT = 'do not contact'
}

export interface CreateActivityRequest {
  leadId: string;
  contactId?: string;
  type: ActivityType;
  result?: ActivityResult;
  notes?: string;
  timestamp?: string;
}

export interface ActivityResponse {
  id: string;
  leadId: string;
  contactId?: string;
  type: ActivityType;
  result?: ActivityResult;
  notes?: string;
  timestamp: string;
  lead: {
    id: string;
    companyName: string;
    status: string;
    stage: LeadStage;
    nextAction?: string;
    nextActionDate?: string;
  };
}

export interface AutomationResult {
  status: string;
  stage: LeadStage;
  nextAction?: string;
  nextActionDate?: string;
}