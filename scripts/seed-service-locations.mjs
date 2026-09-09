import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const transcriptPath = 'C:\\Users\\91767\\.gemini\\antigravity-ide\\brain\\32580e48-3bda-4991-a2f5-f9ccbbc78ded\\.system_generated\\logs\\transcript_full.jsonl';
  
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript file not found:', transcriptPath);
    return;
  }

  const rawText = fs.readFileSync(transcriptPath, 'utf8');

  console.log('Extracting and parsing rows naively from entire transcript text...');

  // Split by literal \n or escaped \\n or \r
  const tokens = rawText.split(/\\n|\n|\r/);
  const records = [];

  const rowRegex = /^(\d+)\s+(.+?)\s+(\d{6})\s+(PO|BO|HO)\s+(.+?Circle)\s+(.+?Region)\s*(.+?Division)\s*(Urban|Rural)$/i;

  let matchCount = 0;
  const seenIds = new Set(); // Prevent duplicates

  for (const token of tokens) {
    // some lines might have surrounding quotes or whitespace
    const trimmed = token.replace(/\\"/g, '').replace(/"/g, '').trim();

    const match = trimmed.match(rowRegex);
    if (match) {
      const sNo = parseInt(match[1], 10);
      if (seenIds.has(sNo)) continue;
      seenIds.add(sNo);

      records.push({
        sNo: sNo,
        officeName: match[2].trim(),
        pincode: match[3],
        type: match[4].toUpperCase(),
        circle: match[5].trim(),
        region: match[6].trim(),
        division: match[7].trim(),
        area: match[8],
        state: 'Telangana',
      });
      matchCount++;
    }
  }

  console.log(`Matched ${matchCount} unique records.`);

  if (matchCount === 0) {
    console.log('No records found to insert. Exiting.');
    return;
  }

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
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
