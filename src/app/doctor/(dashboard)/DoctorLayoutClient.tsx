'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import styles from './DoctorLayout.module.css';

export default function DoctorLayoutClient({ children, doctorData }: { children: React.ReactNode, doctorData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className={styles.layout}>
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>BENVA</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Doctor Portal</p>
          </div>
          <button className={styles.mobileCloseBtn} onClick={() => setIsOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/doctor" style={{ padding: '12px 16px', backgroundColor: pathname === '/doctor' ? '#1e293b' : 'transparent', borderRadius: '8px', color: pathname === '/doctor' ? 'white' : '#cbd5e1', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </Link>
          <Link href="/doctor/patients" style={{ padding: '12px 16px', backgroundColor: pathname.includes('/doctor/patients') ? '#1e293b' : 'transparent', borderRadius: '8px', color: pathname.includes('/doctor/patients') ? 'white' : '#cbd5e1', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            My Patients
          </Link>
          <Link href="/doctor/payouts" style={{ padding: '12px 16px', backgroundColor: pathname.includes('/doctor/payouts') ? '#1e293b' : 'transparent', borderRadius: '8px', color: pathname.includes('/doctor/payouts') ? 'white' : '#cbd5e1', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            My Payouts
          </Link>
        </nav>
        
        <div style={{ padding: '24px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f172a' }}>
              {doctorData?.name ? String(doctorData.name).charAt(0) : 'D'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Dr. {doctorData?.name ? String(doctorData.name) : 'Doctor'}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Consultant</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
      
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.hamburgerBtn} onClick={() => setIsOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '18px' }}>BENVA Doctor Portal</div>
        </header>
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}
