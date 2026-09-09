const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update phlebos where it equals '[]' (as JSON) to null
  const phlebosResult = await prisma.$executeRawUnsafe(`UPDATE "ServiceLocation" SET phlebos = NULL WHERE phlebos::text = '[]'`);
  console.log(`Cleaned up ${phlebosResult} empty phlebos arrays`);

  // Update phleboName where it is empty string to null
  const nameResult = await prisma.$executeRawUnsafe(`UPDATE "ServiceLocation" SET "phleboName" = NULL WHERE "phleboName" = ''`);
  console.log(`Cleaned up ${nameResult} empty phleboNames`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
