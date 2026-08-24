'use client';
import React, { useEffect, useState } from 'react';
import styles from './DoorstepSection.module.css';

const cities = [
  'Rajahmundry', 'Kakinada', 'Visakhapatnam', 'Vijayawada', 
  'Tirupati', 'Nellore', 'Warangal', 'Karimnagar', 'Nizamabad'
];

export default function DoorstepSection() {
  const [mounted, setMounted] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let isHovered = false;

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    const step = () => {
      if (!isHovered && scrollContainer) {
        scrollContainer.scrollLeft += 1; // Scroll speed
        // Seamless infinite loop (using the tripled array)
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.section} id="doorstep">
      <div className={styles.bgGlow}></div>
      
      <div className={`${styles.sectionHeader} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.1s' }}>
        <h2 className={styles.heading}>Full Body Health Packages At Your Doorstep</h2>
        <p className={styles.subtitle}>Professional Home Sample Collection Service</p>
      </div>

      <div className={styles.cardsContainer}>
        {/* Card 1: Home Sample Collection (Active Style) */}
        <div className={`${styles.card} ${styles.cardActive} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>Home Sample Collection</h3>
          </div>
          <p className={styles.cardDesc}>Professional laboratory sample collection from the comfort of your home.</p>
          
          <ul className={styles.cardFeatures}>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Certified Phlebotomists
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              NABL Partner Labs
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Andhra Pradesh & Telangana
            </li>
          </ul>

          <button className={styles.btnPrimary}>
            Book Collection
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>

        {/* Card 2: Medicine Delivery (Inactive Style) */}
        <div className={`${styles.card} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 19 12a2.828 2.828 0 1 0-4-4L6.5 16.5a2.828 2.828 0 1 0 4 4z"/><path d="m16.5 10.5-6 6"/></svg>
            </div>
            <h3>Medicine Delivery</h3>
          </div>
          <p className={styles.cardDesc}>Genuine medicines delivered securely and directly to your doorstep.</p>
          
          <ul className={styles.cardFeatures}>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Available Across India
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Fast & Secure Delivery
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Authentic Medications
            </li>
          </ul>

          <button className={styles.btnSecondary}>
            Order Medicine
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
      </div>

      {/* Locations Timeline Tile */}
      <div className={`${styles.locationsTile} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.4s' }}>
        <div className={styles.locationsHeader}>
          <span className={styles.locationPin}>📍</span>
          <h3>Serving Andhra Pradesh & Telangana</h3>
        </div>
        
        <div className={styles.timelineWrapper}>
          <button className={`${styles.timelineNav} ${styles.navLeft}`} onClick={() => scroll('left')}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <div className={styles.timelineScroll} ref={scrollRef}>
            {[...cities, ...cities, ...cities].map((city, index) => {
              const colors = ['#38bdf8', '#fb923c', '#2dd4bf', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#f87171'];
              return (
                <div key={index} className={styles.timelineNode}>
                  <div className={styles.timelineCircle} style={{ backgroundColor: colors[index % colors.length] }}>
                    <div className={styles.timelineInnerCircle}></div>
                  </div>
                  <span className={styles.timelineCity}>{city}</span>
                </div>
              );
            })}
          </div>

          <button className={`${styles.timelineNav} ${styles.navRight}`} onClick={() => scroll('right')}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
