import { Lead } from '@prisma/client';
import { evaluateComplexityFit, evaluateSizeUrgency, evaluateWorkflowPain, evaluateReachability, determineRecommendedAngle } from './scoringRules.js';

export interface LeadWithContacts {
  lead: Lead;
  primaryContactExists: boolean;
  hasDirectContactInfo: boolean;
}

export function scoreLead({ 
  lead, 
  primaryContactExists = false, 
  hasDirectContactInfo = false 
}: LeadWithContacts): {
  score: number;
  scoreReasons: string[];
  recommendedAngle: string;
} {
  const complexity = evaluateComplexityFit(lead);
  const sizeUrgency = evaluateSizeUrgency(lead);
  const workflowPain = evaluateWorkflowPain(lead);
  const reachability = evaluateReachability(lead, primaryContactExists, hasDirectContactInfo);

  const totalScore = Math.min(100, Math.max(0, 
    complexity.score + sizeUrgency.score + workflowPain.score + reachability.score
  ));

  const allReasons = [
    ...complexity.reasons,
    ...sizeUrgency.reasons,
    ...workflowPain.reasons,
    ...reachability.reasons
  ];

  const angle = determineRecommendedAngle(lead);

  return {
    score: totalScore,
    scoreReasons: allReasons,
    recommendedAngle: angle
  };
}