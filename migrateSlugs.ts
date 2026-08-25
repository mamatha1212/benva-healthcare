import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const packages = await prisma.healthPackage.findMany();
  for (const pkg of packages) {
    const slug = pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${slug}-${pkg.id.slice(-4)}`;

    await prisma.healthPackage.update({
      where: { id: pkg.id },
      data: { slug: uniqueSlug }
    });
    console.log(`Updated ${pkg.title} -> ${uniqueSlug}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
