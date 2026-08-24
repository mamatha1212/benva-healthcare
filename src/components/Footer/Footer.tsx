'use client';
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.grid}>
          
          {/* Column 1: About & Contact */}
          <div className={styles.col}>
            <div className={styles.logoGroup}>
              <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ height: '70px', width: 'auto', transform: 'scale(2.5)', transformOrigin: 'left center' }} />
            </div>
            <p className={styles.aboutText}>
              BENVA Healthcare is a healthcare aggregator and facilitator helping individuals and families access healthcare services through trusted healthcare partners.
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Phone:</strong> +91 9111145556</p>
              <p><strong>WhatsApp:</strong> +91 9111145556</p>
              <p><strong>Email:</strong> Benvahealthcaresupport@gmail.com</p>
              <p><strong>Service Areas:</strong> Andhra Pradesh & Telangana</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.col}>
            <h3 className={styles.heading}>
              Quick Links
              <div className={styles.headingLine} />
            </h3>
            <ul className={styles.linkList}>
              <li><a href="/">Home</a></li>
              <li><a href="#lab-tests">Health Packages</a></li>
              <li><a href="#checkups">Medicines</a></li>
              <li><a href="#services-grid">Membership Card</a></li>
              <li><a href="#home-healthcare">Home Healthcare</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className={styles.col}>
            <h3 className={styles.heading}>
              Services
              <div className={styles.headingLine} />
            </h3>
            <ul className={styles.linkList}>
              <li><a href="#premium-checkup">Full Body Health Checkup</a></li>
              <li><a href="#doorstep">Home Sample Collection</a></li>
              <li><a href="#checkups">Medicines Assistance</a></li>
              <li><a href="#">Teleconsultation</a></li>
              <li><a href="#services-grid">Membership Card</a></li>
              <li><a href="#home-healthcare">Home Healthcare Services</a></li>
            </ul>
          </div>

          {/* Column 4: Legal & Social */}
          <div className={styles.col}>
            <h3 className={styles.heading}>
              Legal Links
              <div className={styles.headingLine} />
            </h3>
            <ul className={styles.linkList}>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-conditions">Terms & Conditions</a></li>
              <li><a href="/refund-policy">Refund Policy</a></li>
              <li><a href="/cancellation-policy">Cancellation Policy</a></li>
              <li><a href="/disclaimer">Disclaimer</a></li>
            </ul>

            <h3 className={styles.heading} style={{ marginTop: '30px' }}>
              Social Media
              <div className={styles.headingLine} />
            </h3>
            <div className={styles.socials}>
              {/* Facebook */}
              <a href="https://www.facebook.com/share/1cgaz5Z239/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/benva_healthcare?igsi=MXhvZTVodXZlcmc0dA==" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.16 1 12 1 12s0 3.84.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.84 23 12 23 12s0-3.84-.46-5.58z"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Important Disclaimer */}
        <div className={styles.disclaimerSection}>
          <h4>Important Disclaimer</h4>
          <p>
            BENVA Healthcare acts as a healthcare aggregator and facilitator. Laboratory testing, medicine services, teleconsultation and healthcare services are provided through respective healthcare partners and service providers.
          </p>
        </div>

      </div>
      
      {/* ── Bottom Bar ── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <div className={styles.copyright}>
            © 2026 BENVA Healthcare. All Rights Reserved.
          </div>
          <div className={styles.footerLinks}>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-conditions">Terms & Conditions</a>
            <a href="/disclaimer">Disclaimer</a>
          </div>
        </div>
      </div>
      
    </footer>
  );
}
