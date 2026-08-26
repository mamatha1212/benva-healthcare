'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './SplitHeroBanner.module.css';

const slide = {
  tagline: 'Welcome To BENVA Healthcare',
  heading: 'Complete Healthcare Services\nAt Your Doorstep',
  subtitle: 'Book Lab Tests, Order Medicines, Home Healthcare Services And Teleconsultation Through BENVA Healthcare.',
};

export default function SplitHeroBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.container}>
        
        {/* Left Column: Text Content */}
        <div className={styles.textContent}>
          <div className={`${styles.tagline} ${mounted ? styles.fadeInUp : ''}`}>
            {slide.tagline}
          </div>
          
          <h1 className={styles.heading}>
            {slide.heading.split('\n').map((line, i) => (
              <span key={i} className={`${styles.headingLine} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                {line}
              </span>
            ))}
          </h1>
          
          <p className={`${styles.subtitle} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.3s' }}>
            {slide.subtitle}
          </p>

          <div className={`${styles.buttons} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.4s' }}>
            <Link href="/health-packages" className={styles.btnPrimary}>
              Book Health Checkup
            </Link>
            <Link href="/medicines" className={styles.btnSecondary}>
              Order Medicines
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className={`${styles.trustIndicators} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.5s' }}>
             <div className={styles.trustItem}>
                <strong>24/7</strong>
                <span>Support</span>
             </div>
             <div className={styles.trustItem}>
                <strong>50k+</strong>
                <span>Happy Patients</span>
             </div>
             <div className={styles.trustItem}>
                <strong>100%</strong>
                <span>Safe & Secure</span>
             </div>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className={`${styles.imageContent} ${mounted ? styles.fadeIn : ''}`}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/home-healthcare.png"
              alt="Healthcare Services"
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
          {/* Decorative accents */}
          <div className={styles.accentCircle1} />
          <div className={styles.accentCircle2} />
        </div>
        
      </div>
    </section>
  );
}
