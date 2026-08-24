'use client';
import React from 'react';
import styles from './ServicesGridSection.module.css';

export default function ServicesGridSection() {
  const whatsappNumber = "919876543210"; 
  const medicineMsg = "Hello BENVA Healthcare,%0AI would like to order medicines.%0APlease assist me with the process.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${medicineMsg}`;

  const checkIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );

  const watermark = (
    <svg className={styles.watermark} viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M30 40 Q20 30 35 25 Q40 10 55 15 Q70 10 75 25 Q90 30 80 40 Q90 55 75 60 Q70 75 55 70 Q40 75 35 60 Q20 55 30 40 Z" strokeDasharray="4,4"/>
    </svg>
  );

  return (
    <section className={styles.section} id="services-grid">
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* ── CARD 1: Order Medicines ── */}
          <div className={styles.card}>
            {watermark}
            
            <div className={styles.imageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/pharmacy-support.png" alt="Pharmacy Support" className={styles.mainImage} />
              <div className={styles.infoBox}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoTitle}>Important Note</span>
                  <span className={styles.infoDesc}>A valid prescription may be required for certain medicines.</span>
                </div>
              </div>
            </div>

            <div className={styles.contentArea}>
              <h2 className={styles.heading}>Order Medicines Online</h2>
              <p className={styles.subHeading}>Upload Your Doctor Prescription And Get Assistance Through Our Partner Pharmacy Network.</p>
              
              <div className={styles.benefitsList}>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Easy Ordering</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Prescription Based</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Partner Network</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Dedicated Support</div>
              </div>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Send Prescription On WhatsApp
              </a>
            </div>
          </div>


          {/* ── CARD 2: Membership Card ── */}
          <div className={styles.card}>
            {watermark}
            
            <div className={styles.imageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/membership-card.png" alt="Membership Card" className={styles.mainImage} />
              <div className={styles.infoBox}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoTitle}>Family Friendly</span>
                  <span className={styles.infoDesc}>Secure your family's health with our priority support.</span>
                </div>
              </div>
            </div>

            <div className={styles.contentArea}>
              <h2 className={styles.heading}>BENVA Membership Card</h2>
              <p className={styles.subHeading}>Exclusive Healthcare Benefits For You And Your Family.</p>
              
              <div className={styles.benefitsList}>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Diagnostic Discounts</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Priority Support</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Healthcare Guidance</div>
                <div className={styles.benefitItem}><div className={styles.benefitIcon}>{checkIcon}</div> Partner Benefits</div>
              </div>

              <button className={styles.actionBtn} onClick={() => window.dispatchEvent(new Event('openMembershipModal'))}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Apply For Membership
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
