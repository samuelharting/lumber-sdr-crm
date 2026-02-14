import { Router } from 'express';
import prisma from '../prisma.js';
import { CreateActivityRequest, ActivityType, ActivityResult } from '@shared/activityTypes';
import { evaluateAutomation } from '../automation/rules.js';

const router = Router();

// POST /api/activities - Create activity and apply automation
router.post('/', async (req, res) => {
  try {
    const { leadId, contactId, type, result, notes, timestamp }: CreateActivityRequest = req.body;

    if (!leadId || !type) {
      return res.status(400).json({ error: 'leadId and type are required' });
    }

    // Get current lead state
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { activities: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (lead.doNotContact) {
      return res.status(403).json({ error: 'Cannot update activities for do-not-contact leads' });
    }

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        type,
        result,
        notes,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        leadId,
        contactId
      },
      include: {
        lead: true,
        contact: true
      }
    });

    // Apply automation if result is provided
    let automationResult = null;
    if (result) {
      const automation = evaluateAutomation({
        type,
        result: result as ActivityResult,
        currentStage: lead.stage
      });

      // Update the lead based on automation rules
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: automation.status,
          stage: automation.stage,
          nextAction: automation.nextAction || null,
          nextActionDate: automation.nextActionDate ? new Date(automation.nextActionDate) : null,
          updatedAt: new Date()
        }
      });

      automationResult = automation;
    }

    res.json({
      activity: {
        ...activity,
        lead: await prisma.lead.findUnique({ where: { id: leadId } })
      },
      automation: automationResult
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// GET /api/leads/:id/activities - Get activities for a lead
router.get('/leads/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await prisma.activity.findMany({
      where: { leadId: id },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            title: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;