const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.doctor.create({
    data: {
      name: "Praveen",
      email: "praveenmeka95@gmail.com",
      type: "ADMIN"
    }
  });
  console.log("Created doctor:", doctor);
}
main().catch(console.error).finally(() => prisma.$disconnect());
