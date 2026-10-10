import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import StaffPatientTable from './StaffPatientTable';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function StaffPatientsModule() {
  // 1. Auth & Permission Check
  const cookieStore = await cookies();
  const staffAuthCookie = cookieStore.get('staffAuth')?.value;
  if (!staffAuthCookie) redirect('/staff/login');

  const staff = await prisma.staff.findFirst({
    where: { username: staffAuthCookie },
    include: { permissions: true }
  });

  if (!staff) return <div>Access Denied</div>;

  const patientPermission = staff.permissions.find(p => p.moduleName === 'PATIENTS');

  // ACTION-LEVEL SECURITY: If they don't have canView, completely block access!
  if (!patientPermission || !patientPermission.canView) {
    redirect('/staff/dashboard'); // Kick them out
  }

  // 2. Fetch raw patient data from the database
  const rawPatients = await prisma.patientRecord.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10 // Just showing 10 for demo
  });

  // 3. FIELD-LEVEL SECURITY: Scrub the data based on JSON permissions!
  const fieldAccess: any = patientPermission.fieldAccess || {};
  
  const safePatients = rawPatients.map(patient => {
    // We create a new object and only attach fields they are explicitly allowed to see
    const safeData: any = { id: patient.id, uhid: patient.uhid };
    
    if (fieldAccess.patientName !== false) safeData.name = patient.name;
    if (fieldAccess.mobileNumber !== false) safeData.phone = patient.phone;
    if (fieldAccess.address !== false) safeData.address = patient.address;
    
    // Explicitly block these if false
    if (fieldAccess.medicalHistory !== false) safeData.medicalHistory = '...'; 
    if (fieldAccess.prescription !== false) safeData.prescription = '...';
    
    return safeData;
  });

  return (
    <>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <StaffPatientTable 
          patients={safePatients}
          fieldAccess={fieldAccess}
          canAdd={patientPermission.canAdd}
          canEdit={patientPermission.canEdit}
          canDelete={patientPermission.canDelete}
        />
      </div>
    </>
  );
}
