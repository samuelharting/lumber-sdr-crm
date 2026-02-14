import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create fake leads
  const leads = [
    {
      companyName: 'Acme Construction Corp',
      website: 'https://acme-construction.com',
      industryTrade: 'Commercial Construction',
      locations: 'Chicago, IL',
      employeeEstimate: 150,
      doesPublicWorks: 'yes',
      unionLikely: 'yes',
      multiJobsite: 'yes',
      currentStack: 'Manual processes + spreadsheets',
      painSignals: 'Tired of job tracking chaos, timecard issues on multi-site projects',
      stage: 'NEW'
    },
    {
      companyName: 'BuildRight LLC',
      website: 'https://buildright-llc.com',
      industryTrade: 'Residential Remodeling',
      locations: 'Denver, CO',
      employeeEstimate: 45,
      doesPublicWorks: 'no',
      unionLikely: 'no',
      multiJobsite: 'yes',
      currentStack: 'QuickBooks + phone calls',
      painSignals: 'Losing money on job costing, field data never makes it to office',
      stage: 'NEW'
    },
    {
      companyName: 'Metro Infrastructure',
      website: 'https://metro-infra.com',
      industryTrade: 'Civil Infrastructure',
      locations: 'Phoenix, AZ',
      employeeEstimate: 250,
      doesPublicWorks: 'yes',
      unionLikely: 'yes',
      multiJobsite: 'yes',
      currentStack: 'Old SAP system + Excel',
      painSignals: 'Workers getting lost between sites, payroll taking 3 days to process',
      stage: 'NEW'
    },
    {
      companyName: 'Elite Carpentry Group',
      industryTrade: 'Finish Carpentry',
      locations: 'Seattle, WA',
      employeeEstimate: 25,
      doesPublicWorks: 'unknown',
      unionLikely: 'yes',
      multiJobsite: 'no',
      currentStack: 'WhatsApp + paper timesheets',
      painSignals: 'Constant texting to figure out where crews are, materials arriving at wrong sites',
      stage: 'NEW'
    },
    {
      companyName: 'Valley General Contractors',
      website: 'https://valley-gc.com',
      industryTrade: 'General Contracting',
      locations: 'Sacramento, CA',
      employeeEstimate: 80,
      doesPublicWorks: 'yes',
      unionLikely: 'no',
      multiJobsite: 'yes',
      currentStack: 'Multiple software systems that dont talk to each other',
      painSignals: 'PMs spending half day on status updates instead of managing jobs',
      stage: 'NEW'
    }
  ];

  console.log('🌱 Seeding database...');

  for (const leadData of leads) {
    const lead = await prisma.lead.create({
      data: leadData
    });
    console.log(`Created lead: ${lead.companyName}`);

    // Add a primary contact to each lead
    const contacts = [
      {
        leadId: lead.id,
        name: `John Smith`,
        title: 'Operations Manager',
        email: `john@${lead.companyName.toLowerCase().replace(/\s+/g, '-')}.com`,
        phone: `(555) ${String(100 + Math.floor(Math.random() * 900)).slice(0, 3)}-${String(1000 + Math.floor(Math.random() * 9000)).slice(0, 4)}`,
        isPrimary: true
      }
    ];

    for (const contactData of contacts) {
      const contact = await prisma.contact.create({
        data: contactData
      });
      console.log(`  Created contact: ${contact.name}`);
    }

    // Add one activity to demonstrate structure
    const activity = await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'NOTE',
        notes: 'Initial lead added to CRM for evaluation',
        result: 'Added to system'
      }
    });
    console.log(`  Created activity: ${activity.type}`);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });