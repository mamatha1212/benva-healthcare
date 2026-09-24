import React from 'react';
import styles from './test.module.css';
import { prisma } from '@/lib/prisma';

const checkIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const parameterIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default async function TestPage() {
  // Fetch data dynamically just like the live page!
  const pkg = await prisma.healthPackage.findUnique({
    where: { slug: 'premium-full-body-health-check-up' },
    include: { 
      tests: { orderBy: { order: 'asc' } },
      profiles: { 
        include: { parameters: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' } 
      } 
    }
  });

  if (!pkg) {
    return <div>Package not found in DB!</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── 1. Hero Header ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          {pkg.isPopular && <div className={styles.badgeTop}>Best Seller Package</div>}
          <h1 className={styles.title}>{pkg.title}</h1>
          <p className={styles.subtitle}>{pkg.subtitle}</p>
          <div className={styles.heroBadges}>
            <div className={styles.badge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Free Home Sample Collection
            </div>
            <div className={styles.badge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              NABL Accredited Labs
            </div>
            <div className={styles.badge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Reports in 24 Hours
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Main Content Split Layout ── */}
      <section className={styles.mainContainer}>
        
        {/* Left Area: Tests & Information */}
        <div>
          <div className={styles.contentLeft}>
            <h2 className={styles.sectionTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              What's Included in this package?
            </h2>
            
            <div style={{ marginTop: '30px' }}>
              {pkg.tests && pkg.tests.length > 0 ? pkg.tests.map((test, idx) => (
                <details key={idx} className={styles.accordion} open={idx === 0}>
                  <summary className={styles.accordionSummary}>
                    <div className={styles.summaryIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                      {test.name}
                    </div>
                    <span className={styles.testCount}>{test.parameters.split(',').length} Tests</span>
                  </summary>
                  <div className={styles.accordionContent}>
                    <ul className={styles.paramList}>
                      {test.parameters.split(',').map((p, pIdx) => (
                        <li key={pIdx} className={styles.paramItem}>
                          {parameterIcon} {p.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )) : pkg.profiles && pkg.profiles.length > 0 ? pkg.profiles.map((profile, idx) => (
                <details key={idx} className={styles.accordion} open={idx === 0}>
                  <summary className={styles.accordionSummary}>
                    <div className={styles.summaryIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                      {profile.name}
                    </div>
                    <span className={styles.testCount}>{profile.parameters.length} Tests</span>
                  </summary>
                  <div className={styles.accordionContent}>
                    <ul className={styles.paramList}>
                      {profile.parameters.map((p, pIdx) => (
                        <li key={pIdx} className={styles.paramItem}>
                          {parameterIcon} {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )) : (
                <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px' }}>No tests added yet.</div>
              )}
            </div>
          </div>

          {/* Trust Banner Below Accordions */}
          <div className={styles.trustBanner}>
            <div className={styles.trustBannerItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Home Collection
            </div>
            <div className={styles.trustBannerItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              100% Secure Data
            </div>
            <div className={styles.trustBannerItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Digital Reports
            </div>
          </div>
        </div>

        {/* Right Area: Sticky Booking Card */}
        <div className={styles.sidebarRight}>
          <div className={styles.priceHeader}>Special Offer Price</div>
          <div className={styles.price}>
            ₹{pkg.price} {pkg.originalPrice && <small>₹{pkg.originalPrice}</small>} {pkg.discount && <span>{pkg.discount}</span>}
          </div>
          
          <div className={styles.highlightList}>
            <div className={styles.highlightItem}>{checkIcon} 72+ Vital Tests Included</div>
            <div className={styles.highlightItem}>{checkIcon} Free Home Sample Collection</div>
            <div className={styles.highlightItem}>{checkIcon} Digital Reports via WhatsApp</div>
            <div className={styles.highlightItem}>{checkIcon} Free Doctor Consultation</div>
          </div>

          <button className={styles.bookBtn}>
            Book Health Checkup
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>

      </section>
    </div>
  );
}
