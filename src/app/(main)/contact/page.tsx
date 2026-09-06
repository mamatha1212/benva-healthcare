'use client';

import React from 'react';
import styles from './ContactPage.module.css';
import ContactSection from '@/components/ContactSection/ContactSection';

export default function ContactPage() {
  return (
    <div className={styles.pageContainer}>
      
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>📞 Get in Touch</span>
          <h1 className={styles.heroTitle}>
            Contact <span className={styles.heroAccent}>Us</span>
          </h1>
          <p className={styles.heroSubtitle}>
            We're here to help! Reach out to us for appointments, inquiries, or any assistance you need.
          </p>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </section>

      {/* Use the shared ContactSection component to ensure single source of truth for the form */}
      <ContactSection />

    </div>
  );
}
