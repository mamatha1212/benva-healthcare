const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEARCHING PATIENT RECORDS FOR RAVI ---');
  const patients = await prisma.patientRecord.findMany({
    where: {
      OR: [
        { name: { contains: 'Ravi', mode: 'insensitive' } },
        { phone: '7671866605' }
      ]
    }
  });
  console.log(JSON.stringify(patients, null, 2));

  console.log('--- SEARCHING INVOICES FOR RAVI ---');
  const invoices = await prisma.invoice.findMany({
    include: { patient: true }
  });
  const matched = invoices.filter(i => JSON.stringify(i).toLowerCase().includes('ravi') || JSON.stringify(i).includes('7671866605'));
  console.log(JSON.stringify(matched, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
