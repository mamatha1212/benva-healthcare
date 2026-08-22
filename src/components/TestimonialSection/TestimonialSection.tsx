'use client';
import React, { useState, useEffect } from 'react';
import styles from './TestimonialSection.module.css';

const testimonials = [
  {
    id: 1,
    mainImage: '/images/testimonial-v2-img1.jpg',
    thumbImage: '/images/testimonial-v2-img1.jpg',
    rating: '4.9',
    text: '"Stay informed about our upcoming events and campaigns. Whether it\'s a fundraising gala, a charity run, or a community outreach program, there are plenty of ways to get involved and support our cause. Check our event calendar for details. We prioritize your security. Our donation process uses the latest encryption technology to protect your personal and financial information. Donate with confidence knowing"',
    name: 'Daniel Thomas',
    role: 'CEO, Founder',
    stars: 5,
  },
  {
    id: 2,
    mainImage: '/images/testimonial-v2-img2.jpg',
    thumbImage: '/images/testimonial-v2-img2.jpg',
    rating: '5.0',
    text: '"The dedication and passion of this organization are truly inspiring. I have been volunteering here for years, and the impact we make in the community is visible every single day. Their transparent approach and heartfelt initiatives make them one of the most reliable charities I have ever worked with."',
    name: 'Sarah Jenkins',
    role: 'Community Leader',
    stars: 5,
  },
  {
    id: 3,
    mainImage: '/images/testimonial-v2-img3.jpg',
    thumbImage: '/images/testimonial-v2-img3.jpg',
    rating: '4.8',
    text: '"Partnering with Benva Healthcare has been a game changer for our corporate social responsibility goals. The team is incredibly professional and deeply committed to their mission. They ensure that every dollar is maximized for the greatest possible impact on those who need it most."',
    name: 'Michael Chen',
    role: 'Corporate Partner',
    stars: 4,
  },
  {
    id: 4,
    mainImage: '/images/testimonial-v2-img4.jpg',
    thumbImage: '/images/testimonial-v2-img4.jpg',
    rating: '4.9',
    text: '"A wonderful organization doing incredible work. From providing clean water to building educational facilities, their projects are well-planned and highly effective. I highly encourage anyone looking to make a real difference to support their ongoing campaigns."',
    name: 'Emily Watson',
    role: 'Philanthropist',
    stars: 5,
  },
];

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeTesti = testimonials[activeIndex];

  return (
    <section className={styles.section} id="testimonial">
      {/* World Map Background */}
      <div className={styles.mapBg} />

      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Our Testimonial</span>
          </div>
          <h2 className={styles.heading}>Our Trusted Clients<br/>Feedback</h2>
        </div>

        {/* ── Content Grid ── */}
        <div className={styles.grid}>
          
          {/* Left Column: Images */}
          <div className={styles.leftCol}>
            {/* Main Image */}
            <div className={styles.mainImageWrapper}>
              <div 
                key={activeTesti.id}
                className={styles.mainImage}
                style={{ 
                  backgroundImage: `url(${activeTesti.mainImage}), linear-gradient(#e5e7eb, #d1d5db)` 
                }}
              />
              
              {/* Rating Badge */}
              <div className={styles.ratingBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff6b3d">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{activeTesti.rating}</span>
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className={styles.thumbnailsRow}>
              {testimonials.map((testi, idx) => (
                <div 
                  key={testi.id}
                  className={`${styles.thumbWrapper} ${idx === activeIndex ? styles.thumbActive : ''}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div 
                    className={styles.thumbImage}
                    style={{ 
                      backgroundImage: `url(${testi.thumbImage}), linear-gradient(#e5e7eb, #d1d5db)` 
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Text */}
          <div className={styles.rightCol}>
            {/* Floating Ring Decor */}
            <div className={styles.floatingRing} />
            
            <div key={activeTesti.id} className={styles.textContent}>
              <p className={styles.quoteText}>{activeTesti.text}</p>
              
              <div className={styles.authorInfo}>
                <h4 className={styles.authorName}>{activeTesti.name}</h4>
                <p className={styles.authorRole}>{activeTesti.role}</p>
                
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < activeTesti.stars ? '#ff6b3d' : '#cbd5e1'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>

              {/* Large Quote Icon */}
              <div className={styles.quoteIcon}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
                  <path d="M10 11v5a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-5l2-5h4l-2 5h4zM22 11v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-5l2-5h4l-2 5h4z"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
