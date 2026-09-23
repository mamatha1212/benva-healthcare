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
          <p className={styles.heroSubtitle} style={{ marginBottom: '24px' }}>
            Order medicines easily by uploading your prescription and enjoy up to 20% savings with doorstep delivery from trusted pharmacy partners.
          </p>
          <div className={styles.discountHighlight}>
            Order medicines through BENVA and get a discount of 15% to 20%!
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
