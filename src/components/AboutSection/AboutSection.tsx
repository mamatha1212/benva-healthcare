'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from './AboutSection.module.css';

function useCountUp(target: number, duration = 1600, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const years = useCountUp(25, 1400, visible);

  return (
    <section className={styles.section} ref={sectionRef} id="about">
      <div className={styles.container}>

        {/* ═══════════ LEFT — Images collage ═══════════ */}
        <div className={styles.imageCol}>

          {/* Decorative background circle */}
          <div className={styles.bgCircle} />

          {/* Decorative heart (top-left) */}
          <div className={styles.heartDecor}>
            <svg viewBox="0 0 140 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M70 120 C70 120 5 75 5 35 C5 15 20 3 38 10 C50 15 60 26 70 38 C80 26 90 15 102 10 C120 3 135 15 135 35 C135 75 70 120 70 120 Z"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                className={styles.heartPath}
              />
            </svg>
          </div>

          {/* Top-right photo */}
          <div
            className={`${styles.photo} ${styles.photoTop}`}
            style={{ backgroundImage: 'url(/images/about-img1.jpg)' }}
          />

          {/* Bottom-left photo */}
          <div
            className={`${styles.photo} ${styles.photoBottom}`}
            style={{ backgroundImage: 'url(/images/feature-v1-img1.jpg)' }}
          />

          {/* Years of experience card */}
          <div className={styles.statsCard}>
            <span className={styles.statsNum}>{years}+</span>
            <span className={styles.statsLabel}>Years Of<br />Experiences</span>
            {/* Card border decoration */}
            <div className={styles.statsCardBorder} />
          </div>

        </div>

        {/* ═══════════ RIGHT — Content ═══════════ */}
        <div className={styles.contentCol}>

          {/* Tagline */}
          <div className={styles.tagline}>
            <span className={styles.taglineArrow}>
              <svg width="36" height="10" viewBox="0 0 36 10" fill="none">
                <line x1="0" y1="5" x2="28" y2="5" stroke="var(--color-primary)" strokeWidth="2"/>
                <polyline points="24,1 32,5 24,9" stroke="var(--color-primary)" strokeWidth="2" fill="none"/>
              </svg>
            </span>
            <span>About Our Charity</span>
          </div>

          {/* Heading */}
          <h2 className={styles.heading}>
            We&apos;re Creating Hope<br />
            Where It&apos;s Needed Most
          </h2>

          {/* Description */}
          <p className={styles.desc}>
            Benva Healthcare is a nonprofit organization dedicated to supporting
            underprivileged children and families through education, nutrition,
            and emergency relief. Since 1999, we&apos;ve worked with volunteers,
            donors, and local partners to bring real,{' '}
            <span className={styles.descHighlight}>lasting change</span> to
            communities in need.
          </p>

          {/* Feature items */}
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h4>Trusted Organization</h4>
                <p>We help communities develop powerful social impact programs that create lasting change.</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconAlt}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  <path d="M17 9.5C17 8.12 15.88 7 14.5 7S12 8.12 12 9.5c0 1.74 1.75 3.35 2.5 4 .75-.65 2.5-2.26 2.5-4z" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h4>Start Donating</h4>
                <p>We help communities develop powerful social impact programs that create lasting change.</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Extra paragraph */}
          <p className={styles.extraDesc}>
            We believe every child deserves love, opportunity, and a future worth
            dreaming about — and that&apos;s what we fight for every day.
          </p>

          {/* CTA Row */}
          <div className={styles.ctaRow}>
            <a href="#" className={styles.btnDiscover}>
              Discover Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>

            <div className={styles.callBox}>
              <div className={styles.callIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </div>
              <div className={styles.callText}>
                <span className={styles.callLabel}>Call us any time:</span>
                <span className={styles.callNumber}>+88 0123 654 99</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
