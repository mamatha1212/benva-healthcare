const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const referrers = await prisma.referrer.findMany({ where: { referralCode: null } });
  for (let i = 0; i < referrers.length; i++) {
    await prisma.referrer.update({
      where: { id: referrers[i].id },
      data: { referralCode: `BENVA-HC-${i + 1}` }
    });
  }
  console.log('Updated ' + referrers.length + ' referrers.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
