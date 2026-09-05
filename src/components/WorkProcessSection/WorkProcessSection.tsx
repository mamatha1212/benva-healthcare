'use client';
import React from 'react';
import styles from './WorkProcessSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

export default function WorkProcessSection() {


  const processes = [
    {
      id: '01',
      title: 'Choose Service',
      desc: 'Select the healthcare service you need.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 9 9 9 9z" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      id: '02',
      title: 'Submit Request',
      desc: 'Fill the enquiry form and submit your details.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M12 12h.01" />
          <path d="M17 12h.01" />
          <path d="M7 12h.01" />
        </svg>
      ),
    },
    {
      id: '03',
      title: 'Team Contacts You',
      desc: 'Our support team will contact you.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      id: '04',
      title: 'Confirmation',
      desc: 'Service availability will be confirmed.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      ),
    },
    {
      id: '05',
      title: 'Service Delivery',
      desc: 'Healthcare service provided via partner.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Simple Process</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <AnimatedHeading className={styles.heading}>How BENVA Healthcare Works</AnimatedHeading>
        </div>

        <div className={styles.processWrapper}>
          <div className={styles.connectingLine}></div>
          <div className={styles.grid}>
            {processes.map((proc, idx) => (
              <ScrollReveal key={proc.id} animation="fadeUp" delay={idx * 0.15}>
                <div className={styles.card}>
                  <div className={styles.bgNumber}>{proc.id}</div>
                  <div className={styles.iconWrapper}>
                    {proc.icon}
                  </div>
                  <div className={styles.textContent}>
                    <h3 className={styles.title}>{proc.title}</h3>
                    <p className={styles.desc}>{proc.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
