'use client';
import React, { useState } from 'react';
import styles from './WhyChooseUsSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import ScrollReveal from '../ScrollReveal/ScrollReveal';
import Link from 'next/link';

const features = [
  {
    num: '01',
    title: 'Trusted Partner Network',
    desc: 'Certified labs, licensed pharmacies and qualified professionals — all under one platform.',
    icon: '🤝',
    color: '#3b82f6',
  },
  {
    num: '02',
    title: 'Home Sample Collection',
    desc: 'A trained phlebotomist visits your home. No queues, no travel.',
    icon: '🏠',
    color: '#10b981',
  },
  {
    num: '03',
    title: 'Qualified Professionals',
    desc: 'Every professional is verified and trained before being onboarded.',
    icon: '👨‍⚕️',
    color: '#f59e0b',
  },
  {
    num: '04',
    title: 'Easy Booking',
    desc: 'Book in under 60 seconds. Simple enquiry, fast confirmation.',
    icon: '📱',
    color: '#8b5cf6',
  },
  {
    num: '05',
    title: 'Fast Support',
    desc: 'Dedicated support team available to handle every service request.',
    icon: '⚡',
    color: '#ef4444',
  },
  {
    num: '06',
    title: 'At Your Convenience',
    desc: 'Access all healthcare services from the comfort of your home.',
    icon: '🕐',
    color: '#06b6d4',
  },
];

const highlights = [
  'NABL Partner Labs',
  'Partner Pharmacies',
  'Healthcare Professionals',
  'Dedicated Support',
  // 'Home Healthcare',
  'AP & Telangana',
];

export default function WhyChooseUsSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Why BENVA?</span>
          <AnimatedHeading className={styles.title}>
            Healthcare made simple, delivered with trust.
          </AnimatedHeading>
        </div>

        {/* ── Bento Grid ── */}
        <div className={styles.bento}>

          {/* Feature cards — 6 items */}
          {features.map((f, i) => (
            <ScrollReveal key={i} animation="fadeUp" delay={i * 0.1}>
              <div
                className={`${styles.card} ${hovered === i ? styles.cardActive : ''}`}
                style={{ '--c': f.color } as React.CSSProperties}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={styles.cardLeft}>
                <span className={styles.cardEmoji}>{f.icon}</span>
                <span className={styles.cardNum}>{f.num}</span>
              </div>
              <div className={styles.cardRight}>
                <h3 className={styles.cardTitle}>{f.title}</h3>
                <p className={styles.cardDesc}>{f.desc}</p>
              </div>
                <div className={styles.cardBar} />
              </div>
            </ScrollReveal>
          ))}

          {/* Wide summary card */}
          <ScrollReveal animation="fadeUp" delay={0.6} style={{ gridColumn: '1 / -1' }}>
            <div className={styles.summaryCard}>
            <div className={styles.summaryLeft}>
              <h3 className={styles.summaryHeading}>What we cover</h3>
              <div className={styles.pills}>
                {highlights.map((h, i) => (
                  <span key={i} className={styles.pill}>✓ {h}</span>
                ))}
              </div>
            </div>
            <div className={styles.summaryRight}>
              <p className={styles.summaryText}>
                BENVA connects you with trusted healthcare partners for lab tests,
                home care, medicines and more — all across Andhra Pradesh &amp; Telangana.
              </p>
              <Link href="/services" className={styles.cta}>
                Explore Services →
              </Link>
            </div>
          </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
