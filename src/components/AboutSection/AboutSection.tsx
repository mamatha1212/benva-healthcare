'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from './AboutSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

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
            style={{ backgroundImage: 'url(/images/about-team-new.jpg)' }}
          />

          {/* Bottom-left photo */}
          <div
            className={`${styles.photo} ${styles.photoBottom}`}
            style={{ backgroundImage: 'url(/images/about-consult-new.jpg)' }}
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
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Your Health, Completely Reimagined</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>

          {/* Heading */}
          <AnimatedHeading className={styles.heading}>
            Bridging the Gap Between You and World-Class Healthcare
          </AnimatedHeading>

          {/* Description */}
          <p className={styles.desc}>
            At BENVA Healthcare, we are redefining what it means to be truly cared for. We don't just connect you to services; we orchestrate a seamless ecosystem of top-tier laboratories, expert physicians, and premium home-care specialists tailored entirely around you.<br/><br/>
            Whether you need an urgent teleconsultation, precise diagnostics, or dedicated nursing at home, we bring the hospital's excellence directly to your doorstep—eliminating the wait, hassle, and uncertainty from your health journey.
          </p>

          {/* Feature items */}
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h4>Trusted Partners</h4>
                <p>Leading Labs, Pharmacies And Healthcare Providers.</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconAlt}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h4>Easy Booking</h4>
                <p>Simple And Hassle-Free Service Requests</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h4>Dedicated Support</h4>
                <p>Healthcare Assistance When You Need It</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconAlt}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className={styles.featureText}>
                <h4>Service Coverage</h4>
                <p>Available Across Andhra Pradesh & Telangana</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Extra paragraph */}
          <p className={styles.extraDesc}>
            Driven by a relentless commitment to your well-being, we ensure every step of your health journey is premium, precise, and profoundly human.
          </p>

          {/* CTA Row */}
          <div className={styles.ctaRow}>
            <a href="/about" className={styles.btnDiscover}>
              Know More
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
                <span className={styles.callNumber}>+91 9111145556</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
