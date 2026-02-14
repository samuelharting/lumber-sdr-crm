import { ActivityType, ActivityResult, LeadStage } from '@shared/activityTypes';
import { calculateNextActionDate } from '../utils/dateUtils.js';

export interface AutomationData {
  type: ActivityType;
  result: ActivityResult;
  currentStage: LeadStage;
}

export interface AutomationResult {
  status: string;
  stage: LeadStage;
  nextAction?: string;
  nextActionDate?: string;
}

export function evaluateAutomation(data: AutomationData): AutomationResult {
  const { type, result, currentStage } = data;
  const now = new Date();

  // Call outcomes
  if (type === ActivityType.CALL) {
    switch (result) {
      case ActivityResult.NO_ANSWER:
        return{
          status: 'Called no answer',
          stage: [LeadStage.NEW, LeadStage.RESEARCHED, LeadStage.QUEUED].includes(currentStage) 
            ? LeadStage.ATTEMPTING 
            : currentStage,
          nextAction: 'Call back',
          nextActionDate: calculateNextActionDate(now, 2)
        };

      case ActivityResult.LEFT_VM:
        return {
          status: 'Left VM',
          stage: [LeadStage.NEW, LeadStage.RESEARCHED, LeadStage.QUEUED].includes(currentStage)
            ? LeadStage.ATTEMPTING
            : currentStage,
          nextAction: 'Send follow-up email referencing VM',
          nextActionDate: calculateNextActionDate(now, 1)
        };

      case ActivityResult.CONNECTED:
        return {
          status: 'Connected',
          stage: currentStage !== LeadStage.MEETING_SET ? LeadStage.WORKING : currentStage,
          nextAction: 'Send recap email + ask 3 qualifier questions',
          nextActionDate: calculateNextActionDate(now, 0)
        };
    }
  }

  // Email outcomes
  if (type === ActivityType.EMAIL) {
    switch (result) {
      case ActivityResult.SENT:
        return {
          status: 'Emailed no reply',
          stage: [LeadStage.NEW, LeadStage.RESEARCHED, LeadStage.QUEUED].includes(currentStage)
            ? LeadStage.ATTEMPTING
            : currentStage,
          nextAction: 'Follow-up email #1',
          nextActionDate: calculateNextActionDate(now, 3)
        };

      case ActivityResult.REPLIED:
        return {
          status: 'Replied needs follow-up',
          stage: LeadStage.ENGAGED,
          nextAction: 'Reply and ask 3 qualifier questions',
          nextActionDate: calculateNextActionDate(now, 0)
        };

      case ActivityResult.BOUNCED:
        return {
          status: 'Email bounced',
          stage: currentStage,
          nextAction: 'Find correct email / alternate contact',
          nextActionDate: calculateNextActionDate(now, 0)
        };
    }
  }

  // Disposition outcomes (apply to any type)
  switch (result) {
    case ActivityResult.NOT_NOW:
      return {
        status: 'Not now',
        stage: LeadStage.NURTURE,
        nextAction: 'Nurture check-in',
        nextActionDate: calculateNextActionDate(now, 30)
      };

    case ActivityResult.WRONG_PERSON:
      return {
        status: 'Wrong person',
        stage: currentStage,
        nextAction: 'Find correct contact',
        nextActionDate: calculateNextActionDate(now, 0)
      };

    case ActivityResult.MEETING_SET:
      return {
        status: 'Meeting set',
        stage: LeadStage.MEETING_SET,
        nextAction: 'Prep for meeting (research + agenda)',
        nextActionDate: calculateNextActionDate(now, 0)
      };

    case ActivityResult.DO_NOT_CONTACT:
      return {
        status: 'Do not contact',
        stage: LeadStage.CLOSED_LOST,
        nextAction: undefined,
        nextActionDate: undefined
      };
  }

  // Default case for unmatched rules
  return {
    status: `${type} logged`,
    stage: currentStage,
    nextAction: 'Follow up',
    nextActionDate: calculateNextActionDate(now, 1)
  };
}