import { prisma } from './prisma';

export async function generateNextUhid(): Promise<string> {
  const lastPatient = await prisma.patientRecord.findFirst({
    where: { uhid: { not: null } },
    orderBy: { uhid: 'desc' }
  });
  
  if (!lastPatient || !lastPatient.uhid) {
    return 'BENVA-UHID-000000001';
  }
  
  const lastNumberStr = lastPatient.uhid.replace('BENVA-UHID-', '');
  const nextNumber = parseInt(lastNumberStr, 10) + 1;
  return `BENVA-UHID-${nextNumber.toString().padStart(9, '0')}`;
}
