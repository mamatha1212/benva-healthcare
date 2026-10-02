import { prisma } from './prisma';

export async function generateNextUhid(): Promise<string> {
  const count = await prisma.patientRecord.count({
    where: { uhid: { not: null } }
  });
  const nextNumber = count + 1;
  return `BENVA-UHID-${nextNumber.toString().padStart(9, '0')}`;
}
