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
          <span className={styles.heroBadge}>🏥 BENVA Healthcare Services</span>
          <h1 className={styles.heroTitle}>
            Order Medicines <span className={styles.heroAccent}>Online</span>
          </h1>
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <div className={styles.pricingBox}>
                <span className={styles.annualText}>EXCLUSIVE OFFER</span>
                <div className={styles.priceDisplay}>
                  <span className={styles.amount}>20%</span>
                  <span className={styles.perYear}>OFF</span>
                </div>
                <div className={styles.dailyCost}>Order Through BENVA</div>
              </div>

              <div className={styles.valueBox}>
                <span className={styles.actualPriceText}>Convenience</span>
                <div className={styles.strikethroughPrice}>Doorstep</div>
                <div className={styles.saveBadge}>Fast, Safe, Reliable</div>
              </div>
            </div>

            <div className={styles.bannerFooter}>
              Order medicines easily by uploading your prescription from trusted pharmacy partners.
            </div>
          </div>
          
          <button className={styles.heroApplyBtn}>
            UPLOAD PRESCRIPTION
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
          <div className={styles.cross1}></div>
          <div className={styles.cross2}></div>
          <div className={styles.pill1}></div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <ServicesGridSection />
    </main>
  );
}
