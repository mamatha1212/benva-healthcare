'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './WhatWeDoSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

const baseServices = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 10l-3 3M30 10l3 3M18 38l-3-3M30 38l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Full Body Health Checkup',
    desc: 'Comprehensive health screening packages with home sample collection and digital reports.',
    highlights: ['72+ Tests', 'Home Sample Collection', 'Digital Reports', 'Doctor Guidance'],
    buttonText: 'Book Now',
    buttonAction: () => {
      window.dispatchEvent(new Event('openBookingModal'));
    }
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M8 36h32M12 36V22a4 4 0 014-4h16a4 4 0 014 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 22v-6a4 4 0 018 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 28h4M28 28h4M16 32h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Order Medicines',
    desc: "Upload your doctor's prescription and get assistance through our partner pharmacy network.",
    highlights: ['Prescription Based Support', 'Partner Pharmacies', 'Easy Ordering', 'Quick Assistance'],
    buttonText: 'Order Now',
    buttonAction: () => window.open('https://wa.me/919876543210', '_blank')
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <circle cx="17" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="31" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 38c0-6.627 4.925-12 11-12h14c6.075 0 11 5.373 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 20v8M20 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Membership Card',
    desc: 'Access healthcare benefits, discounts and priority support through BENVA Membership.',
    highlights: ['Lab Discounts', 'Healthcare Benefits', 'Priority Support', 'Easy Registration'],
    buttonText: 'Apply Now',
    buttonAction: () => {
      window.dispatchEvent(new Event('openBookingModal'));
    }
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 6C15.163 6 8 13.163 8 22c0 5.637 2.831 10.608 7.151 13.633L14 42h20l-1.151-6.367C37.169 32.608 40 27.637 40 22c0-8.837-7.163-16-16-16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 42h12M20 22h8M24 18v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Home Sample Collection',
    desc: 'Book laboratory sample collection from the comfort of your home.',
    highlights: ['At Home Collection', 'Trained Professionals', 'Safe Process', 'Convenient Service'],
    buttonText: 'Book Collection',
    buttonAction: () => {
      window.dispatchEvent(new Event('openBookingModal'));
    }
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 6c-5 0-16 8-16 22 0 8 7 14 16 14s16-6 16-14C40 14 29 6 24 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 18v12M18 24h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Teleconsultation',
    desc: 'Connect with qualified doctors for healthcare guidance and consultation.',
    highlights: ['Qualified Doctors', 'Easy Booking', 'Online Consultation', 'Healthcare Guidance'],
    buttonText: 'Request Consultation',
    buttonAction: () => {
      window.dispatchEvent(new Event('openBookingModal'));
    }
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Home Healthcare Services',
    desc: 'Professional healthcare support services delivered at your home.',
    highlights: ['Nurse Visit', 'Elder Care', 'Physiotherapy', 'Attender Services'],
    buttonText: 'Book Service',
    buttonAction: () => {
      window.dispatchEvent(new Event('openBookingModal'));
    }
  },
];

const realServices = baseServices.map((svc, i) => ({
  ...svc,
  id: i + 1,
}));

// Append 3 clones to the end to allow smooth scrolling past the 6th item (assuming 3 per row)
const sliderItems = [...realServices, ...realServices.slice(0, 3)].map((svc, i) => ({
  ...svc,
  uniqueKey: i,
}));

