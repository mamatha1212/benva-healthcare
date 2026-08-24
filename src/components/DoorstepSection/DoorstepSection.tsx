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
        scrollContainer.scrollLeft += 1;
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

      <div className={`${styles.pillGrid} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.2s' }}>
        
        {/* Pill 1 */}
        <div className={styles.pillCard}>
          <div className={styles.pillIcon} style={{ color: '#22c55e' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className={styles.pillText}>
            <h4>Certified Phlebotomists</h4>
          </div>
        </div>

        {/* Pill 2 */}
        <div className={styles.pillCard}>
          <div className={styles.pillIcon} style={{ color: '#ef4444' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          </div>
          <div className={styles.pillText}>
            <h4>Home Sample Collection</h4>
            <span>ANDHRA PRADESH & TELANGANA</span>
          </div>
        </div>

        {/* Pill 3 */}
        <div className={styles.pillCard}>
          <div className={styles.pillIcon} style={{ color: '#3b82f6' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l.5-.5a4 4 0 0 0 5.56-5.56l7.95-7.95a2.12 2.12 0 0 0-3-3l-7.95 7.95a4 4 0 0 0-5.56 5.56l-.5.5Z"/></svg>
          </div>
          <div className={styles.pillText}>
            <h4>NABL Partner Labs</h4>
          </div>
        </div>

        {/* Pill 4 */}
        <div className={styles.pillCard}>
          <div className={styles.pillIcon} style={{ color: '#eab308' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 19 12a2.828 2.828 0 1 0-4-4L6.5 16.5a2.828 2.828 0 1 0 4 4z"/><path d="m16.5 10.5-6 6"/></svg>
          </div>
          <div className={styles.pillText}>
            <h4>Medicine Delivery</h4>
            <span>AVAILABLE ACROSS INDIA</span>
          </div>
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
