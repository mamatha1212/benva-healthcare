'use client';
import React from 'react';
import styles from './AboutHeroBanner.module.css';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

export default function AboutHeroBanner() {
  return (
    <section className={styles.banner}>
      {/* Abstract Background Elements */}
      <div className={styles.bgGraphic1}></div>
      <div className={styles.bgGraphic2}></div>
      
      <div className={styles.container}>
        <ScrollReveal animation="fadeUp">
          <div className={styles.badge}>Our Story</div>
          <h1 className={styles.title}>About BENVA Healthcare</h1>
          <p className={styles.subtitle}>
            Your Health, Completely Reimagined. We are bridging the gap between you and world-class healthcare with premium, precise, and profoundly human services.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
