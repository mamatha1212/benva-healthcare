'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './AdminLayout.module.css';
import Image from 'next/image';

function SidebarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { name: 'All Leads', path: '/admin', icon: 'M4 6h16M4 12h16M4 18h7' },
    { name: 'Health Checkups', path: '/admin?tab=checkups', icon: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2L21 5.96a2.12 2.12 0 00-3-3L4.5 16.5zM15 5l3 3' },
    { name: 'Memberships', path: '/admin?tab=memberships', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z' },
    // { name: 'Home Healthcare', path: '/admin?tab=homecare', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Diet Plans', path: '/admin?tab=diet-plan', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/images/Benva%20NEW.png" alt="BENVA Healthcare" style={{ height: '60px', width: 'auto', transform: 'scale(2)', transformOrigin: 'left center' }} className={styles.logo} />
      </div>
      
      <nav className={styles.nav}>
        <p className={styles.navHeader}>ALL LEADS</p>
        {navItems.map((item) => {
          const currentTab = searchParams.get('tab') || 'all';
          let isActive = false;
          // For 'All Leads', it is active if the path is exactly /admin and no specific tab is selected (or tab=all)
          // Actually, we are currently not on the packages page, so if pathname is /admin and tab matches.
          if (item.path.includes('tab=')) {
            isActive = currentTab === item.path.split('tab=')[1] && !usePathname().includes('/packages');
          } else {
            isActive = currentTab === 'all' && !usePathname().includes('/packages');
          }

          return (
            <Link key={item.name} href={item.path} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.name}
            </Link>
          );
        })}
        
        <Link 
          href="/admin?tab=availability" 
          className={`${styles.navItem} ${searchParams.get('tab') === 'availability' && !usePathname().includes('/packages') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Area Enquiries
        </Link>

        <Link 
          href="/admin?tab=contact" 
          className={`${styles.navItem} ${searchParams.get('tab') === 'contact' && !usePathname().includes('/packages') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Contact Messages
        </Link>

        <Link 
          href="/admin?tab=callback" 
          className={`${styles.navItem} ${searchParams.get('tab') === 'callback' && !usePathname().includes('/packages') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          Callback Requests
        </Link>

        <p className={styles.navHeader} style={{ marginTop: '24px' }}>PATIENTS AND PAYOUTS</p>
        <Link 
          href="/admin/patient-records" 
          className={`${styles.navItem} ${usePathname().includes('/admin/patient-records') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Patient records
        </Link>

        <Link 
          href="/admin/dr-payouts" 
          className={`${styles.navItem} ${usePathname().includes('/admin/dr-payouts') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Dr payouts
        </Link>

        <p className={styles.navHeader} style={{ marginTop: '24px' }}>MANAGE CONTENT</p>
        <Link 
          href="/admin/packages" 
          className={`${styles.navItem} ${usePathname().includes('/admin/packages') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Add Health Checkups Options
        </Link>

        <Link 
          href="/admin/diet-plans" 
          className={`${styles.navItem} ${usePathname().includes('/admin/diet-plans') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Add Diet Plans Options
        </Link>

        <Link 
          href="/admin/tests" 
          className={`${styles.navItem} ${usePathname().includes('/admin/tests') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
          Manage Tests
        </Link>
        
        <Link 
          href="/admin/locations" 
          className={`${styles.navItem} ${usePathname().includes('/admin/locations') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Manage Service Locations
        </Link>
        
        <Link 
          href="/admin/pages" 
          className={`${styles.navItem} ${usePathname().includes('/admin/pages') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Manage Static Pages
        </Link>
        
        <Link 
          href="/admin/service-areas" 
          className={`${styles.navItem} ${usePathname().includes('/admin/service-areas') ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Service Areas
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      {/* Sidebar with Suspense boundary for useSearchParams */}
      <Suspense fallback={<aside className={styles.sidebar}>Loading...</aside>}>
        <SidebarContent />
      </Suspense>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <span>Admin</span>
            <span className={styles.separator}>/</span>
            <span className={styles.current}>Leads Dashboard</span>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <span>Admin</span>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
