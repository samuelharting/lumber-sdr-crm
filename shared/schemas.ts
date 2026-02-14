import { z } from 'zod';

export const CreateLeadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim()
});

export const LeadSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string(),
  website: z.string().url().optional(),
  industryTrade: z.string().optional(),
  locations: z.string().optional(),
  employeeEstimate: z.number().int().nonnegative().optional(),
  doesPublicWorks: z.enum(['yes', 'no', 'unknown']),
  unionLikely: z.enum(['yes', 'no', 'unknown']),
  multiJobsite: z.enum(['yes', 'no', 'unknown']),
  currentStack: z.string().optional(),
  painSignals: z.string().optional(),
  score: z.number().int().nonnegative(),
  scoreReasons: z.string().optional(),
  recommendedAngle: z.string().optional(),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  status: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const ContactSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  name: z.string(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  isPrimary: z.boolean()
});

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'PROGRESS', 'STATUS_CHANGE']),
  result: z.string().optional(),
  notes: z.string().optional(),
  timestamp: z.string().datetime()
});