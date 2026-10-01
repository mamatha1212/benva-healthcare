const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const doctor = await prisma.doctor.findUnique({ where: { email: 'praveenmeka95@gmail.com' } });
  console.log(doctor);
}
main().catch(console.error).finally(() => prisma.$disconnect());
