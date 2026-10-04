import { prisma } from '@/lib/prisma';
import ReferralHistoryClient from './ReferralHistoryClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ReferralHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const referrer = await prisma.referrer.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!referrer) {
    return notFound();
  }

  // We need services for the TransactionModal if they edit
  const services = await prisma.service.findMany({
    orderBy: { type: 'asc' }
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/admin/referrals" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Referrals
      </Link>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Referral History: {referrer.name}</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Manage and download statement history.</p>
      </div>

      <ReferralHistoryClient initialReferrer={referrer} services={services} />
    </div>
  );
}
