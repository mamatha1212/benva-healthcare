'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './WhatWeDoSection.module.css';

const services = [
  {
    id: 1,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 10l-3 3M30 10l3 3M18 38l-3-3M30 38l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Treatment Help',
    desc: 'Share stories and experi from current volunteers to inspire others to join. Allow user to sign up for volunteer opportunities.',
  },
  {
    id: 2,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M8 36h32M12 36V22a4 4 0 014-4h16a4 4 0 014 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 22v-6a4 4 0 018 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 28h4M28 28h4M16 32h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Healthy Foods',
    desc: 'Share stories and experi from current volunteers to inspire others to join. Allow user to sign up for volunteer opportunities.',
  },
  {
    id: 3,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <circle cx="17" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="31" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 38c0-6.627 4.925-12 11-12h14c6.075 0 11 5.373 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 20v8M20 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Charity Donate',
    desc: 'Share stories and experi from current volunteers to inspire others to join. Allow user to sign up for volunteer opportunities.',
  },
  {
    id: 4,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 6C15.163 6 8 13.163 8 22c0 5.637 2.831 10.608 7.151 13.633L14 42h20l-1.151-6.367C37.169 32.608 40 27.637 40 22c0-8.837-7.163-16-16-16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 42h12M20 22h8M24 18v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Education Support',
    desc: 'Share stories and experi from current volunteers to inspire others to join. Allow user to sign up for volunteer opportunities.',
  },
  {
    id: 5,
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 6c-5 0-16 8-16 22 0 8 7 14 16 14s16-6 16-14C40 14 29 6 24 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 18v12M18 24h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Clean Water',
    desc: 'Share stories and experi from current volunteers to inspire others to join. Allow user to sign up for volunteer opportunities.',
  },
];

export default function WhatWeDoSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % services.length);
  }, []);

  // Auto-advance every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className={styles.section} id="what-we-do">
      {/* Section pattern background */}
      <div
        className={styles.pattern}
        style={{ backgroundImage: 'url(/images/feature-v1-pattern2.png)' }}
      />

      {/* Decorative heart bottom-right */}
      <div className={styles.heartDecor}>
        <svg viewBox="0 0 200 185" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 170 C100 170 10 110 10 55 C10 25 30 8 55 18 C70 25 85 40 100 58 C115 40 130 25 145 18 C170 8 190 25 190 55 C190 110 100 170 100 170 Z"
            stroke="var(--color-primary)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.tagline}>
            {/* Left arrows */}
            <span className={styles.taglineDeco}>
              <span className={styles.taglineDot} />
              <svg width="44" height="10" viewBox="0 0 44 10"><line x1="44" y1="5" x2="10" y2="5" stroke="var(--color-primary)" strokeWidth="2"/><polyline points="18,1 8,5 18,9" stroke="var(--color-primary)" strokeWidth="2" fill="none"/></svg>
            </span>
            <span className={styles.taglineText}>What We Do</span>
            {/* Right arrows */}
            <span className={styles.taglineDeco}>
              <svg width="44" height="10" viewBox="0 0 44 10"><line x1="0" y1="5" x2="34" y2="5" stroke="var(--color-primary)" strokeWidth="2"/><polyline points="26,1 36,5 26,9" stroke="var(--color-primary)" strokeWidth="2" fill="none"/></svg>
              <span className={styles.taglineDot} />
            </span>
          </div>
          <h2 className={styles.heading}>
            Changing lives through care,<br />
            compassion, and action
          </h2>
        </div>

        {/* ── Cards ── */}
        <div className={styles.cardsWrapper}>
          {services.map((svc, i) => (
            <div
              key={svc.id}
              className={`${styles.card} ${i === activeIndex ? styles.cardActive : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <div className={styles.iconBox}>
                {svc.icon}
              </div>
              <h3 className={styles.cardTitle}>{svc.title}</h3>
              <div className={styles.cardTitleLine} />
              <p className={styles.cardDesc}>{svc.desc}</p>
              <a href="#" className={styles.viewDetails}>
                View Details
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </a>

              {/* Active card floating dot */}
              {i === activeIndex && <div className={styles.activeDot} />}
            </div>
          ))}
        </div>

        {/* ── Dots ── */}
        <div className={styles.dots}>
          {services.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
