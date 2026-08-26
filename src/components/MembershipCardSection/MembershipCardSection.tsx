'use client';
import React from 'react';
import styles from '../ServicesGridSection/ServicesGridSection.module.css';

export default function MembershipCardSection() {
  const checkIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );

  const watermark = (
    <svg className={styles.watermark} viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M30 40 Q20 30 35 25 Q40 10 55 15 Q70 10 75 25 Q90 30 80 40 Q90 55 75 60 Q70 75 55 70 Q40 75 35 60 Q20 55 30 40 Z" strokeDasharray="4,4"/>
    </svg>
  );

  return (
    <section className={styles.section} id="membership-card">
      <div className={styles.container}>
        <div className={styles.singleGrid}>

          {/* ── CARD: Membership ── */}
          <div className={styles.card}>
            {watermark}

            <div className={styles.imageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/membership-card.png" alt="Membership Card" className={styles.mainImage} />
              <div className={styles.infoBox}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoTitle}>Family Friendly</span>
                  <span className={styles.infoDesc}>Secure your family&apos;s health with our priority support.</span>
                </div>
              </div>
            </div>

            <div className={styles.contentArea}>
              <h2 className={styles.heading}>BENVA Membership Card</h2>
              <p className={styles.subHeading}>Exclusive Healthcare Benefits For You And Your Family.</p>

              <div className={styles.benefitsList}>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Diagnostic Discounts</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Priority Support</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Healthcare Guidance</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Partner Benefits</div>
              </div>

              <button
                className={styles.membershipBtn}
                onClick={() => window.dispatchEvent(new Event('openMembershipModal'))}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Apply For Membership
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
