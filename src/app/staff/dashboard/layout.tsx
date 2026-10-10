import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '@/app/admin/(dashboard)/AdminLayout.module.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staffAuthCookie = cookies().get('staffAuth')?.value;

  if (!staffAuthCookie) {
    redirect('/staff/login');
  }

  const staff = await prisma.staff.findFirst({
    where: { username: staffAuthCookie },
    include: { permissions: true }
  });

  if (!staff) {
    // If the cookie has an invalid username somehow, clear it and redirect
    return <div style={{ padding: '40px', textAlign: 'center' }}>Staff member not found.</div>;
  }

  const allowedModules = staff.permissions.filter(p => p.canView);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/images/Benva%20NEW.png" alt="BENVA Healthcare" style={{ height: '60px', width: 'auto', transform: 'scale(2)', transformOrigin: 'left center' }} className={styles.logo} />
        </div>

        <nav 
          className={`${styles.nav} staff-nav-scroll`}
          style={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            paddingRight: '4px',
            scrollbarWidth: 'thin', // Firefox
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent' // Firefox
          }}
        >
          {/* Custom Webkit scrollbar for Staff Sidebar */}
          <style>{`
            .staff-nav-scroll::-webkit-scrollbar {
              width: 4px;
            }
            .staff-nav-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .staff-nav-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
            }
          `}</style>
          
          <p className={styles.navHeader} style={{ marginTop: '12px' }}>DASHBOARD</p>
          <Link href="/staff/dashboard" className={`${styles.navItem}`}>
             <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
             Overview
          </Link>
          
          <p className={styles.navHeader} style={{ marginTop: '24px' }}>YOUR MODULES</p>
          {allowedModules.map(mod => (
            <Link 
              key={mod.id} 
              href={`/staff/dashboard/${mod.moduleName.toLowerCase()}`}
              className={`${styles.navItem}`}
            >
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              {mod.moduleName.replace(/_/g, ' ')}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/staff/login" className={styles.logoutBtn} style={{ textDecoration: 'none' }}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.breadcrumb} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginLeft: '12px', lineHeight: '1.2' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px', color: '#0f172a' }}>STAFF</span>
              <span className={styles.current} style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{staff.designation} Dashboard</span>
            </div>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{staff.name.charAt(0)}</div>
            <span>{staff.name}</span>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
