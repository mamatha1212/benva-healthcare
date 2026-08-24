'use client';
import React, { useState, useEffect } from 'react';
import styles from './AvailabilityFormModal.module.css';

interface AvailabilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AvailabilityFormModal({ isOpen, onClose }: AvailabilityFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    district: '',
    area: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setStatus('idle');
      setFormData({ fullName: '', mobile: '', district: '', area: '' });
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Thank You For Your Enquiry</h3>
            <p className={styles.successDesc}>Our Team Will Contact You To Confirm Service Availability In Your Area.</p>
            <button className={styles.okBtn} onClick={onClose}>Okay</button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h3 className={styles.title}>Check Availability</h3>
              <p className={styles.subtitle}>Submit Your Details And Our Team Will Assist You.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name *</label>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>District *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad"
                  className={styles.input}
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Area / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhapur"
                  className={styles.input}
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
