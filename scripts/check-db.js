const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const locs = await prisma.serviceLocation.findMany({ take: 2 });
  console.log(locs);
}
main().finally(() => prisma.$disconnect());