export default function WhatWeDoSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => {
    setActiveIndex((prev) => prev + 1);
  }, []);

  // Auto-advance every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        scrollRef.current.scrollTo({
          left: activeElement.offsetLeft,
          behavior: 'smooth'
        });
      }

      // Infinite loop seamless reset at index 6
      if (activeIndex === 6) {
        const timeoutId = setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              left: 0,
              behavior: 'auto' // Instant snap
            });
            setActiveIndex(0);
          }
        }, 600); // Wait for the smooth scroll animation to finish
        return () => clearTimeout(timeoutId);
      }
    }
  }, [activeIndex]);

  return (
    <section className={styles.section} id="what-we-do">
      {/* Section pattern background */}
      <div
        className={styles.pattern}
        style={{ backgroundImage: 'url(/images/feature-v1-pattern2.png)' }}
      />

      {/* Decorative medical top-left */}
      <div className={styles.medicalDecorTopLeft}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Large Pill */}
          <path d="M50 130 L110 70 A 25 25 0 1 1 145 105 L85 165 A 25 25 0 1 1 50 130 Z" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M70 90 L125 145" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Small Pill */}
          <path d="M130 30 L170 70 A 15 15 0 1 0 190 50 L150 10 A 15 15 0 1 0 130 30 Z" stroke="var(--color-secondary, #4a5568)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M140 40 L160 60" stroke="var(--color-secondary, #4a5568)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Medical Cross */}
          <path d="M30 40 h20 v-20 h20 v20 h20 v20 h-20 v20 h-20 v-20 h-20 z" stroke="var(--color-primary)" strokeWidth="5" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Decorative medical bottom-right */}
      <div className={styles.medicalDecor}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Large Pill */}
          <path d="M50 130 L110 70 A 25 25 0 1 1 145 105 L85 165 A 25 25 0 1 1 50 130 Z" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M70 90 L125 145" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Small Pill */}
          <path d="M130 30 L170 70 A 15 15 0 1 0 190 50 L150 10 A 15 15 0 1 0 130 30 Z" stroke="var(--color-secondary, #4a5568)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M140 40 L160 60" stroke="var(--color-secondary, #4a5568)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Medical Cross */}
          <path d="M30 40 h20 v-20 h20 v20 h20 v20 h-20 v20 h-20 v-20 h-20 z" stroke="var(--color-primary)" strokeWidth="5" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.tagline}>
            {/* Left arrows */}
            <span className={styles.taglineDeco}>
              <span className={styles.taglineDot} />
              <svg width="44" height="10" viewBox="0 0 44 10"><line x1="44" y1="5" x2="10" y2="5" stroke="var(--color-primary)" strokeWidth="2"/><polyline points="18,1 8,5 18,9" stroke="var(--color-primary)" strokeWidth="2" fill="none"/></svg>
            </span>
            <span className={styles.taglineText}>Our Services</span>
            {/* Right arrows */}
            <span className={styles.taglineDeco}>
              <svg width="44" height="10" viewBox="0 0 44 10"><line x1="0" y1="5" x2="34" y2="5" stroke="var(--color-primary)" strokeWidth="2"/><polyline points="26,1 36,5 26,9" stroke="var(--color-primary)" strokeWidth="2" fill="none"/></svg>
              <span className={styles.taglineDot} />
            </span>
          </div>
          <AnimatedHeading className={styles.heading}>
            Our Healthcare Services
          </AnimatedHeading>
        </div>

        {/* ── Cards ── */}
        <div className={styles.cardsWrapper} ref={scrollRef}>
          {sliderItems.map((svc, i) => (
            <div
              key={svc.uniqueKey}
              className={`${styles.card} ${i === activeIndex ? styles.cardActive : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <div className={styles.iconBox}>
                {svc.icon}
              </div>
              <h3 className={styles.cardTitle}>{svc.title}</h3>
              <div className={styles.cardTitleLine} />
              <p className={styles.cardDesc}>{svc.desc}</p>
              
              <ul className={styles.highlights}>
                {svc.highlights.map((hlt, idx) => (
                  <li key={idx}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--color-primary)" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{hlt}</span>
                  </li>
                ))}
              </ul>

              <button className={styles.actionBtn} onClick={(e) => {
                e.stopPropagation();
                svc.buttonAction();
              }}>
                {svc.buttonText}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </button>

              {/* Active card floating dot */}
              {i === activeIndex && <div className={styles.activeDot} />}
            </div>
          ))}
        </div>

        {/* ── Dots ── */}
        <div className={styles.dots}>
          {realServices.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === (activeIndex % 6) ? styles.dotActive : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
