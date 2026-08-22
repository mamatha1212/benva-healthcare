'use client';
import React from 'react';
import styles from './WorkProcessSection.module.css';

export default function WorkProcessSection() {
  const processes = [
    {
      id: '01',
      title: 'Identify the Need',
      desc: 'To inform and engage potential donors and supporters about the charity’s and the cause it supports.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 9 9 9 9z" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
      isUp: true,
    },
    {
      id: '02',
      title: 'Plan the Program',
      desc: 'To inform and engage potential donors and supporters about the charity’s and the cause it supports.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M12 12h.01" />
          <path d="M17 12h.01" />
          <path d="M7 12h.01" />
        </svg>
      ),
      isUp: false,
    },
    {
      id: '03',
      title: 'Deliver the Help',
      desc: 'To inform and engage potential donors and supporters about the charity’s and the cause it supports.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      ),
      isUp: true,
    },
    {
      id: '04',
      title: 'Monitor & Grow',
      desc: 'To inform and engage potential donors and supporters about the charity’s and the cause it supports.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      ),
      isUp: false,
    },
  ];

  return (
    <section className={styles.section} id="process">
      
      {/* ── Background Hands Decor ── */}
      <div className={styles.bgDecor}>
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Hand (Teal outline) */}
          <path d="M300,50 C320,30 350,40 360,60 C370,80 340,120 310,130 C290,140 250,130 240,110 C230,90 270,70 300,50 Z" stroke="var(--color-secondary)" strokeWidth="3" fill="none" />
          <path d="M310,90 C315,80 325,85 320,95 C315,105 305,100 310,90 Z" stroke="var(--color-secondary)" strokeWidth="3" fill="none" />
          {/* Bottom Hand (Orange outline) */}
          <path d="M350,200 C370,180 400,190 410,210 C420,230 390,270 360,280 C340,290 300,280 290,260 C280,240 320,220 350,200 Z" stroke="var(--color-primary)" strokeWidth="3" fill="none" />
          <path d="M360,240 C365,230 375,235 370,245 C365,255 355,250 360,240 Z" stroke="var(--color-primary)" strokeWidth="3" fill="none" />
        </svg>
      </div>

      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Work Process</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <h2 className={styles.heading}>How We Proceed with Donations</h2>
        </div>

        {/* ── Process Grid ── */}
        <div className={styles.processWrapper}>
          
          {/* Background Dotted Line */}
          <div className={styles.dottedLineSvg}>
            <svg width="100%" height="100%">
              <line x1="12.5%" y1="75%" x2="37.5%" y2="25%" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="6,6" />
              <line x1="37.5%" y1="25%" x2="62.5%" y2="75%" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="6,6" />
              <line x1="62.5%" y1="75%" x2="87.5%" y2="25%" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="6,6" />
            </svg>
          </div>

          <div className={styles.grid}>
            {processes.map((proc, index) => (
              <div 
                key={proc.id} 
                className={`${styles.card} ${proc.isUp ? styles.cardUp : styles.cardDown}`}
              >
                {/* Text Block */}
                <div className={styles.textBlock}>
                  <div className={styles.numBadge}>{proc.id}</div>
                  <h3 className={styles.title}>{proc.title}</h3>
                  <p className={styles.desc}>{proc.desc}</p>
                </div>

                {/* Hexagon Icon */}
                <div className={styles.hexagonWrapper}>
                  <div className={styles.hexagon}>
                    {proc.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
