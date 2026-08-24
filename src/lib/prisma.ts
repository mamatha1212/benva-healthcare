import { PrismaClient } from '@prisma/client';

// Force instantiate a new Prisma Client to pick up schema changes
export const prisma = new PrismaClient({
  log: ['query'],
});
