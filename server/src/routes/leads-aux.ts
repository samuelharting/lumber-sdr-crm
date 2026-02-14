import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// PATCH /api/leads/:id/do-not-contact - Mark lead as do-not-contact
router.patch('/:id/do-not-contact', async (req, res) => {
  try {
    const { id } = req.params;
    const { doNotContact } = req.body;

    const lead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        doNotContact: doNotContact ?? true,
        status: 'Do not contact',
        stage: 'CLOSED_LOST' as any,
        nextAction: null,
        nextActionDate: null,
        updatedAt: new Date()
      }
    });

    res.json(updatedLead);

  } catch (error) {
    console.error('Error updating do-not-contact:', error);
    res.status(500).json({ error: 'Failed to update do-not-contact status' });
  }
});

export default router;