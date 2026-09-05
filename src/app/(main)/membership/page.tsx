'use client';
import React from 'react';
import MembershipBenefitsSection from '@/components/MembershipBenefitsSection/MembershipBenefitsSection';
import MembershipFormSection from '@/components/MembershipFormSection/MembershipFormSection';
import styles from './membership.module.css';

export default function MembershipPage() {
  return (
    <main>
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.banner}>
            <div className={styles.bannerDecor}>
              <div className={styles.bannerCircle1} />
              <div className={styles.bannerCircle2} />
            </div>

            <h2 className={styles.bannerTitle}>Benva Preventive Family Health Card</h2>
            
            <div className={styles.bannerContent}>
              <div className={styles.pricingBox}>
                <span className={styles.annualText}>Annual Membership</span>
                <div className={styles.priceDisplay}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.amount}>999</span>
                  <span className={styles.perYear}>/ Year</span>
                </div>
                <div className={styles.dailyCost}>Only 2.70 Paise / Day</div>
              </div>

              <div className={styles.valueBox}>
                <span className={styles.actualPriceText}>Actual Price</span>
                <div className={styles.strikethroughPrice}>₹10,000</div>
                <div className={styles.saveBadge}>You Save 90%</div>
              </div>
            </div>

            <div className={styles.bannerFooter}>
              One Membership. Complete Family Health Security.
            </div>
          </div>
          <button
            className={styles.heroApplyBtn}
            onClick={() => window.dispatchEvent(new Event('openMembershipModal'))}
          >
            Apply For Membership
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </section>

      {/* ── Key Benefits & Pricing ── */}
      <MembershipBenefitsSection />

      {/* ── Membership Form Modal (hidden, opens on button click) ── */}
      <MembershipFormSection />
    </main>
  );
}
