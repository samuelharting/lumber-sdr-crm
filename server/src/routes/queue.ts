import { Router } from 'express';
import prisma from '../prisma.js';
import { LeadStage } from '@shared/activityTypes';

const router = Router();

function safeParseJson(jsonStr: string | null): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

// GET /api/queue/today - Get today's hit list
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leads = await prisma.lead.findMany({
      where: {
        AND: [
          {
            stage: {
              notIn: [LeadStage.MEETING_SET, LeadStage.CLOSED_LOST]
            }
          },
          {
            doNotContact: false
          },
          {
            OR: [
              {
                nextActionDate: {
                  lte: today
                }
              },
              {
                AND: [
                  {
                    nextActionDate: null
                  },
                  {
                    stage: {
                      in: [LeadStage.QUEUED, LeadStage.ATTEMPTING, LeadStage.WORKING, LeadStage.ENGAGED]
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      include: {
        contacts: {
          where: { isPrimary: true },
          select: {
            id: true,
            name: true,
            title: true,
            email: true,
            phone: true
          }
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: {
            type: true,
            result: true,
            timestamp: true
          }
        }
      },
      orderBy: [
        { nextActionDate: 'asc' },
        { score: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    const formattedLeads = leads.map(lead => ({
      lead_id: lead.id,
      company_name: lead.companyName,
      website: lead.website,
      score: lead.score,
      recommended_angle: lead.recommendedAngle,
      next_action: lead.nextAction,
      next_action_date: lead.nextActionDate?.toISOString().split('T')[0] || null,
      stage: lead.stage,
      status: lead.status,
      top_reasons: safeParseJson(lead.scoreReasons),
      primary_contact: lead.contacts[0] || null,
      last_activity: lead.activities[0] || null
    }));

    res.json(formattedLeads);

  } catch (error) {
    console.error('Error fetching today queue:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

export default router;