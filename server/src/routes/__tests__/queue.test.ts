import { describe, it, expect } from 'vitest';
import { LeadStage } from '../../../shared/activityTypes.js';

describe('Today Queue Logic', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Helper to create test lead objects
  const createTestLead = (overrides: any) => ({
    id: 'test-id',
    companyName: 'Test Co',
    score: 50,
    stage: LeadStage.ATTEREMPTING,
    doNotContact: false,
    ...overrides
  });

  // Test 1: Include leads due today
  it('should include leads due today', () => {
    const result = wouldIncludeInQueue({
      stage: LeadStage.ATTEMPTING,
      doNotContact: false,
      nextActionDate: yesterday
    });
    expect(result).toBe(true);
  });

  // Test 2: Include null next_action_date with qualifying stage
  it('should include null next_action_date for QUALIFYING stages', () => {
    const qualifyingStages = [LeadStage.QUEUED, LeadStage.ATTEMPTING, LeadStage.WORKING, LeadStage.ENGAGED];
    
    qualifyingStages.forEach(stage => {
      const result = wouldIncludeInQueue({
        stage,
        doNotContact: false,
        nextActionDate: null
      });
      expect(result).toBe(true);
    });
  });

  // Test 3: Exclude MEETING_SET
  it('should exclude MEETING_SET leads', () => {
    const result = wouldIncludeInQueue({
      stage: LeadStage.MEETING_SET,
      doNotContact: false,
      nextActionDate: yesterday
    });
    expect(result).toBe(false);
  });

  // Test 4: Exclude CLOSED_LOST
  it('should exclude CLOSED_LOST leads', () => {
    const result = wouldIncludeInQueue({
      stage: LeadStage.CLOSED_LOST,
      doNotContact: false,
      nextActionDate: yesterday
    });
    expect(result).toBe(false);
  });

  // Test 5: Exclude do not contact
  it('should exclude do not contact leads', () => {
    const result = wouldIncludeInQueue({
      stage: LeadStage.ATTEMPTING,
      doNotContact: true,
      nextActionDate: yesterday
    });
    expect(result).toBe(false);
  });

  // Test 6: Exclude future next_action_date
  it('should exclude future next_action_date', () => {
    const result = wouldIncludeInQueue({
      stage: LeadStage.ATTEMPTING,
      doNotContact: false,
      nextActionDate: tomorrow
    });
    expect(result).toBe(false);
  });

  // Test 7: Exclude null next_action_date with non-qualifying stage
  it('should exclude null next_action_date with non-qualifying stage', () => {
    const nonQualifyingStages = [LeadStage.NEW, LeadStage.MEETING_SET, LeadStage.NURTURE, LeadStage.CLOSED_LOST];
    
    nonQualifyingStages.forEach(stage => {
      const result = wouldIncludeInQueue({
        stage,
        doNotContact: false,
        nextActionDate: null
      });
      expect(result).toBe(false);
    });
  });
});

// Helper function for testing queue inclusion logic
function wouldIncludeInQueue(lead: any): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check exclusions
  const excludedStages = [LeadStage.MEETING_SET, LeadStage.CLOSED_LOST];
  if (excludedStages.includes(lead.stage)) return false;
  if (lead.doNotContact) return false;
  
  // Check inclusions
  const qualifyingStages = [LeadStage.QUEUED, LeadStage.ATTEMPTING, LeadStage.WORKING, LeadStage.ENGAGED];
  
  if (lead.nextActionDate === null) {
    return qualifyingStages.includes(lead.stage);
  }
  
  return lead.nextActionDate <= today;
}