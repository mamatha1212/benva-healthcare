import { prisma } from '@/lib/prisma';
import FreeConsultationsClient from './FreeConsultationsClient';

export const dynamic = 'force-dynamic';

export default async function FreeConsultationsPage() {
  const requests = await prisma.freeConsultationRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Free Consultation Requests</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Manage all general and corporate free consultation bookings.</p>
      </div>

      <FreeConsultationsClient initialRequests={requests} />
    </div>
  );
}
