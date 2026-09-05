'use client';
import React, { useRef, useState } from 'react';
import styles from './TestimonialSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

const testimonials = [
  {
    id: 1,
    text: '"Booked a full body health checkup through BENVA Healthcare. The process was smooth and the home sample collection was very convenient."',
    name: 'Ramesh Kumar',
    role: 'Kakinada',
    image: 'https://i.pravatar.cc/150?u=ramesh',
  },
  {
    id: 2,
    text: '"The support team responded quickly and helped us with healthcare services for my parents. Good experience overall."',
    name: 'Lakshmi Devi',
    role: 'Rajahmundry',
    image: 'https://i.pravatar.cc/150?u=lakshmi',
  },
  {
    id: 3,
    text: '"Easy booking process and professional support throughout the service. Highly satisfied."',
    name: 'Srinivas Rao',
    role: 'Amalapuram',
    image: 'https://i.pravatar.cc/150?u=srinivas',
  },
  {
    id: 4,
    text: '"The medicine assistance process was simple and the team guided us clearly."',
    name: 'Priya',
    role: 'Hyderabad',
    image: 'https://i.pravatar.cc/150?u=priya',
  },
  {
    id: 5,
    text: '"Very helpful healthcare support team and easy service booking process."',
    name: 'Venkatesh',
    role: 'Vijayawada',
    image: 'https://i.pravatar.cc/150?u=venkatesh',
  },
];

export default function TestimonialSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPos = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.offsetWidth / (window.innerWidth < 1024 ? (window.innerWidth < 640 ? 1 : 2) : 3);
      const newIndex = Math.round(scrollPos / itemWidth);
      if (newIndex >= 0 && newIndex < testimonials.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToTestimonial = (index: number) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.offsetWidth / (window.innerWidth < 1024 ? (window.innerWidth < 640 ? 1 : 2) : 3);
      scrollRef.current.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  return (
    <section className={styles.section} id="testimonial">
      <div className={styles.container}>
        
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Experiences Shared By Our Customers</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <AnimatedHeading className={styles.heading}>What Our Customers Say</AnimatedHeading>
        </div>

        {/* ── Content Slider ── */}
        <div className={styles.sliderContainer}>
          <div className={styles.grid} ref={scrollRef} onScroll={handleScroll}>
            {testimonials.map((testi, idx) => (
              <ScrollReveal key={testi.id} animation="fadeRight" delay={idx * 0.1} className={styles.cardWrapper}>
                <div className={styles.card}>
                  <div className={styles.quoteIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 11v5a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-5l2-5h4l-2 5h4zM22 11v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-5l2-5h4l-2 5h4z"/>
                    </svg>
                  </div>
                  <p className={styles.quoteText}>{testi.text}</p>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{testi.name}</h4>
                      <p className={styles.authorRole}>{testi.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ── Photo Pills Navigation ── */}
        <ScrollReveal animation="fadeUp" delay={0.4}>
          <div className={styles.thumbnailList}>
            {testimonials.map((testi, idx) => (
              <div 
                key={testi.id} 
                className={`${styles.thumbnailCard} ${idx === activeIndex ? styles.activeThumbnail : ''}`}
                onClick={() => scrollToTestimonial(idx)}
              >
                <div className={styles.thumbAvatar}>
                  <img src={testi.image} alt={testi.name} className={styles.avatarImg} />
                </div>
                <div className={styles.thumbInfo}>
                  <h4 className={styles.thumbName}>{testi.name}</h4>
                  <p className={styles.thumbRole}>{testi.role}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
