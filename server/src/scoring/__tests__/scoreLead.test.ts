import { describe, it, expect } from 'vitest';
import { scoreLead } from '../scoreLead.js';
import { Lead } from '@prisma/client';

describe('scoreLead', () => {
  const baseLead: Lead = {
    id: 'test-id',
    companyName: 'Test Construction',
    website: null,
    industryTrade: null,
    locations: null,
    employeeEstimate: 50,
    doesPublicWorks: 'unknown' as Lead['doesPublicWorks'],
    unionLikely: 'unknown' as Lead['unionLikely'],
    multiJobsite: 'unknown' as Lead['multiJobsite'],
    currentStack: null,
    painSignals: null,
    score: 0,
    scoreReasons: null,
    recommendedAngle: null,
    stage: 'NEW' as Lead['stage'],
    status: null,
    nextAction: null,
    nextActionDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should score public works + certified payroll keywords correctly', () => {
    const lead = {
      ...baseLead,
      doesPublicWorks: 'yes' as Lead['doesPublicWorks'],
      painSignals: 'We need certified payroll for our public works projects',
      employeeEstimate: 75,
      unionLikely: 'yes' as Lead['unionLikely'],
    };
    
    const result = scoreLead({ 
      lead, 
      primaryContactExists: true, 
      hasDirectContactInfo: true 
    });
    
    expect(result.score).toBe(75); // 20 (public works) + 10 (certified payroll) + 10 (union) + 15 (sweet spot) + 10 (primary contact)
    expect(result.scoreReasons).toContain('Public works / prevailing wage likely');
    expect(result.scoreReasons).toContain('Mentions certified payroll/prevailing wage');
    expect(result.recommendedAngle).toBe('Prevailing wage + certified payroll automation');
  });

  it('should score union only correctly', () => {
    const lead = {
      ...baseLead,
      unionLikely: 'yes' as Lead['unionLikely'],
      employeeEstimate: 45,
    };
    
    const result = scoreLead({ 
      lead, 
      primaryContactExists: true, 
      hasDirectContactInfo: true 
    });
    
    expect(result.score).toBe(45); // 10 (union) + 15 (sweet spot) + 10 (primary contact) + 10 (reachability)
    expect(result.scoreReasons).toContain('Union reporting likely');
    expect(result.recommendedAngle).toBe('Union reporting + compliance automation');
  });

  it('should score sweet spot size only correctly', () => {
    const lead = {
      ...baseLead,
      employeeEstimate: 100,
    };
    
    const result = scoreLead({ 
      lead, 
      primaryContactExists: true, 
      hasDirectContactInfo: false 
    });
    
    expect(result.score).toBe(28); // 15 (sweet spot) + 10 (reachability) + 3 (any contact)
    expect(result.scoreReasons).toContain('30–300 employees sweet spot');
    expect(result.recommendedAngle).toBe('Time tracking → payroll integration + fewer corrections');
  });

  it('should score manual workflow keywords only correctly', () => {
    const lead = {
      ...baseLead,
      painSignals: 'We are manually tracking timesheets in Excel',
      employeeEstimate: 25, // outside sweet spot
    };
    
    const result = scoreLead({ 
      lead, 
      primaryContactExists: false, 
      hasDirectContactInfo: false 
    });
    
    expect(result.score).toBe(13); // 10 (manual) + 3 (any contact)
    expect(result.scoreReasons).toContain('Manual time/payroll workflow');
  });

  it('should score multi jobsite only correctly', () => {
    const lead = {
      ...baseLead,
      multiJobsite: 'yes' as Lead['multiJobsite'],
      employeeEstimate: 200,
    };
    
    const result = scoreLead({ 
      lead, 
      primaryContactExists: true, 
      hasDirectContactInfo: true 
    });
    
    expect(result.score).toBe(30); // 15 (sweet spot) + 5 (multi jobsite) + 10 (primary contact)
    expect(result.scoreReasons).toContain('Multiple jobsites increases complexity');
  });

  it('should score no signals correctly', () => {
    const lead = {
      ...baseLead,
      employeeEstimate: 25, // outside sweet spot
    };
    
    const result1 = scoreLead({ 
      lead, 
      primaryContactExists: true, 
      hasDirectContactInfo: true 
    });
    
    const result2 = scoreLead({ 
      lead, 
      primaryContactExists: false, 
      hasDirectContactInfo: false 
    });
    
    expect(result1.score).toBe(10); // Only reachability bonus
    expect(result2.score).toBe(0); // No bonuses
    expect(result1.recommendedAngle).toBe('Time tracking → payroll integration + fewer corrections');
  });
});