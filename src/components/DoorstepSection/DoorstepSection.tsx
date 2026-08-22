'use client';
import React from 'react';
import styles from './DoorstepSection.module.css';

const cities = [
  'Visakhapatnam',
  'Vijayawada',
  'Guntur',
  'Rajahmundry',
  'Tirupati',
  'Warangal',
  'Karimnagar',
  'Nizamabad',
  'Nellore',
  'Kurnool',
  'Khammam',
  'Eluru',
  'Anantapur'
];

export default function DoorstepSection() {
  return (
    <section className={styles.section} id="doorstep">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>
            <span className={styles.pinIcon}>📍</span>
            Doorstep Phlebotomy Service Across Andhra Pradesh & Telangana
          </h2>
          <p className={styles.subtitle}>
            Certified home sample collection technicians available across all major cities & districts
          </p>
        </div>
      </div>

      {/* Cities Marquee / Grid */}
      <div className={styles.citiesWrapper}>
        <div className={styles.citiesList}>
          {/* Double the list for seamless infinite scroll */}
          {[...cities, ...cities].map((city, index) => (
            <div key={index} className={styles.cityPill}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.cityIcon}>
                <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6" />
              </svg>
              {city}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
