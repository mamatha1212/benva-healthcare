'use client';
import React from 'react';
import styles from './AboutStorySection.module.css';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

export default function AboutStorySection() {
  return (
    <section className={styles.section} id="our-story">
      <div className={styles.container}>
        <div className={styles.editorialGrid}>
          
          {/* Left Column: Strike Image */}
          <div className={styles.imageColumn}>
            <ScrollReveal animation="fadeRight" delay={0.1}>
              <div className={styles.accentBox} />
              <div className={styles.patternOverlay} />
              <div className={styles.mainImage} />
            </ScrollReveal>
          </div>

          {/* Right Column: Content & Typography */}
          <div className={styles.contentColumn}>
            <ScrollReveal animation="fadeUp" delay={0.2}>
              <div className={styles.eyebrow}>The Benva Promise</div>
              <h2 className={styles.heading}>Your Health, Completely Reimagined</h2>
            </ScrollReveal>
            
            <ScrollReveal animation="fadeUp" delay={0.3}>
              <p className={styles.subtext}>
                We don't just connect you to services; we orchestrate a seamless ecosystem of top-tier laboratories, expert physicians, and premium home-care specialists tailored entirely around you.
              </p>
              <p className={styles.description}>
                Whether you need an urgent teleconsultation, precise diagnostics, or dedicated nursing at home, we bring the hospital's excellence directly to your doorstep—eliminating the wait, hassle, and uncertainty from your health journey. Driven by a relentless commitment to your well-being, we ensure every step of your health journey is premium, precise, and profoundly human.
              </p>
            </ScrollReveal>

            {/* Staggered Features */}
            <ScrollReveal animation="fadeUp" delay={0.4}>
              <div className={styles.featuresList}>
                
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Trusted Partners</h4>
                    <p className={styles.featureDesc}>Leading labs & providers.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Easy Booking</h4>
                    <p className={styles.featureDesc}>Hassle-free service requests.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Dedicated Support</h4>
                    <p className={styles.featureDesc}>24/7 Healthcare Assistance.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Service Coverage</h4>
                    <p className={styles.featureDesc}>AP & Telangana network.</p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
