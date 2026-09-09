const fs = require('fs');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const dataBuffer = fs.readFileSync('C:\\Users\\91767\\Downloads\\Benva Telangana BluePrint (1).pdf');
  const data = await pdf(dataBuffer);
  
  const text = data.text;
  const lines = text.split('\n');
  const records = [];
  const rowRegex = /^(\d+)\s+(.+?)\s+(\d{6})\s+(PO|BO|HO)\s+(.+?Circle)\s+(.+?Region)\s*(.+?Division)\s*(Urban|Rural)$/i;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('==')) continue;

    const match = trimmed.match(rowRegex);
    if (match) {
      records.push({
        sNo: parseInt(match[1], 10),
        officeName: match[2].trim(),
        pincode: match[3],
        type: match[4].toUpperCase(),
        circle: match[5].trim(),
        region: match[6].trim(),
        division: match[7].trim(),
        area: match[8],
        state: 'Telangana', // Hardcoded for this dataset
      });
    }
  }

  console.log(`Matched ${records.length} records from PDF.`);

  if (records.length > 0) {
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
}

main().catch(console.error);
