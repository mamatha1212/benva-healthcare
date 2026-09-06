'use client';

import React from 'react';
import pageStyles from './ContactPage.module.css';
import ContactForm from '@/components/ContactForm/ContactForm';

export default function ContactPage() {
  return (
    <div className={pageStyles.pageContainer}>

      {/* ── Hero Banner ── */}
      <section className={pageStyles.hero}>
        <div className={pageStyles.heroContent}>
          <span className={pageStyles.heroBadge}>📞 Get in Touch</span>
          <h1 className={pageStyles.heroTitle}>
            Contact <span className={pageStyles.heroAccent}>Us</span>
          </h1>
          <p className={pageStyles.heroSubtitle}>
            We're here to help! Reach out to us for appointments, inquiries, or any assistance you need.
          </p>
        </div>
        <div className={pageStyles.heroDecor}>
          <div className={pageStyles.circle1} />
          <div className={pageStyles.circle2} />
          <div className={pageStyles.circle3} />
        </div>
      </section>

      <div className={pageStyles.container}>
        <div className={pageStyles.grid}>

          {/* Left — Info Column */}
          <div className={pageStyles.infoCol}>
            <h3 className={pageStyles.colTitle}>Get in Touch</h3>
            <p className={pageStyles.colDesc}>Choose the best way to reach out to us.</p>

            <div className={pageStyles.infoList}>
              <div className={pageStyles.infoItem}>
                <div className={pageStyles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className={pageStyles.infoText}>
                  <h4>Call Us</h4>
                  <p>+91 9111145556</p>
                  <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                </div>
              </div>

              <div className={pageStyles.infoItem}>
                <div className={pageStyles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className={pageStyles.infoText}>
                  <h4>Email Us</h4>
                  <p>Benvahealthcaresupport@gmail.com</p>
                  <span>We'll reply within 24 hours</span>
                </div>
              </div>

              <div className={pageStyles.infoItem}>
                <div className={pageStyles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className={pageStyles.infoText}>
                  <h4>Visit Us</h4>
                  <p>Andhra Pradesh &amp; Telangana</p>
                  <span>HQ located in India</span>
                </div>
              </div>

              <div className={pageStyles.infoItem}>
                <div className={pageStyles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className={pageStyles.infoText}>
                  <h4>Working Hours</h4>
                  <p>Mon - Sat: 8:00 AM - 8:00 PM</p>
                  <span>Sunday: 9:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Exact same ContactForm used on home page */}
          <div className={pageStyles.formCol}>
            <ContactForm />
          </div>

        </div>
      </div>

    </div>
  );
}
