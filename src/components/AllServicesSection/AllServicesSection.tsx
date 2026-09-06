'use client';
import React from 'react';
import styles from './AllServicesSection.module.css';
import Link from 'next/link';

const services = [
  {
    id: 'health-packages',
    title: 'Full Body Health Checkup',
    description: 'Comprehensive health screening packages covering vitals, blood tests, and complete bodily functions for early detection.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    link: '/health-packages',
    color: '#02559d',
    bgColor: '#ebf8ff',
    span: 'col-span-2 md:col-span-1 lg:col-span-2'
  },
  {
    id: 'medicines',
    title: 'Pharmacy & Medicines',
    description: 'Order prescription medicines online with fast, reliable home delivery straight from trusted pharmacies.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    link: '/medicines',
    color: '#38a169',
    bgColor: '#f0fff4',
    span: 'col-span-2 md:col-span-1 lg:col-span-1'
  },
  // {
  //   id: 'home-healthcare',
  //   title: 'Home Healthcare',
  //   description: 'Professional nursing care, physiotherapy, and medical assistance provided in the comfort of your own home.',
  //   icon: (
  //     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //       <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  //       <polyline points="9 22 9 12 15 12 15 22" />
  //     </svg>
  //   ),
  //   link: '/home-healthcare',
  //   color: '#d69e2e',
  //   bgColor: '#fffff0',
  //   span: 'col-span-2 md:col-span-1 lg:col-span-1'
  // },
  {
    id: 'home-sample',
    title: 'Home Sample Collection',
    description: 'Skip the lab lines. Our trained phlebotomists will visit your home to safely collect your blood samples.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    link: '/health-packages',
    color: '#e53e3e',
    bgColor: '#fff5f5',
    span: 'col-span-2 md:col-span-1 lg:col-span-2'
  },
  {
    id: 'membership',
    title: 'Membership Cards',
    description: 'Unlock exclusive discounts, priority bookings, and free consultations with our premium family and individual cards.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    link: '/membership',
    color: '#805ad5',
    bgColor: '#faf5ff',
    span: 'col-span-2 md:col-span-1 lg:col-span-1'
  },
  {
    id: 'teleconsultation',
    title: 'Teleconsultation',
    description: 'Speak with highly qualified doctors instantly from your phone. Get expert medical advice anywhere, anytime.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    link: '/contact',
    color: '#00b5d8',
    bgColor: '#e6fffa',
    span: 'col-span-2 md:col-span-1 lg:col-span-1'
  },
  {
    id: 'diet-plan',
    title: 'Customized Diet Plans',
    description: 'Coming soon. Achieve your health goals with personalized nutrition plans tailored by expert dietitians.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7" />
        <path d="M15 7h6v6" />
      </svg>
    ),
    link: '/diet-plan',
    color: '#ed8936',
    bgColor: '#fffaf0',
    span: 'col-span-2 lg:col-span-3'
  }
];

export default function AllServicesSection() {
  return (
    <>
      {/* ── Hero Banner ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🏥 Comprehensive Care</span>
          <h1 className={styles.heroTitle}>
            All Our <span className={styles.heroAccent}>Services</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Explore our complete range of healthcare services designed to bring the hospital's excellence directly to you. Select a service to learn more or book an appointment.
          </p>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          
          {/* Bento Box Grid */}
          <div className={styles.bentoGrid}>
          {services.map((service, index) => (
            <Link 
              href={service.link} 
              key={service.id} 
              className={`${styles.card} ${styles[service.span.split(' ').pop() || '']}`}
              style={{ '--accent-color': service.color, '--bg-color': service.bgColor } as React.CSSProperties}
            >
              <div className={styles.cardInner}>
                <div className={styles.iconWrapper} style={{ color: service.color, backgroundColor: service.bgColor }}>
                  {service.icon}
                </div>
                
                <div className={styles.content}>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDesc}>{service.description}</p>
                </div>
                
                <div className={styles.arrow} style={{ color: service.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className={styles.glow} style={{ backgroundColor: service.color }} />
              <div className={styles.pattern} />
            </Link>
          ))}
        </div>

      </div>
      </section>
    </>
  );
}
