import { describe, it, expect } from 'vitest';
import { evaluateAutomation } from '../rules.js';
import { ActivityType, ActivityResult, LeadStage } from '../../../shared/activityTypes.js';

describe('evaluateAutomation', () => {
  // Test 1: Call no answer with NEW stage
  it('should update NEW lead to ATTEMPTING on call no answer', () => {
    const result = evaluateAutomation({
      type: ActivityType.CALL,
      result: ActivityResult.NO_ANSWER,
      currentStage: LeadStage.NEW
    });

    expect(result.status).toBe('Called no answer');
    expect(result.stage).toBe(LeadStage.ATTEMPTING);
    expect(result.nextAction).toBe('Call back');
    expect(result.nextActionDate).toBeDefined();
  });

  // Test 2: Call left VM with RESEARCHED stage
  it('should update RESEARCHED lead to ATTEMPTING on call left VM', () => {
    const result = evaluateAutomation({
      type: ActivityType.CALL,
      result: ActivityResult.LEFT_VM,
      currentStage: LeadStage.RESEARCHED
    });

    expect(result.status).toBe('Left VM');
    expect(result.stage).toBe(LeadStage.ATTEMPTING);
    expect(result.nextActionDate).toBeDefined();
  });

  // Test 3: Call connected should move to WORKING stage
  it('should keep stage as WORKING when connected', () => {
    const result = evaluateAutomation({
      type: ActivityType.CALL,
      result: ActivityResult.CONNECTED,
      currentStage: LeadStage.QUEUED
    });

    expect(result.status).toBe('Connected');
    expect(result.stage).toBe(LeadStage.WORKING);
  });

  // Test 4: Email replied should move to ENGAGED
  it('should update to ENGAGED on email replied', () => {
    const result = evaluateAutomation({
      type: ActivityType.EMAIL,
      result: ActivityResult.REPLIED,
      currentStage: LeadStage.WORKING
    });

    expect(result.status).toBe('Replied needs follow-up');
    expect(result.stage).toBe(LeadStage.ENGAGED);
  });

  // Test 5: Meeting set should move to MEETING_SET regardless of current stage
  it('should move to MEETING_SET on meeting set result', () => {
    const result = evaluateAutomation({
      type: ActivityType.CALL,
      result: ActivityResult.MEETING_SET,
      currentStage: LeadStage.ENGAGED
    });

    expect(result.status).toBe('Meeting set');
    expect(result.stage).toBe(LeadStage.MEETING_SET);
  });

  // Test 6: Do not contact should set stage to CLOSED_LOST
  it('should set stage to CLOSED_LOST but keep current stage', () => {
    const result = evaluateAutomation({
      type: ActivityType.NOTE,
      result: ActivityResult.DO_NOT_CONTACT,
      currentStage: LeadStage.ENGAGED
    });

    expect(result.status).toBe('Do not contact');
    expect(result.stage).toBe(LeadStage.CLOSED_LOST);
    expect(result.nextAction).toBeUndefined();
    expect(result.nextActionDate).toBeUndefined();
  });

  // Test 7: Not now should move to NURTURE
  it('should move to NURTURE on not now', () => {
    const result = evaluateAutomation({
      type: ActivityType.EMAIL,
      result: ActivityResult.NOT_NOW,
      currentStage: LeadStage.WORKING
    });

    expect(result.status).toBe('Not now');
    expect(result.stage).toBe(LeadStage.NURTURE);
  });

  // Test 8: Wrong person should preserve current stage
  it('should preserve stage on wrong person', () => {
    const result = evaluateAutomation({
      type: ActivityType.CALL,
      result: ActivityResult.WRONG_PERSON,
      currentStage: LeadStage.ATTEMPTING
    });

    expect(result.status).toBe('Wrong person');
    expect(result.stage).toBe(LeadStage.ATTEMPTING);
  });
});