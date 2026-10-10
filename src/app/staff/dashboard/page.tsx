import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Force dynamic so it updates instantly when admin changes permissions
export const dynamic = 'force-dynamic';

export default async function StaffDashboard() {
  const cookieStore = await cookies();
  const staffAuthCookie = cookieStore.get('staffAuth')?.value;

  if (!staffAuthCookie) {
    return null; // layout.tsx will handle the redirect
  }

  const staff = await prisma.staff.findFirst({
    where: { username: staffAuthCookie },
    include: { permissions: true }
  });

  if (!staff) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Staff member not found. Please run the test script or add a staff member via the Admin UI first!
      </div>
    );
  }

  // CORE LOGIC: Filter out any modules the staff is NOT allowed to view
  const allowedModules = staff.permissions.filter(p => p.canView);

  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Welcome back, {staff.name}</h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
        {staff.designation} • {staff.department}
      </p>

      {/* PERMISSIONS PROOF */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b', fontWeight: 700 }}>How the System Sees You Right Now</h2>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
          This page is dynamically rendering based on your specific database permissions. 
          If the Super Admin goes to the Admin Panel and removes your "View" access for Patients, it will instantly disappear from this sidebar!
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {allowedModules.map(mod => (
            <div key={mod.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>{mod.moduleName} Access</h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {mod.canAdd && <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN ADD</span>}
                {mod.canEdit && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN EDIT</span>}
                {mod.canDelete && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN DELETE</span>}
                {mod.canExport && <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CAN EXPORT</span>}
              </div>
              
              {mod.fieldAccess && Object.keys(mod.fieldAccess).length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>FIELD LEVEL RULES:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(mod.fieldAccess).map(([field, hasAccess]) => (
                      <div key={field} style={{ 
                        display: 'flex', justifyContent: 'space-between', padding: '8px 12px', 
                        background: hasAccess ? '#f8fafc' : '#fef2f2', 
                        border: `1px solid ${hasAccess ? '#f1f5f9' : '#fee2e2'}`,
                        borderRadius: '6px', fontSize: '13px'
                      }}>
                        <span style={{ color: '#334155' }}>{field}</span>
                        <span style={{ fontWeight: 600, color: hasAccess ? '#16a34a' : '#ef4444' }}>
                          {hasAccess ? 'View Allowed' : 'Strictly Blocked'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
