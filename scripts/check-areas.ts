import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const areas = await prisma.area.findMany({ take: 10 });
  console.log("Areas:", areas);
  const serviceLocs = await prisma.serviceLocation.findMany({ take: 5 });
  console.log("Service Locations:", serviceLocs);
}
check();
