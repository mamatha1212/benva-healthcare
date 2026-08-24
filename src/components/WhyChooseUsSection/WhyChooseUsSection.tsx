'use client';

import React from 'react';
import styles from './WhyChooseUsSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

export default function WhyChooseUsSection() {
  const cards = [
    {
      title: 'Trusted Partner Network',
      description: 'Access healthcare services through trusted laboratories, pharmacies and healthcare providers.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      title: 'Home Sample Collection',
      description: 'Convenient sample collection from your home.',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      title: 'Qualified Professionals',
      description: 'Healthcare support through qualified professionals and partner providers.',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    },
    {
      title: 'Easy Booking Process',
      description: 'Simple enquiry and booking process.',
      icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'
    },
    {
      title: 'Fast Support',
      description: 'Dedicated support for healthcare service requests.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      title: 'Healthcare At Your Convenience',
      description: 'Access healthcare services without unnecessary travel.',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  ];

  const highlights = [
    'Trusted Partner Labs',
    'Partner Pharmacies',
    'Healthcare Professionals',
    'Dedicated Support Team',
    'Home Healthcare Services',
    'AP & Telangana Coverage'
  ];

  const handleExplore = () => {
    const element = document.getElementById('services-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.section}>
      {/* Section pattern background */}
      <div
        className={styles.pattern}
        style={{ backgroundImage: 'url(/images/feature-v1-pattern2.png)' }}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <AnimatedHeading className={styles.title}>Why Choose BENVA Healthcare</AnimatedHeading>
          <p className={styles.subtitle}>Reliable Healthcare Services Through Trusted Healthcare Partners.</p>
        </div>

        <div className={styles.contentWrapper}>
          
          <div className={styles.cardsGrid}>
            {cards.map((card, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={card.icon} />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDesc}>{card.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.sidebarBox}>
            <div className={styles.highlightsContainer}>
              {highlights.map((highlight, index) => (
                <div key={index} className={styles.highlightRow}>
                  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className={styles.highlightText}>{highlight}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider}></div>

            <p className={styles.sidebarDesc}>
              BENVA Healthcare simplifies access to healthcare services by connecting patients with trusted healthcare partners through a single platform.
            </p>

            <button className={styles.exploreBtn} onClick={handleExplore}>
              Explore Services
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
