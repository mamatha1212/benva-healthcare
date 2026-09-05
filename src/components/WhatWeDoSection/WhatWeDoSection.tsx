'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './WhatWeDoSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

const services = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 10l-3 3M30 10l3 3M18 38l-3-3M30 38l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Full Body Health Checkup',
    desc: 'Discover how your everyday habits impact your health with our comprehensive screening packages.',
    tag: 'START @ ₹1599',
    buttonText: 'Book Now',
    buttonAction: () => window.dispatchEvent(new Event('openBookingModal')),
    bgColor: '#fff1ec',
    accentColor: '#f97316'
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <path d="M8 36h32M12 36V22a4 4 0 014-4h16a4 4 0 014 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 22v-6a4 4 0 018 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 28h4M28 28h4M16 32h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Order Medicines',
    desc: 'Upload your doctor\'s prescription and get authentic medicines delivered to your doorstep.',
    tag: 'FLAT 15% OFF',
    buttonText: 'Order Now',
    buttonAction: () => {
      const msg = encodeURIComponent("Hello BENVA Healthcare, I would like to share my prescription to order medicines.");
      window.open(`https://wa.me/919111145556?text=${msg}`, '_blank');
    },
    bgColor: '#f0f9ff',
    accentColor: '#0284c7'
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <circle cx="17" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="31" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 38c0-6.627 4.925-12 11-12h14c6.075 0 11 5.373 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 20v8M20 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Membership Card',
    desc: 'Access exclusive healthcare benefits, massive discounts, and priority support.',
    tag: 'JOIN THE CLUB',
    buttonText: 'Apply Now',
    buttonAction: () => window.dispatchEvent(new Event('openBookingModal')),
    bgColor: '#faf5ff',
    accentColor: '#9333ea'
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <path d="M24 6C15.163 6 8 13.163 8 22c0 5.637 2.831 10.608 7.151 13.633L14 42h20l-1.151-6.367C37.169 32.608 40 27.637 40 22c0-8.837-7.163-16-16-16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 42h12M20 22h8M24 18v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Home Sample Collection',
    desc: 'Book safe and hygienic laboratory sample collections from the comfort of your home.',
    tag: 'FREE COLLECTION',
    buttonText: 'Book Collection',
    buttonAction: () => window.dispatchEvent(new Event('openBookingModal')),
    bgColor: '#fef2f2',
    accentColor: '#dc2626'
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <path d="M24 6c-5 0-16 8-16 22 0 8 7 14 16 14s16-6 16-14C40 14 29 6 24 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 18v12M18 24h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Teleconsultation',
    desc: 'Connect instantly with highly qualified doctors for healthcare guidance and consultation.',
    tag: '24/7 AVAILABLE',
    buttonText: 'Request Consult',
    buttonAction: () => window.dispatchEvent(new Event('openBookingModal')),
    bgColor: '#f0fdf4',
    accentColor: '#16a34a'
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Home Healthcare',
    desc: 'Professional nurses, elder care, and physiotherapy support services delivered at your home.',
    tag: 'EXPERT CARE',
    buttonText: 'Book Service',
    buttonAction: () => window.dispatchEvent(new Event('openBookingModal')),
    bgColor: '#fffbeb',
    accentColor: '#d97706'
  },
];

export default function WhatWeDoSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % services.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const activeService = services[activeIndex];

  return (
    <section className={styles.section} id="services">
      <div className={styles.container}>
        <div className={styles.header}>
          <AnimatedHeading as="h2" className={styles.heading}>Our Healthcare Services</AnimatedHeading>
        </div>

        <div className={styles.sliderContainer}>
          <button className={styles.navBtn} onClick={prevSlide} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <ScrollReveal animation="fadeUp" duration={0.8} style={{ width: '100%' }}>
            <div className={styles.bannerWrapper}>
            {services.map((svc, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  className={`${styles.bannerSlide} ${isActive ? styles.activeSlide : ''}`}
                  style={{ backgroundColor: svc.bgColor }}
                >
                  <div className={styles.contentSide}>
                    <h3 className={styles.title}>{svc.title}</h3>
                    <p className={styles.desc}>{svc.desc}</p>
                    <div className={styles.tagWrap} style={{ color: svc.accentColor }}>
                      {svc.tag}
                    </div>
                    <button 
                      className={styles.ctaBtn} 
                      style={{ backgroundColor: svc.accentColor }}
                      onClick={svc.buttonAction}
                    >
                      {svc.buttonText}
                    </button>
                  </div>
                  <div className={styles.imageSide}>
                    <div className={styles.iconGlow} style={{ color: svc.accentColor }}>
                      {svc.icon}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </ScrollReveal>

          <button className={styles.navBtn} onClick={nextSlide} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div className={styles.dots}>
          {services.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => {
                if (!isAnimating && i !== activeIndex) {
                  setIsAnimating(true);
                  setActiveIndex(i);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
