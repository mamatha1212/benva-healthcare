import type { Metadata } from 'next';
import ServicesGridSection from '@/components/ServicesGridSection/ServicesGridSection';
import styles from './medicines.module.css';

export const metadata: Metadata = {
  title: 'Order Medicines Online | BENVA Healthcare',
  description:
    'Upload your prescription and order medicines online through BENVA Healthcare\'s trusted partner pharmacy network. Easy ordering, fast delivery.',
};

export default function MedicinesPage() {
  return (
    <main>
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🏥 BENVA Pharmacy Services</span>
          <h1 className={styles.heroTitle}>
            Order Medicines <span className={styles.heroAccent}>Online</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Upload your doctor&apos;s prescription and get medicines delivered to your doorstep
            through our trusted partner pharmacy network — fast, safe, and reliable.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Partner Pharmacies</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Support Available</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Genuine Medicines</span>
            </div>
          </div>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </section>

      {/* ── Services Section ── */}
      <ServicesGridSection />
    </main>
  );
}
