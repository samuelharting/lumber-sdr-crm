import { PrismaClient } from '@prisma/client';

// Use the same pattern as the application
const DATABASE_URL = 'file:./data/database.db';

const prisma = new PrismaClient({
  datasourceUrl: 'file:./data/database.db'
} as any);

async function main() {
  console.log('Starting database seed...');

  // Sample construction contractor leads
  const leadsData = [
    {
      companyName: "ABC Construction LLC",
      website: "https://abcconstruction.com",
      industryTrade: "Commercial Construction",
      locations: "Denver, CO",
      employeeEstimate: 45,
      doesPublicWorks: "yes",
      unionLikely: "yes",
      multiJobsite: "yes",
      currentStack: "QuickBooks, Excel",
      painSignals: "Manual time tracking across 8 job sites",
      score: 85,
      scoreReasons: "Public works + union + multi-jobsite employer",
      recommendedAngle: "Union payroll automation across multiple certified job sites",
      stage: "NEW",
      status: "Active",
      nextAction: "Initial outreach call",
      nextActionDate: new Date('2026-02-14'),
      contacts: [
        {
          name: "Sarah Mitchell",
          title: "Office Manager",
          email: "sarah@abcconstruction.com",
          phone: "(303) 555-0123",
          isPrimary: true,
        },
        {
          name: "Mike Johnson",
          title: "Project Manager",
          email: "mike@abcconstruction.com",
          phone: "(303) 555-0124",
          isPrimary: false,
        }
      ],
      activities: [
        {
          type: "CALL",
          result: "no answer",
          notes: "Called main line, went to voicemail",
        }
      ]
    },
    {
      companyName: "Metro Electric Inc",
      website: "https://metroelectric.com",
      industryTrade: "Electrical Contracting",
      locations: "Phoenix, AZ",
      employeeEstimate: 32,
      doesPublicWorks: "yes",
      unionLikely: "yes",
      multiJobsite: "yes",
      currentStack: "ADP, spreadsheets",
      painSignals: "Certified payroll requirements for public projects",
      score: 90,
      scoreReasons: "High-margin electrical + union requirements",
      recommendedAngle: "Prevailing wage automation for IBEW contracts",
      stage: "RESEARCHED",
      status: "Active",
      nextAction: "Send LinkedIn connection",
      nextActionDate: new Date('2026-02-15'),
      contacts: [
        {
          name: "David Rodriguez",
          title: "HR Director",
          email: "david@metroelectric.com",
          phone: "(602) 555-0456",
          isPrimary: true,
        }
      ],
      activities: [
        {
          type: "EMAIL",
          result: "sent",
          notes: "Initial intro email with union payroll pain point",
        }
      ]
    },
    {
      companyName: "Pipeline Plumbing Solutions",
      website: "https://pipelineplumbing.com",
      industryTrade: "Plumbing & HVAC",
      locations: "Las Vegas, NV",
      employeeEstimate: 28,
      doesPublicWorks: "yes",
      unionLikely: "no",
      multiJobsite: "yes",
      currentStack: "Gusto, QuickBooks Desktop",
      painSignals: "Tracking apprentice hours across multiple job sites",
      score: 75,
      scoreReasons: "Multi-jobsite + apprentice tracking needs",
      recommendedAngle: "Apprentice hour tracking with GPS verification",
      stage: "QUEUED",
      status: "Active",
      nextAction: "Follow up in 3 days",
      nextActionDate: new Date('2026-02-16'),
      contacts: [
        {
          name: "Lisa Chang",
          title: "Operations Manager",
          email: "lisa@pipelineplumbing.com",
          phone: "(702) 555-0789",
          isPrimary: true,
        }
      ],
      activities: []
    },
    {
      companyName: "Desert Sun Concrete",
      website: null,
      industryTrade: "Concrete & Masonry",
      locations: "Albuquerque, NM",
      employeeEstimate: 55,
      doesPublicWorks: "unknown",
      unionLikely: "yes",
      multiJobsite: "no",
      currentStack: "Paper time cards",
      painSignals: "Large crew payroll processing weekly",
      score: 70,
      scoreReasons: "Large crew + potential union payroll",
      recommendedAngle: "Union crew payroll automation",
      stage: "NEW",
      status: "Active",
      nextAction: "Research company background",
      nextActionDate: new Date('2026-02-17'),
      contacts: [
        {
          name: "Robert Martinez",
          title: "Owner",
          email: "robert@desertsunconcrete.com",
          phone: "(505) 555-0345",
          isPrimary: true,
        }
      ],
      activities: [
        {
          type: "NOTE",
          result: "created lead",
          notes: "Found through union directory, needs research",
        }
      ]
    },
    {
      companyName: "Rocky Mountain Roofing",
      website: "https://rockymountainroofing.com",
      industryTrade: "Commercial Roofing",
      locations: "Salt Lake City, UT",
      employeeEstimate: 22,
      doesPublicWorks: "yes",
      unionLikely: "yes",
      multiJobsite: "yes",
      currentStack: "Paychex, Excel templates",
      painSignals: "Prevailing wage certified payroll reporting",
      score: 88,
      scoreReasons: "Public works + union + certified payroll pain point",
      recommendedAngle: "Prevailing wage certified payroll automation",
      stage: "ATTEMPTING",
      status: "Active",
      nextAction: "Follow up call attempt",
      nextActionDate: new Date('2026-02-13'),
      contacts: [
        {
          name: "Jennifer Adams",
          title: "Executive Assistant",
          email: "jennifer@rockymountainroofing.com",
          phone: "(801) 555-0567",
          isPrimary: true,
        },
        {
          name: "Tom Wilson",
          title: "Field Supervisor",
          email: "tom@rockymountainroofing.com",
          phone: "(801) 555-0568",
          isPrimary: false,
        }
      ],
      activities: [
        {
          type: "CALL",
          result: "no answer",
          notes: "Calling during lunch hours - try after 2pm",
        },
        {
          type: "EMAIL",
          result: "sent",
          notes: "Follow-up email after missed call",
        }
      ]
    }
  ];

  console.log('Creating sample leads and contacts...');

  for (const leadData of leadsData) {
    console.log(`Processing lead: ${leadData.companyName}`);

    // Create or update the lead
    const lead = await prisma.lead.upsert({
      where: {
        companyName: leadData.companyName
      },
      update: {},
      create: {
        companyName: leadData.companyName,
        website: leadData.website,
        industryTrade: leadData.industryTrade,
        locations: leadData.locations,
        employeeEstimate: leadData.employeeEstimate,
        doesPublicWorks: leadData.doesPublicWorks as any,
        unionLikely: leadData.unionLikely as any,
        multiJobsite: leadData.multiJobsite as any,
        currentStack: leadData.currentStack,
        painSignals: leadData.painSignals,
        score: leadData.score,
        scoreReasons: leadData.scoreReasons,
        recommendedAngle: leadData.recommendedAngle,
        stage: leadData.stage as any,
        status: leadData.status,
        nextAction: leadData.nextAction,
        nextActionDate: leadData.nextActionDate,
      }
    });

    console.log(`🎯 Created lead: ${lead.companyName} (${lead.id})`);

    // Create contacts for this lead
    if (leadData.contacts && leadData.contacts.length > 0) {
      for (const contactData of leadData.contacts) {
        const contact = await prisma.contact.create({
          data: {
            leadId: lead.id,
            name: contactData.name,
            title: contactData.title,
            email: contactData.email,
            phone: contactData.phone,
            isPrimary: contactData.isPrimary,
          }
        });
        console.log(`   👤 Created contact: ${contact.name} (${contact.isPrimary ? 'Primary' : 'Secondary'})`);
      }
    }

    // Create activities for this lead
    if (leadData.activities && leadData.activities.length > 0) {
      for (const activityData of leadData.activities) {
        const activity = await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: activityData.type as any,
            result: activityData.result,
            notes: activityData.notes,
          }
        });
        console.log(`   📞 Created activity: ${activity.type} - ${activity.result}`);
      }
    }
  }

  console.log("\n✅ Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });