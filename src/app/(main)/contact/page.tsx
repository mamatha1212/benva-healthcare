'use client';

import React, { useState } from 'react';
import pageStyles from './ContactPage.module.css';
import formStyles from '@/components/ContactSection/ContactSection.module.css';

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
          message: formData.message,
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

          {/* Left — Info Column (from contact page design) */}
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

          {/* Right — Form Column (exact same form as home page ContactSection) */}
          <div className={pageStyles.formCol}>
            <div className={formStyles.formWrapper}>
              {status === 'success' ? (
                <div className={formStyles.successState}>
                  <div className={formStyles.successIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </div>
                  <h3 className={formStyles.successTitle}>Thank You For Contacting BENVA Healthcare.</h3>
                  <p className={formStyles.successDesc}>Our Team Will Get Back To You Shortly.</p>
                  <button className={formStyles.resetBtn} onClick={() => setStatus('idle')}>Send Another Message</button>
                </div>
              ) : (
                <form className={formStyles.form} onSubmit={handleSubmit}>
                  <h3 className={formStyles.formTitle}>Send a Message</h3>

                  <div className={formStyles.formRow}>
                    <div className={formStyles.formGroup}>
                      <label className={formStyles.label}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        className={formStyles.input}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className={formStyles.label}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        className={formStyles.input}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={formStyles.formGroup}>
                    <label className={formStyles.label}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      className={formStyles.input}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={formStyles.formGroup}>
                    <label className={formStyles.label}>Message *</label>
                    <textarea
                      required
                      placeholder="How can we help you?"
                      className={formStyles.textarea}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <div className={formStyles.formFooter}>
                    <button
                      type="submit"
                      className={formStyles.submitBtn}
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Sending...' : 'Send Message'}
                    </button>
                    <span className={formStyles.privacyNote}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

    </div>
  );
}
