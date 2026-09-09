const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const records = JSON.parse(fs.readFileSync('C:\\Users\\91767\\Desktop\\benva-healthcare\\records.json', 'utf8'));

  if (records.length === 0) {
    console.log('No records found to insert.');
    return;
  }

  const prisma = new PrismaClient();
  console.log('Clearing existing Telangana service locations...');
  await prisma.serviceLocation.deleteMany({
    where: { state: 'Telangana' }
  });

  console.log('Inserting records...');
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await prisma.serviceLocation.createMany({
      data: batch
    });
    console.log(`Inserted ${i + batch.length} of ${records.length}`);
  }

  console.log('Seeding completed successfully!');
  await prisma.$disconnect();
}

main().catch(console.error);
