'use client';
import React, { useState } from 'react';
import styles from './ServiceAreasSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import AvailabilityFormModal from './AvailabilityFormModal';

export default function ServiceAreasSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apLocations = [
    'Kakinada', 'Rajahmundry', 'Amalapuram', 
    'Ramachandrapuram', 'Visakhapatnam', 
    'Vijayawada', 'Guntur', 'Tirupati'
  ];

  const tsLocations = [
    'Hyderabad', 'Warangal', 'Karimnagar', 
    'Nizamabad', 'Khammam'
  ];

  const trustHighlights = [
    'Andhra Pradesh Coverage',
    'Telangana Coverage',
    'Partner Healthcare Network',
    'Dedicated Support Team'
  ];

  return (
    <section className={styles.section} id="service-areas">
      {/* Background Decor */}
      <div className={styles.bgElements}>
        {/* Globe/Map (Teal) */}
        <svg className={`${styles.bgElement} ${styles.bgElement1} ${styles.bgTeal}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.92-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
        </svg>

        {/* Location Marker (Orange) */}
        <svg className={`${styles.bgElement} ${styles.bgElement2} ${styles.bgOrange}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>

        {/* Compass / Navigation (Blue) */}
        <svg className={`${styles.bgElement} ${styles.bgElement3} ${styles.bgBlue}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.07 14.1L8.53 17.53c-.35.15-.75.05-.98-.27-.24-.31-.22-.76.04-1.05l5.54-6.27 1.29-.44c.33-.11.69.04.85.34.17.3.1.68-.15.9l-3.05 5.36zm-3.05-6.73L9.61 8.8c-.28-.15-.62-.06-.81.2-.18.27-.11.63.15.82l1.65.92-.12-.22z"/>
        </svg>
      </div>

      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <AnimatedHeading className={styles.title}>Service Areas</AnimatedHeading>
          <p className={styles.subtitle}>Currently Serving Andhra Pradesh & Telangana Through Our Healthcare Partner Network.</p>
          <p className={styles.smallContent}>
            BENVA Healthcare services are available across selected locations in Andhra Pradesh and Telangana through our partner laboratories, pharmacies and healthcare service providers.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className={styles.contentLayout}>
          
          {/* Left Column: Locations */}
          <div className={styles.locationsCol}>
            
            {/* AP Card */}
            <div className={styles.stateCard}>
              <div className={styles.stateHeader}>
                <div className={styles.stateIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className={styles.stateTitle}>Andhra Pradesh</h3>
              </div>
              <p className={styles.stateSubtitle}>Major Service Locations</p>
              <div className={styles.locationList}>
                {apLocations.map((loc, idx) => (
                  <div key={idx} className={styles.locationItem}>
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{loc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TS Card */}
            <div className={styles.stateCard}>
              <div className={styles.stateHeader}>
                <div className={styles.stateIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className={styles.stateTitle}>Telangana</h3>
              </div>
              <p className={styles.stateSubtitle}>Major Service Locations</p>
              <div className={styles.locationList}>
                {tsLocations.map((loc, idx) => (
                  <div key={idx} className={styles.locationItem}>
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{loc}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className={styles.coverageNote}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Service availability may vary depending on the selected healthcare service and location.
            </p>

          </div>

          {/* Right Column: CTA & Trust Box */}
          <div className={styles.ctaCol}>
            
            <div className={styles.checkAreaBox}>
              <div className={styles.pulseIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className={styles.boxTitle}>Not Sure If We Serve Your Area?</h3>
              <p className={styles.boxDesc}>Submit Your Details And Our Team Will Assist You.</p>
              <button className={styles.checkBtn} onClick={() => setIsModalOpen(true)}>
                Check Availability
              </button>
            </div>

            <div className={styles.trustBox}>
              {trustHighlights.map((highlight, idx) => (
                <div key={idx} className={styles.trustItem}>
                  <svg className={styles.trustCheck} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      <AvailabilityFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
