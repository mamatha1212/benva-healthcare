'use client';
import React from 'react';
import styles from './PremiumCheckupSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

const checkIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const simpleCheckIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function PremiumCheckupSection() {
  const tests = [
    { name: 'Complete Blood Count (CBC)', params: '22 Parameters' },
    { name: 'Thyroid Profile', params: '3 Parameters' },
    { name: 'Liver Function Profile', params: '11 Parameters' },
    { name: 'Kidney Function Profile', params: '3 Parameters' },
    { name: 'Lipid Profile', params: '7 Parameters' },
    { name: 'Diabetes Profile', params: '2 Parameters' },
    { name: 'HbA1c', params: 'Diabetes Monitoring' },
    { name: 'Vitamin Profile', params: 'Vitamin D, B12' },
    { name: 'Iron Profile', params: '4 Parameters' },
    { name: 'Calcium Test', params: 'Bone Health' },
    { name: 'Urine Examination', params: '18 Parameters' },
  ];

  return (
    <section className={styles.section} id="premium-checkup">
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* ── Left Column (Image & Hook) ── */}
          <div className={styles.imageCol}>
            <div className={styles.imageBox} style={{ backgroundImage: 'url(/images/premium-checkup.png)' }} />
            <div className={styles.pricingOverlay}>
              <div className={styles.pricingHeader}>
                <span className={styles.offerLabel}>BENVA Offer Price</span>
              </div>
              <div className={styles.price}>₹1,999 <span>Only</span></div>

              <div className={styles.pricingHighlights}>
                <div>{simpleCheckIcon} 72+ Tests</div>
                <div>{simpleCheckIcon} Home Sample Collection</div>
                <div>{simpleCheckIcon} Digital Reports</div>
                <div>{simpleCheckIcon} Doctor Guidance</div>
                <div>{simpleCheckIcon} Fast Report Delivery</div>
                <div>{simpleCheckIcon} Trusted Partner Labs</div>
              </div>

              <button className={styles.mainBtn} onClick={() => window.dispatchEvent(new Event('openBookingModal'))}>
                Book Health Checkup
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Right Column (Details) ── */}
          <div className={styles.contentCol}>

            <div className={styles.headingWrapper}>
              <AnimatedHeading className={styles.mainHeading}>BENVA Premium Full Body Health Checkup</AnimatedHeading>
              <p className={styles.subHeading}>Comprehensive Health Screening With 72+ Tests, Home Sample Collection And Digital Reports.</p>
            </div>

            <div className={styles.testsSection}>
              <h3 className={styles.sectionTitle}>Tests Included</h3>
              <div className={styles.testsGrid}>
                {tests.map((test, idx) => (
                  <div key={idx} className={styles.testItem}>
                    <span className={styles.testName}>{test.name}</span>
                    <span className={styles.testParams}>{test.params}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.testsSection}>
              <h3 className={styles.sectionTitle}>Package Suitable For</h3>
              <div className={styles.suitableRow}>
                <div className={styles.suitableBadge}>{simpleCheckIcon} Working Professionals</div>
                <div className={styles.suitableBadge}>{simpleCheckIcon} Senior Citizens</div>
                <div className={styles.suitableBadge}>{simpleCheckIcon} Men & Women</div>
                <div className={styles.suitableBadge}>{simpleCheckIcon} Diabetic Patients</div>
                <div className={styles.suitableBadge}>{simpleCheckIcon} Preventive Checkups</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Trust Row ── */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <span className={styles.trustText}>Trusted Partner Labs</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span className={styles.trustText}>Home Sample Collection</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <span className={styles.trustText}>Secure Reports</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <span className={styles.trustText}>Dedicated Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
