import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function OrganizationEmployeesPage({ params }: { params: { id: string } }) {
  const org = await prisma.organization.findUnique({
    where: { id: params.id },
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

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>S.No</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Name</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Mobile Number</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Corporate Mail ID</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {org.employees && org.employees.length > 0 ? (
              org.employees.map((emp: any, idx: number) => (
                <tr key={emp.id}>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{idx + 1}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{emp.name}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{emp.phone}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{emp.email || '-'}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{emp.remarks || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
