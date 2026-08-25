'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CenteredHeroBanner.module.css';

export default function CenteredHeroBanner() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className={styles.orbitalSection} id="hero">
      {/* Dynamic Background with SVG EKG pulse */}
      <div className={styles.dynamicBg}>
        <div className={styles.particles} />
        <svg className={styles.ekgLine} preserveAspectRatio="none" viewBox="0 0 1000 200">
          <path
            d="M0,100 L250,100 L270,50 L300,180 L330,20 L360,130 L380,100 L1000,100"
            fill="none"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="4"
          />
          <path
            className={styles.ekgPulse}
            d="M0,100 L250,100 L270,50 L300,180 L330,20 L360,130 L380,100 L1000,100"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
          />
        </svg>
      </div>

      {/* Top Title */}
      <div className={`${styles.topTitleBlock} ${mounted ? styles.fadeInUp : ''}`}>
         <h1>Complete Healthcare Services<br/>At Your Doorstep</h1>
         <p className={styles.subtitle}>
           Book Lab Tests, Order Medicines, Home Healthcare Services And Teleconsultation Through BENVA Healthcare.
         </p>
      </div>

      <div className={`${styles.orbitalContainer} ${mounted ? styles.fadeIn : ''}`}>
        
        {/* Central Core */}
        <div className={styles.coreWrapper}>
           <div className={styles.coreGlow} />
           <div className={styles.coreContent}>
             <p className={styles.coreWelcome}>Welcome To</p>
             <h2>BENVA</h2>
             <p className={styles.coreHealth}>Healthcare</p>
           </div>
        </div>

        {/* Orbiting Track */}
        <div 
          className={`${styles.orbitTrack} ${isHovered ? styles.paused : ''}`}
        >
           {/* Satellite 1: Premium Checkup (Top Right) */}
           <div 
             className={`${styles.satelliteWrapper} ${styles.sat1}`}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
           >
              <div className={`${styles.satelliteContent} ${isHovered ? styles.paused : ''}`}>
                 <div className={styles.satIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                 </div>
                 <div className={styles.satText}>
                   <h3>Lab Tests</h3>
                   <Link href="/health-packages">Book Now</Link>
                 </div>
              </div>
           </div>

           {/* Satellite 2: Medicines (Bottom) */}
           <div 
             className={`${styles.satelliteWrapper} ${styles.sat2}`}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
           >
              <div className={`${styles.satelliteContent} ${isHovered ? styles.paused : ''}`}>
                 <div className={styles.satIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                       <polyline points="14 2 14 8 20 8" />
                       <line x1="12" y1="18" x2="12" y2="12" />
                       <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                 </div>
                 <div className={styles.satText}>
                   <h3>Pharmacy</h3>
                    <button onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('services-grid');
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }} className={styles.satLinkBtn}>Order Now</button>
                 </div>
              </div>
           </div>

           {/* Satellite 3: Home Care (Top Left) */}
           <div 
             className={`${styles.satelliteWrapper} ${styles.sat3}`}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
           >
              <div className={`${styles.satelliteContent} ${isHovered ? styles.paused : ''}`}>
                 <div className={styles.satIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                 </div>
                 <div className={styles.satText}>
                   <h3>Home Care</h3>
                    <button onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('home-healthcare');
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }} className={styles.satLinkBtn}>Explore</button>
                 </div>
              </div>
           </div>
           
        </div>
      </div>
      
      {/* Bottom Content Block */}
      <div className={`${styles.bottomContentBlock} ${mounted ? styles.fadeInUp : ''}`}>
         <div className={styles.buttons}>
            <Link href="/health-packages" className={styles.btnAction}>
              <div className={styles.btnIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 6L2 18" />
                  <path d="M18 10L14 6" />
                  <path d="M22 6C22 8 20 10 18 10C16 10 14 8 14 6C14 4 16 2 18 2C20 2 22 4 22 6Z" />
                  <path d="M2 18H8V22H2V18Z" />
                </svg>
              </div>
              <div className={styles.btnTextWrapper}>
                <span className={styles.btnSmallText}>Book</span>
                <span className={styles.btnLargeText}>Health Checkup</span>
              </div>
              <div className={styles.btnArrow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </Link>

            <button 
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('services-grid');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }} 
              className={styles.btnAction}
            >
              <div className={styles.btnIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <div className={styles.btnTextWrapper}>
                <span className={styles.btnSmallText}>Order</span>
                <span className={styles.btnLargeText}>Medicines</span>
              </div>
              <div className={styles.btnArrow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>
          </div>
      </div>
    </section>
  );
}
