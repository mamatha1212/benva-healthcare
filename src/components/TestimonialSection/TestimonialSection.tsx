'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './TestimonialSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

const testimonials = [
  {
    id: 1,
    rating: '5.0',
    text: '"Booked a full body health checkup through BENVA Healthcare. The process was smooth and the home sample collection was very convenient."',
    name: 'Ramesh Kumar',
    role: 'Kakinada',
    stars: 5,
  },
  {
    id: 2,
    rating: '5.0',
    text: '"The support team responded quickly and helped us with healthcare services for my parents. Good experience overall."',
    name: 'Lakshmi Devi',
    role: 'Rajahmundry',
    stars: 5,
  },
  {
    id: 3,
    rating: '5.0',
    text: '"Easy booking process and professional support throughout the service. Highly satisfied."',
    name: 'Srinivas Rao',
    role: 'Amalapuram',
    stars: 5,
  },
  {
    id: 4,
    rating: '5.0',
    text: '"The medicine assistance process was simple and the team guided us clearly."',
    name: 'Priya',
    role: 'Hyderabad',
    stars: 5,
  },
  {
    id: 5,
    rating: '5.0',
    text: '"Very helpful healthcare support team and easy service booking process."',
    name: 'Venkatesh',
    role: 'Vijayawada',
    stars: 5,
  },
];

export default function TestimonialSection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPos = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.offsetWidth / 3; // Approx
      const newIndex = Math.round(scrollPos / itemWidth);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < testimonials.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  return (
    <section className={styles.section} id="testimonial">
      {/* Background Decor */}
      <div className={styles.bgDecor}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <span className={styles.tagline}>Experiences Shared By Our Customers</span>
          </div>
          <AnimatedHeading className={styles.heading}>What Our Customers Say</AnimatedHeading>
          <p className={styles.subtitle}>
            Don't just take our word for it. Read what our customers have to say about their experience with BENVA Healthcare.
          </p>
        </div>

        {/* ── Content Slider ── */}
        <div className={styles.sliderContainer}>
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={scrollLeft} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div className={styles.grid} ref={scrollRef} onScroll={handleScroll}>
            {testimonials.map((testi) => (
              <div key={testi.id} className={styles.card}>
              
              <div className={styles.quoteIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 11v5a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-5l2-5h4l-2 5h4zM22 11v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-5l2-5h4l-2 5h4z"/>
                </svg>
              </div>

              <p className={styles.quoteText}>{testi.text}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.avatar}>
                  {testi.name.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <h4 className={styles.authorName}>{testi.name}</h4>
                  <p className={styles.authorRole}>{testi.role}</p>
                </div>
                
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
          </div>
          
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={scrollRight} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        {/* ── Dots ── */}
        <div className={styles.dotsContainer}>
          {testimonials.map((_, idx) => (
            <div 
              key={idx} 
              className={`${styles.dot} ${idx === activeIndex ? styles.activeDot : ''}`} 
              onClick={() => {
                if (scrollRef.current) {
                  const itemWidth = scrollRef.current.offsetWidth / 3;
                  scrollRef.current.scrollTo({ left: itemWidth * idx, behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}
