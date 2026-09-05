'use client';
import React from 'react';
import styles from './PremiumCheckupSection.module.css';

export default function BookCheckupButton({ title, price }: { title: string; price: string }) {
  const handleClick = () => {
    const event = new CustomEvent('openBookingModal', {
      detail: { title, price }
    });
    window.dispatchEvent(event);
  };

  return (
    <button 
      className={styles.mainBtn}
      onClick={handleClick}
    >
      Book Health Checkup
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  );
}
