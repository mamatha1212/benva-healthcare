'use client';
import React from 'react';
import Link from 'next/link';
import styles from './HeroVariant3.module.css';

const ITEMS = [
  { id: 1, name: "Medicines", image: "/images/categories/cat_medicines_1788025281247.png" },
  { id: 2, name: "Doctor Consultation", image: "/images/categories/cat_doctor_1788025303906.png" },
  { id: 3, name: "Lab Tests", image: "/images/categories/cat_lab_1788025325186.png" },
  { id: 4, name: "Memberships", image: "/images/categories/cat_memberships_1788025345793.png" },
];

export default function HeroVariant3() {
  const totalItems = ITEMS.length;
  const animationDuration = 20; // 20 seconds for one full rotation

  return (
    <section className={styles.heroSection}>
      <div className={styles.starryBackground}></div>

      <div className={styles.bgElements}>
        <div className={styles.glowingOrb} style={{ width: '300px', height: '300px', background: '#3182ce', top: '10%', left: '-100px', animationDelay: '0s' }}></div>
        <div className={styles.glowingOrb} style={{ width: '250px', height: '250px', background: '#38a169', bottom: '10%', right: '-50px', animationDelay: '2s' }}></div>
        
        <svg className={styles.medicalPlus} style={{ top: '20%', left: '15%', width: '40px', height: '40px', animationDelay: '1s' }} viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
        <svg className={styles.medicalPlus} style={{ top: '70%', left: '10%', width: '30px', height: '30px', animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
        <svg className={styles.medicalPlus} style={{ top: '15%', right: '20%', width: '35px', height: '35px', animationDelay: '0.5s' }} viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
        <svg className={styles.medicalPlus} style={{ top: '65%', right: '15%', width: '50px', height: '50px', animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
      </div>

      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <div className={styles.textContent}>
            <div className={styles.welcomeBadge}>Welcome to Benva Healthcare</div>
            <h2 className={styles.mainHeading}>Quality Healthcare <br/> at <span className={styles.highlight}>Your Fingertips</span></h2>
            <p className={styles.subHeading}>Connect with certified doctors and healthcare professionals anytime, anywhere</p>
          </div>
          
          <div className={styles.buttonsContainer}>
            <Link href="/health-packages" className={styles.btnAction}>
              <div className={styles.btnIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            <Link href="/medicines" className={styles.btnAction}>
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
            </Link>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.circleContainer}>
            {/* Center Logo */}
            <svg className={styles.ekgLine} preserveAspectRatio="none" viewBox="0 0 1000 200"><path d="M0,100 L250,100 L270,50 L300,180 L330,20 L360,130 L380,100 L1000,100" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" /><path className={styles.ekgPulse} d="M0,100 L250,100 L270,50 L300,180 L330,20 L360,130 L380,100 L1000,100" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" /></svg>
            <div className={styles.centerLogo}>
              <span className={styles.centerLogoWelcome}>Welcome to</span>
              <span className={styles.centerLogoText}>Benva</span>
              <span className={styles.centerLogoSubText}>Healthcare</span>
            </div>

            {/* Rotating Track */}
            <div className={styles.rotatingTrack}>
              {ITEMS.map((item, index) => {
                const itemBaseAngle = index * (360 / totalItems);
                const animationDelay = -(index * (animationDuration / totalItems));

                return (
                  <div 
                    key={item.id} 
                    className={styles.itemWrapper}
                    style={{
                      transform: `rotate(${itemBaseAngle}deg) translateX(var(--circle-radius))`
                    }}
                  >
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        transform: `rotate(${-itemBaseAngle}deg)`
                      }}
                    >
                      <div style={{
                        width: '100%', 
                        height: '100%',
                        animation: `${styles.counterRotate} ${animationDuration}s linear infinite`
                      }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className={styles.itemImage}
                          style={{
                            animation: `${styles.scalePulse} ${animationDuration}s linear infinite`,
                            animationDelay: `${animationDelay}s`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

