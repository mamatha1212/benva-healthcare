'use client';
import React, { useState } from 'react';
import styles from './DonateSection.module.css';

export default function DonateSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className={styles.section} id="donate">

      {/* ── Left: Grayscale photo background ── */}
      <div
        className={styles.photoBg}
        style={{ backgroundImage: 'url(/images/donate-bg.jpg), url(/images/main-slider-v2-img2.jpg)' }}
      />

      {/* ── Right: Teal panel ── */}
      <div className={styles.tealPanel} />

      {/* ── Wave: Two white circles creating S-curve divider ── */}
      <div className={styles.waveTop} />
      <div className={styles.waveBottom} />

      {/* ── Floating ring dot ── */}
      <div className={styles.floatingDot} />

      {/* ── All content sits above the layers ── */}
      <div className={styles.contentRow}>

        {/* Empty left spacer */}
        <div className={styles.leftSpacer} />

        {/* Right teal content */}
        <div className={styles.tealContent}>

          {/* Tagline */}
          <div className={styles.tagline}>
            <svg width="36" height="10" viewBox="0 0 36 10" fill="none">
              <line x1="0" y1="5" x2="28" y2="5" stroke="var(--color-primary)" strokeWidth="2"/>
              <polyline points="24,1 32,5 24,9" stroke="var(--color-primary)" strokeWidth="2" fill="none"/>
            </svg>
            <span>Help The People</span>
          </div>

          {/* Heading */}
          <h2 className={styles.heading}>
            Donate Now, Give Time,<br />
            Change Lives
          </h2>

          {/* Description */}
          <p className={styles.desc}>
            We help companies develop powerful corporate social responsibility,
            grantmaking, and employee engagement strategies. Our impact is
            about more than moving money to where it&apos;s needed most
          </p>

          {/* ── Donation Card ── */}
          <div
            className={`${styles.donateCard} ${hovered ? styles.donateCardHovered : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Card photo */}
            <div
              className={styles.cardPhoto}
              style={{ backgroundImage: 'url(/images/feature-v1-img1.jpg)' }}
            >
              {/* Floating dot on card */}
              <div className={styles.cardDot} />
            </div>

            {/* Card content */}
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>
                Big charity: build school<br />for poor children
              </h3>
              <p className={styles.cardDesc}>
                Stay informed about our upcoming events and campaigns.
              </p>

              {/* Progress bar */}
              <div className={styles.progressRow}>
                <div className={styles.progressBg}>
                  <div className={styles.progressFill} style={{ width: '85%' }} />
                </div>
                <span className={styles.progressBadge}>85%</span>
              </div>

              {/* Raised / Goal */}
              <div className={styles.raisedRow}>
                <span className={styles.raisedAmt}>$5,000.00 Raised</span>
                <span className={styles.goalAmt}>Goal - $10,000.00</span>
              </div>

              {/* Donate button */}
              <a href="#" className={styles.donateBtn}>
                Donate Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
