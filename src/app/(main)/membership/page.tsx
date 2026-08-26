'use client';
import React from 'react';
import MembershipCardSection from '@/components/MembershipCardSection/MembershipCardSection';
import MembershipFormSection from '@/components/MembershipFormSection/MembershipFormSection';
import styles from './membership.module.css';

export default function MembershipPage() {
  return (
    <main>
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>💳 BENVA Exclusive</span>
          <h1 className={styles.heroTitle}>
            BENVA <span className={styles.heroAccent}>Membership</span> Card
          </h1>
          <p className={styles.heroSubtitle}>
            Get exclusive healthcare benefits for you and your family — diagnostic discounts,
            priority support, healthcare guidance, and much more.
          </p>
          <div className={styles.heroPerks}>
            <div className={styles.perkItem}>
              <span className={styles.perkIcon}>🏥</span>
              <span>Diagnostic Discounts</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkIcon}>⚡</span>
              <span>Priority Support</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkIcon}>💊</span>
              <span>Healthcare Guidance</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkIcon}>🤝</span>
              <span>Partner Benefits</span>
            </div>
          </div>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </section>

      {/* ── Membership Card ── */}
      <MembershipCardSection />

      {/* ── Membership Form Modal (hidden, opens on button click) ── */}
      <MembershipFormSection />
    </main>
  );
}
