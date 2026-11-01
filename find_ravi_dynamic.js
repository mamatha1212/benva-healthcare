const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const q = 'Ravi';
  const allProps = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('All prisma models:', allProps);

  for (const m of allProps) {
    if (typeof prisma[m].findMany === 'function') {
      try {
        const rows = await prisma[m].findMany();
        const matches = rows.filter(r => JSON.stringify(r).toLowerCase().includes('ravi'));
        if (matches.length > 0) {
          console.log(`\n=== MATCH in ${m} (${matches.length}) ===`);
          console.log(JSON.stringify(matches, null, 2));
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
