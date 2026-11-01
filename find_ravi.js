const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const q = 'Ravi';
  console.log('--- ALL TABLES SEARCH FOR RAVI ---');

  const models = [
    'patientRecord',
    'lead',
    'doctor',
    'doctorApplication',
    'drPayout',
    'staff',
    'user',
    'medicineOrder',
    'invoice',
    'patientFile'
  ];

  for (const m of models) {
    if (prisma[m]) {
      try {
        const rows = await prisma[m].findMany();
        const matches = rows.filter(r => JSON.stringify(r).toLowerCase().includes('ravi'));
        if (matches.length > 0) {
          console.log(`\n=== MODEL ${m} (${matches.length} matches) ===`);
          console.log(JSON.stringify(matches, null, 2));
        }
      } catch (err) {
        console.log(`Error reading ${m}:`, err.message);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
