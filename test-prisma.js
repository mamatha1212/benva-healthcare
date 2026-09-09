const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unassigned = await prisma.serviceLocation.count({
    where: {
      AND: [
        { phleboName: null },
        { phlebos: { equals: Prisma.AnyNull } } // Try AnyNull
      ]
    }
  });

  const assigned = await prisma.serviceLocation.count({
    where: {
      OR: [
        { phleboName: { not: null } },
        { phlebos: { not: Prisma.AnyNull } } 
      ]
    }
  });

  console.log(`Unassigned: ${unassigned}, Assigned: ${assigned}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
