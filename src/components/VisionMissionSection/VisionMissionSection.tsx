'use client';
import React from 'react';
import styles from './VisionMissionSection.module.css';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

export default function VisionMissionSection() {
  return (
    <section className={styles.section} id="vision-mission">
      <div className={styles.container}>
        <div className={styles.grid}>
          
          {/* Vision */}
          <ScrollReveal animation="fadeUp" delay={0.1}>
            <div className={styles.card}>
              <div className={`${styles.iconWrapper} ${styles.visionIcon}`}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className={styles.title}>Our Vision</h3>
              <p className={styles.desc}>
                To be the most trusted and accessible healthcare aggregator, pioneering a seamless ecosystem where premium healthcare meets absolute convenience for every household.
              </p>
            </div>
          </ScrollReveal>

          {/* Mission */}
          <ScrollReveal animation="fadeUp" delay={0.3}>
            <div className={styles.card}>
              <div className={`${styles.iconWrapper} ${styles.missionIcon}`}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className={styles.title}>Our Mission</h3>
              <p className={styles.desc}>
                We strive to bridge the gap between patients and top-tier medical providers by offering a unified platform for effortless bookings, home services, and transparent healthcare.
              </p>
            </div>
          </ScrollReveal>

          {/* Core Values */}
          <ScrollReveal animation="fadeUp" delay={0.5}>
            <div className={styles.card}>
              <div className={`${styles.iconWrapper} ${styles.valuesIcon}`}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className={styles.title}>Core Values</h3>
              <ul className={styles.list}>
                <li className={styles.listItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  <span><strong>Empathy:</strong> We prioritize your comfort and care.</span>
                </li>
                <li className={styles.listItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  <span><strong>Transparency:</strong> No hidden costs, honest healthcare.</span>
                </li>
                <li className={styles.listItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  <span><strong>Excellence:</strong> Only partnering with certified providers.</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
