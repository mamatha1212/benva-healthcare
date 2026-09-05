const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  try {
    const db = new Database('prisma/dev.db');
    const packages = db.prepare('SELECT * FROM HealthPackage').all();
    
    console.log(`Found ${packages.length} packages in sqlite dev.db.`);
    
    let migratedCount = 0;

    for (const pkg of packages) {
      const exists = await prisma.healthPackage.findUnique({ where: { id: pkg.id } });
      if (!exists) {
        await prisma.healthPackage.create({
          data: {
            id: pkg.id,
            slug: pkg.slug,
            title: pkg.title,
            subtitle: pkg.subtitle,
            price: pkg.price,
            originalPrice: pkg.originalPrice,
            discount: pkg.discount,
            theme: pkg.theme,
            image: pkg.image,
            layout: pkg.layout,
            isPopular: pkg.isPopular === 1,
            createdAt: new Date(pkg.createdAt),
            updatedAt: new Date(pkg.updatedAt)
          }
        });
        console.log(`- Migrated: ${pkg.title}`);
        migratedCount++;
      } else {
        console.log(`- Skipped (already exists): ${pkg.title}`);
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} new packages.`);
    db.close();
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
