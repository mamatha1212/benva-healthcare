'use client';
import React from 'react';
import Image from 'next/image';
import styles from './EventsSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

const events = [
  {
    id: 1,
    title: "Give the blessings of your hun boa to children's",
    date: '24, Mar -2025',
    time: '10:00 AM – 2.00 PM',
    desc: 'Donatix is non-profit organization committed to improving lives through food, education,',
    image: '/images/event-1.jpg',
    author: {
      name: 'Parker Roben',
      role: 'Author',
      avatar: '/images/author-1.jpg',
    }
  },
  {
    id: 2,
    title: "Distribute your hun blessings to children's",
    date: '24, Mar -2025',
    time: '10:00 AM – 2.00 PM',
    desc: 'Donatix is non-profit organization committed to improving lives through food, education,',
    image: '/images/event-2.jpg',
    author: {
      name: 'Parker Roben',
      role: 'Author',
      avatar: '/images/author-1.jpg',
    }
  }
];

export default function EventsSection() {
  return (
    <section className={styles.section} id="events">
      {/* Background Watermark */}
      <div className={styles.bgWatermark} />

      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.taglineWrapper}>
              <div className={styles.lineLeft}>
                <div className={styles.line} />
                <div className={styles.diamond} />
              </div>
              <span className={styles.tagline}>Event & Program</span>
            </div>
            <AnimatedHeading className={styles.heading}>Take Part In Our Most Recent Events.</AnimatedHeading>
          </div>
          
          <div className={styles.headerRight}>
            <button className={styles.viewAllBtn}>
              View All Event 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Events Grid ── */}
        <div className={styles.grid}>
          {events.map((event) => (
            <div key={event.id} className={styles.card}>
              
              {/* Left: Image */}
              <div 
                className={styles.imageArea}
                style={{ backgroundImage: `url(${event.image}), linear-gradient(#e5e7eb, #9ca3af)` }}
              />

              {/* Right: Content */}
              <div className={styles.contentArea}>
                <h3 className={styles.title}>{event.title}</h3>
                
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {event.date}
                  </div>
                  <div className={styles.metaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {event.time}
                  </div>
                </div>

                <p className={styles.desc}>{event.desc}</p>
                
                <div className={styles.cardFooter}>
                  <a href="#" className={styles.detailsLink}>
                    Event Details 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>

                  <div className={styles.authorBox}>
                    <div 
                      className={styles.authorAvatar}
                      style={{ backgroundImage: `url(${event.author.avatar}), linear-gradient(#cbd5e1, #94a3b8)` }}
                    />
                    <div className={styles.authorInfo}>
                      <span className={styles.authorName}>{event.author.name}</span>
                      <span className={styles.authorRole}>{event.author.role}</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
