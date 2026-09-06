'use client';
import React, { useState } from 'react';
import styles from './ContactSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';

export default function ContactSection() {
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
    <section className={styles.section} id="contact">
      {/* Background Decor */}
      <div className={styles.bgElements}>
        {/* Hospital Building (Light Blue) */}
        <svg className={`${styles.bgElement} ${styles.bgElement1} ${styles.bgBlue}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v16h18V5c0-1.1-.9-2-2-2zM9 13H7v-2h2v2zm0-4H7V7h2v2zm4 4h-2v-2h2v2zm0-4h-2V7h2v2zm4 4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
          <path d="M11 17h2v4h-2z" fill="var(--color-primary)"/>
        </svg>

        {/* Medical Cross (Red) */}
        <svg className={`${styles.bgElement} ${styles.bgElement2} ${styles.bgRed}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>

        {/* Stethoscope (Light Blue) */}
        <svg className={`${styles.bgElement} ${styles.bgElement3} ${styles.bgBlue}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M8 2a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H8zm1 14.73V19a3 3 0 1 1-6 0v-4H1v4a5 5 0 1 0 10 0v-2.27a3 3 0 0 0 1-5.73V5a1 1 0 0 0-1-1h-2V2h2a3 3 0 0 1 3 3v6c0 .48-.11.93-.3 1.34A5.001 5.001 0 0 1 20.89 17h-1.88a3.003 3.003 0 0 0-5.01-2.27z" />
        </svg>

        {/* Support / Enquiry Bubble (Red) */}
        <svg className={`${styles.bgElement} ${styles.bgElement4} ${styles.bgRed}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6v-2h12v2zm0-3H6V7h12v2z" />
        </svg>
      </div>

      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Get In Touch</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <AnimatedHeading className={styles.heading}>Our Healthcare Team Is Here To Assist You.</AnimatedHeading>
        </div>

        {/* Fused Card Layout */}
        <div className={styles.contactWrapper}>
          
          {/* Left Column: Contact Info */}
          <div className={styles.infoCol}>
            <div className={styles.infoContent}>
              <h3 className={styles.infoMainTitle}>Contact Information</h3>
              <p className={styles.infoMainDesc}>Fill out the form and our team will get back to you within 24 hours.</p>
              
              <div className={styles.cardGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.iconBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className={styles.infoTextWrapper}>
                    <h4 className={styles.infoTitle}>Call Us</h4>
                    <p className={styles.infoText}>+91 9111145556</p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.iconBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div className={styles.infoTextWrapper}>
                    <h4 className={styles.infoTitle}>WhatsApp</h4>
                    <p className={styles.infoText}>+91 9111145556</p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.iconBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className={styles.infoTextWrapper}>
                    <h4 className={styles.infoTitle}>Email</h4>
                    <p className={styles.infoText}>Benvahealthcaresupport@gmail.com</p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.iconBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className={styles.infoTextWrapper}>
                    <h4 className={styles.infoTitle}>Service Areas</h4>
                    <p className={styles.infoText}>Andhra Pradesh & Telangana</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className={styles.formCol}>
            <div className={styles.formWrapper}>
              
              {status === 'success' ? (
                <div className={styles.successState}>
                  <div className={styles.successIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </div>
                  <h3 className={styles.successTitle}>Thank You For Contacting BENVA Healthcare.</h3>
                  <p className={styles.successDesc}>Our Team Will Get Back To You Shortly.</p>
                  <button className={styles.resetBtn} onClick={() => setStatus('idle')}>Send Another Message</button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <h3 className={styles.formTitle}>Send a Message</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        className={styles.input}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        className={styles.input}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      className={styles.input}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Message *</label>
                    <textarea
                      required
                      placeholder="How can we help you?"
                      className={styles.textarea}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <div className={styles.formFooter}>
                    <button 
                      type="submit" 
                      className={styles.submitBtn} 
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Sending...' : 'Send Message'}
                    </button>
                    <span className={styles.privacyNote}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Your information is safe with us.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
