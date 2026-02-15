const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: 'file:./data/database.db',
});

const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log('Testing Prisma connection...');
    const count = await prisma.lead.count();
    console.log(`Success! Database has ${count} leads.`);
    
    if (count === 0) {
      console.log('Database is empty. Creating test lead...');
      const lead = await prisma.lead.create({
        data: {
          companyName: 'Test Company',
          stage: 'NEW'
        }
      });
      console.log(`Created lead: ${lead.companyName} (ID: ${lead.id})`);
    }
    
    await prisma.$disconnect();
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();