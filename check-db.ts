import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existingDoctor = await prisma.doctor.findFirst({
    where: { phone: '7671866605' }
  });

  if (!existingDoctor) {
    await prisma.doctor.create({
      data: {
        name: 'Surekha',
        type: 'CONSULTANT',
        phone: '7671866605',
      }
    });
    console.log('Added Surekha to Doctors');
  } else {
    console.log('Surekha already exists');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
