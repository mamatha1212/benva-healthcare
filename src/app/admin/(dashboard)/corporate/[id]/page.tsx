import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrgEmployeesClient from './OrgEmployeesClient';

export default async function OrganizationEmployeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await prisma.organization.findUnique({
    where: { id },
    include: { employees: true }
  });

  if (!org) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Organization not found</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/admin/corporate" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600, display: 'inline-block', marginBottom: '16px' }}>
        &larr; Back to Corporate Clients
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{org.companyName} - Employees</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Total {org.employees?.length || 0} employees enrolled.</p>
        </div>
      </div>

      <OrgEmployeesClient initialEmployees={org.employees || []} />
    </div>
  );
}
