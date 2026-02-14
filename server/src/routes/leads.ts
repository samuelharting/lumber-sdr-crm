import { Router } from 'express';
import prisma from '../prisma.js';
import { scoreLead } from '../scoring/scoreLead.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = Router();

// GET /api/leads - Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST /api/leads - Create a new lead
router.post('/', async (req, res) => {
  try {
    const { companyName } = req.body;
    
    if (!companyName || typeof companyName !== 'string') {
      return res.status(400).json({ error: 'companyName is required and must be a string' });
    }

    const lead = await prisma.lead.create({
      data: {
        companyName: companyName.trim()
      }
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// POST /api/leads/:id/score - Recompute score for single lead
router.post('/:id/score', async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        contacts: {
          where: { isPrimary: true },
          select: { 
            email: true, 
            phone: true 
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const primaryContactExists = lead.contacts.length > 0;
    const hasDirectContactInfo = lead.contacts.some(c => c.email || c.phone);

    const scoring = scoreLead({ 
      lead, 
      primaryContactExists, 
      hasDirectContactInfo 
    });

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        score: scoring.score,
        scoreReasons: JSON.stringify(scoring.scoreReasons),
        recommendedAngle: scoring.recommendedAngle
      }
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Error scoring lead:', error);
    res.status(500).json({ error: 'Failed to score lead' });
  }
});

// POST /api/leads/score/batch - Recompute scores for all leads
router.post('/score/batch', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        contacts: {
          select: { 
            email: true, 
            phone: true,
            isPrimary: true
          }
        }
      }
    });

    const scoredLeads = [];

    for (const lead of leads) {
      const primaryContactExists = lead.contacts.some(c => c.isPrimary);
      const hasDirectContactInfo = lead.contacts.some(c => 
        c.isPrimary && (c.email || c.phone)
      );

      const scoring = scoreLead({
        lead,
        primaryContactExists,
        hasDirectContactInfo
      });

      const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: scoring.score,
          scoreReasons: JSON.stringify(scoring.scoreReasons),
          recommendedAngle: scoring.recommendedAngle
        }
      });

      scoredLeads.push(updatedLead);
    }

    res.json({
      message: `Successfully scored ${scoredLeads.length} leads`,
      leads: scoredLeads
    });
  } catch (error) {
    console.error('Error batch scoring leads:', error);
    res.status(500).json({ error: 'Failed to batch score leads' });
  }
});

// GET /api/leads/:id - Get single lead
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        contacts: {
          select: {
            id: true,
            name: true,
            title: true,
            email: true,
            phone: true,
            linkedinUrl: true,
            isPrimary: true
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

export default router;