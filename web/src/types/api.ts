export interface Lead {
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
  score: number;
  scoreReasons?: string;
  recommendedAngle?: string;
  stage: 
    | 'NEW' | 'RESEARCHED' | 'QUEUED' | 'ATTEMPTING' | 'WORKING' 
    | 'ENGAGED' | 'MEETING_SET' | 'NURTURE' | 'CLOSED_LOST';
  status?: string;
  nextAction?: string;
  nextActionDate?: string;
  doNotContact: boolean;
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
  type: 
    | 'call' | 'email' | 'voicemail' | 'linkedin' | 'note';
  result?: 
    | 'no answer' | 'left vm' | 'connected' | 'sent' | 'replied' 
    | 'bounced' | 'not now' | 'wrong person' | 'meeting set' | 'do not contact';
  notes?: string;
  timestamp: string;
  leadId: string;
  contactId?: string;
  contact?: Contact;
}

export interface CreateActivityRequest {
  leadId: string;
  contactId?: string;
  type: 
    | 'call' | 'email' | 'voicemail' | 'linkedin' | 'note';
  result?: 
    | 'no answer' | 'left vm' | 'connected' | 'sent' | 'replied' 
    | 'bounced' | 'not now' | 'wrong person' | 'meeting set' | 'do not contact';
  notes?: string;
  timestamp?: string;
}

export type ActivityResponse = Activity;

export const ActivityType = {
  CALL: 'call',
  EMAIL: 'email',
  VOICEMAIL: 'voicemail',
  LINKEDIN: 'linkedin',
  NOTE: 'note',
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const ActivityResult = {
  NO_ANSWER: 'no answer',
  LEFT_VM: 'left vm',
  CONNECTED: 'connected',
  SENT: 'sent',
  REPLIED: 'replied',
  BOUNCED: 'bounced',
  NOT_NOW: 'not now',
  WRONG_PERSON: 'wrong person',
  MEETING_SET: 'meeting set',
  DO_NOT_CONTACT: 'do not contact',
} as const;
export type ActivityResult = (typeof ActivityResult)[keyof typeof ActivityResult];