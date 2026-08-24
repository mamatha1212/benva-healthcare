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

      <div className={`${styles.cardsGrid} ${mounted ? styles.fadeInUp : ''}`} style={{ animationDelay: '0.2s' }}>
        
        {/* Left Card */}
        <div className={styles.mainCard}>
          <div className={styles.pillItem}>
            <div className={styles.pillIcon} style={{ color: '#22c55e' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className={styles.pillText}>Certified Phlebotomists</span>
          </div>

          <div className={styles.pillItem}>
            <div className={styles.pillIcon} style={{ color: '#94a3b8' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><circle cx="12" cy="18" r="3"/></svg>
            </div>
            <span className={styles.pillText}>NABL Partner Labs</span>
          </div>
        </div>

        {/* Right Card */}
        <div className={styles.mainCard}>
          <div className={styles.listItem}>
            <div className={styles.listIconWrap}>
              <div className={styles.listIcon} style={{ color: '#ef4444' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
            </div>
            <div className={styles.listContent}>
              <h4>Home Sample Collection</h4>
              <span>ANDHRA PRADESH & TELANGANA</span>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.listItem}>
            <div className={styles.listIconWrap}>
              <div className={styles.listIcon} style={{ color: '#eab308' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5 19 12a2.828 2.828 0 1 0-4-4L6.5 16.5a2.828 2.828 0 1 0 4 4z"/><path d="m16.5 10.5-6 6"/></svg>
              </div>
            </div>
            <div className={styles.listContent}>
              <h4>Medicine Delivery</h4>
              <span>AVAILABLE ACROSS INDIA</span>
            </div>
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
