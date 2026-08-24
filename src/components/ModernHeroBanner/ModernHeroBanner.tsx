'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ModernHeroBanner.module.css';

const slide = {
  tagline: 'Welcome To BENVA Healthcare',
  heading: 'Complete Healthcare Services\nAt Your Doorstep',
  subtitle: 'Book Lab Tests, Order Medicines, Home Healthcare Services And Teleconsultation Through BENVA Healthcare.',
};

export default function ModernHeroBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className={styles.hero} id="hero">
      {/* Background Image with Dark Overlay */}
      <div className={styles.bgImageWrapper}>
        <Image
          src="/images/hero-bg-new.png"
          alt="Healthcare Background"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Deep dark gradient background */}
      <div className={styles.bgGradient}>
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
      </div>

      <div className={styles.container}>
        {/* Central Text Content */}
        <div className={styles.textContent}>
          <div className={`${styles.tagline} ${mounted ? styles.fadeInUp : ''}`}>
            {slide.tagline}
          </div>
          
          <h1 className={styles.heading}>
            {slide.heading.split('\n').map((line, i) => (
              <span key={i} className={`${styles.headingLine} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: `${(i + 1) * 0.15}s` }}>
                {line}
              </span>
            ))}
          </h1>
          
          <p className={`${styles.subtitle} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.45s' }}>
            {slide.subtitle}
          </p>
        </div>

        {/* Floating Glass Cards Area */}
        <div className={styles.glassCardsArea}>
          
          {/* Main Central Card */}
          <div className={`${styles.glassCard} ${styles.cardCenter} ${mounted ? styles.floatAnim1 : ''}`}>
             <div className={styles.cardIconMain}>
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
               </svg>
             </div>
             <h3>Premium Checkup</h3>
             <p>Complete body profile</p>
             <a href="#premium-checkup" className={styles.cardBtn}>Book Now</a>
          </div>

          {/* Left Floating Card */}
          <div className={`${styles.glassCard} ${styles.cardLeft} ${mounted ? styles.floatAnim2 : ''}`}>
             <div className={styles.cardIconSmall}>
               <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                 <polyline points="14 2 14 8 20 8" />
                 <line x1="12" y1="18" x2="12" y2="12" />
                 <line x1="9" y1="15" x2="15" y2="15" />
               </svg>
             </div>
             <h4>Medicines</h4>
             <span>Doorstep Delivery</span>
             <a href="#services-grid" className={styles.cardLink}>Order</a>
          </div>

          {/* Right Floating Card */}
          <div className={`${styles.glassCard} ${styles.cardRight} ${mounted ? styles.floatAnim3 : ''}`}>
             <div className={styles.cardIconSmall}>
               <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
               </svg>
             </div>
             <h4>Home Healthcare</h4>
             <span>Expert Care</span>
             <a href="#home-healthcare" className={styles.cardLink}>Explore</a>
          </div>
          
        </div>
      </div>
      
      {/* Decorative Bottom Fade */}
      <div className={styles.bottomFade} />
    </section>
  );
}
