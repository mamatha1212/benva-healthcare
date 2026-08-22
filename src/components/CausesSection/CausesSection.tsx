'use client';
import React from 'react';
import styles from './CausesSection.module.css';

const causes = [
  {
    id: 1,
    title: 'Fighting Hunger with Food Distribution Drives',
    image: '/images/cause-v2-img1.jpg',
    percentage: 75,
    raised: '4M',
    goal: '$10M',
  },
  {
    id: 2,
    title: 'Big charity: build school for poor children',
    image: '/images/cause-v2-img2.jpg',
    percentage: 85,
    raised: '7M',
    goal: '$10M',
  },
  {
    id: 3,
    title: 'Providing Medical Aid to Undeserved Areas',
    image: '/images/cause-v2-img3.jpg',
    percentage: 65,
    raised: '6M',
    goal: '$10M',
  },
];

export default function CausesSection() {
  return (
    <section className={styles.section} id="causes">
      
      {/* ── Dark Top Background ── */}
      <div className={styles.darkBg}>
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.taglineWrapper}>
              <div className={styles.lineLeft}>
                <div className={styles.line} />
                <div className={styles.diamond} />
              </div>
              <span className={styles.tagline}>Popular Causes</span>
            </div>
            <h2 className={styles.heading}>Let's Help Change Lives<br/>For Good</h2>
          </div>
          
          <div className={styles.headerRight}>
            <button className={styles.navBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button className={styles.navBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Causes Grid ── */}
        <div className={styles.grid}>
          {causes.map((cause) => (
            <div key={cause.id} className={styles.card}>
              
              {/* Image with white padding frame */}
              <div className={styles.imageFrame}>
                <div 
                  className={styles.image}
                  style={{ backgroundImage: `url(${cause.image}), linear-gradient(#e5e7eb, #9ca3af)` }}
                />
              </div>

              {/* Content */}
              <div className={styles.content}>
                <h3 className={styles.title}>{cause.title}</h3>
                
                {/* Donation Progress Box */}
                <div className={styles.progressBox}>
                  
                  <div className={styles.progressHeader}>
                    <span className={styles.donationLabel}>Donation</span>
                    <div className={styles.percentageBadge}>
                      {cause.percentage}%
                      <div className={styles.badgeTail} />
                    </div>
                  </div>

                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${cause.percentage}%` }}
                    />
                  </div>

                  <div className={styles.progressFooter}>
                    <span className={styles.raised}>Raised - {cause.raised}</span>
                    <span className={styles.goal}>Goal - {cause.goal}</span>
                  </div>

                  <button className={styles.donateBtn}>
                    Donate Now 
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      
      {/* ── Bottom White Area Decor ── */}
      <div className={styles.bottomDecor}>
        <svg viewBox="0 0 200 200" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4">
          <path d="M200,50 C150,40 100,100 50,80 C0,60 -50,120 -100,100" />
          <path d="M200,80 C150,70 100,130 50,110 C0,90 -50,150 -100,130" />
          <path d="M200,110 C150,100 100,160 50,140 C0,120 -50,180 -100,160" />
          <path d="M200,140 C150,130 100,190 50,170 C0,150 -50,210 -100,190" />
        </svg>
      </div>

    </section>
  );
}
