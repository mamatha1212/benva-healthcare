import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const packages = await prisma.healthPackage.findMany();
  const seenSlugs = new Set();
  
  for (const pkg of packages) {
    const baseSlug = pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (seenSlugs.has(finalSlug)) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }
    
    seenSlugs.add(finalSlug);

    await prisma.healthPackage.update({
      where: { id: pkg.id },
      data: { slug: finalSlug }
    });
    console.log(`Updated ${pkg.title} -> ${finalSlug}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
