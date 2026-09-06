'use client';

import React, { useState } from 'react';
import styles from '../ContactSection/ContactSection.module.css';

export default function ContactForm() {
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

  if (status === 'success') {
    return (
      <div className={styles.formWrapper}>
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
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Your information is safe with us.
          </span>
        </div>
      </form>
    </div>
  );
}
