'use client';

import React, { useState } from 'react';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          message: formData.message
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ fullName: '', mobile: '', email: '', message: '' });
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Something went wrong.'}`);
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>📞 Get in Touch</span>
          <h1 className={styles.heroTitle}>
            Contact <span className={styles.heroAccent}>Us</span>
          </h1>
          <p className={styles.heroSubtitle}>
            We're here to help! Reach out to us for appointments, inquiries, or any assistance you need.
          </p>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.grid}>
          
          {/* Info Column (Left) */}
          <div className={styles.infoCol}>
            <h3 className={styles.colTitle}>Get in Touch</h3>
            <p className={styles.colDesc}>Choose the best way to reach out to us.</p>
            
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <h4>Call Us</h4>
                  <p>+91 9111145556</p>
                  <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <h4>Email Us</h4>
                  <p>Benvahealthcaresupport@gmail.com</p>
                  <span>We'll reply within 24 hours</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <h4>Visit Us</h4>
                  <p>Andhra Pradesh & Telangana</p>
                  <span>HQ located in India</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <h4>Working Hours</h4>
                  <p>Mon - Sat: 8:00 AM - 8:00 PM</p>
                  <span>Sunday: 9:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column (Right) */}
          <div className={styles.formCol}>
            {status === 'success' ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>✓</div>
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for reaching out. We will get back to you shortly.</p>
                <button className={styles.btnPrimary} onClick={() => setStatus('idle')}>Send Another Message</button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <h3 className={styles.colTitle} style={{ color: '#0f172a' }}>Send Us a Message</h3>
                <p className={styles.colDesc}>Please fill out the form and our team will get back to you shortly.</p>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      required
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Message</label>
                  <textarea
                    placeholder="Type your message here..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className={styles.formFooter}>
                  <button type="submit" className={styles.btnPrimary} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                  <p className={styles.privacyNote}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Your information is safe with us.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
