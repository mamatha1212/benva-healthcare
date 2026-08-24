'use client';
import React from 'react';
import styles from './HomeHealthcareSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

export default function HomeHealthcareSection() {
  const checkIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );

  const services = [
    {
      title: "BP Check At Home",
      desc: "Regular Blood Pressure Monitoring",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      title: "Sugar Check At Home",
      desc: "Blood Sugar Monitoring Support",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="21.17" y1="8" x2="12" y2="8"></line>
          <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
          <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
        </svg>
      )
    },
    {
      title: "Nurse Visit",
      desc: "Qualified Nursing Support",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <line x1="12" y1="13" x2="12" y2="17"></line>
          <line x1="10" y1="15" x2="14" y2="15"></line>
        </svg>
      )
    },
    {
      title: "Physiotherapy",
      desc: "Physiotherapy Support At Home",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3"></circle>
          <line x1="12" y1="22" x2="12" y2="8"></line>
          <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
        </svg>
      )
    },
    {
      title: "Elder Care Services",
      desc: "Support For Senior Citizens",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      title: "Attender Services",
      desc: "Patient Care Assistance",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      title: "Doctor Home Visit",
      desc: "Subject To Availability",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];

  return (
    <section className={styles.section} id="home-healthcare">
      <div className={styles.container}>
        
        <div className={styles.header}>
          <AnimatedHeading className={styles.heading}>Home Healthcare Services</AnimatedHeading>
          <p className={styles.subHeading}>Professional Healthcare Support Delivered At Your Doorstep.</p>
          <p className={styles.description}>BENVA Healthcare helps connect patients with qualified healthcare professionals for home-based healthcare support through our partner network.</p>
        </div>

        <div className={styles.contentGrid}>
          
          {/* ── Left Image ── */}
          <div className={styles.imageArea}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/home-healthcare.png" alt="Home Healthcare" className={styles.mainImage} />
            
            <div className={styles.noteBox}>
              <div className={styles.noteIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <span className={styles.noteText}>Services Availability May Vary By Location.</span>
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className={styles.servicesWrapper}>
            
            <div className={styles.servicesGrid}>
              {services.map((service, idx) => (
                <div key={idx} className={styles.serviceCard}>
                  <div className={styles.serviceIconWrapper}>
                    {service.icon}
                  </div>
                  <div>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                    <p className={styles.serviceDesc}>{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.benefitsRow}>
              <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> At Home Convenience</div>
              <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Qualified Professionals</div>
              <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Easy Scheduling</div>
              <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Dedicated Support</div>
            </div>

            <button 
              className={styles.bookBtn} 
              onClick={() => window.dispatchEvent(new Event('openHomeCareModal'))}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Book Home Healthcare Service
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}
