import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function GenericModulePage({ params }: { params: Promise<{ module: string }> | { module: string } }) {
  // Resolve params if it's a promise (Next.js 15+ pattern)
  const resolvedParams = await Promise.resolve(params);
  const moduleSlug = resolvedParams.module;
  const expectedModuleName = moduleSlug.toUpperCase();

  const cookieStore = await cookies();
  const staffAuthCookie = cookieStore.get('staffAuth')?.value;
  if (!staffAuthCookie) redirect('/staff/login');

  const staff = await prisma.staff.findFirst({
    where: { username: staffAuthCookie },
    include: { permissions: true }
  });

  if (!staff) return <div>Access Denied</div>;

  const permission = staff.permissions.find(p => p.moduleName === expectedModuleName);

  // ACTION-LEVEL SECURITY: If they don't have canView, completely block access!
  if (!permission || !permission.canView) {
    redirect('/staff/dashboard'); 
  }

  // Very basic generic data fetching mapping
  let data: any[] = [];
  try {
    if (expectedModuleName === 'MEMBERSHIPS') {
      data = await prisma.lead.findMany({
        where: { enquiryType: 'MEMBERSHIP' },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    } else if (expectedModuleName === 'ALL_LEADS') {
      data = await prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    } else if (expectedModuleName === 'CONTACT_MESSAGES') {
      data = await prisma.lead.findMany({
        where: { enquiryType: 'CONTACT_US' },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    } else if (expectedModuleName === 'HEALTH_CHECKUPS') {
      data = await prisma.lead.findMany({
        where: { enquiryType: 'HEALTH_CHECKUP' },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {expectedModuleName.replace(/_/g, ' ')} Management
          </h1>
          <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
            Manage and view records based on your permissions.
          </p>
        </div>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px' }}>
        <h3>This is an auto-generated view for {expectedModuleName.replace(/_/g, ' ')}</h3>
        <p>
          Because this is a custom application, each module's specific data tables (like connecting to the Memberships or Health Checkups database tables) need to be programmed individually to look exactly how you want them. 
        </p>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', marginBottom: '30px' }}>
          {permission.canAdd && <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN ADD</span>}
          {permission.canEdit && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN EDIT</span>}
          {permission.canDelete && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN DELETE</span>}
        </div>

        <div style={{ padding: '20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
          {data.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Contact</th>
                  <th style={{ padding: '12px 16px' }}>Location</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                    <td style={{ padding: '12px 16px' }}>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.fullName || row.name || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>{row.mobile || row.phone || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>{row.district || 'N/A'}, {row.state || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {row.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#64748b', margin: 0 }}>
              No records found for {expectedModuleName}. 
            </p>
          )}
        </div>
      </div>
    </>
  );
}
