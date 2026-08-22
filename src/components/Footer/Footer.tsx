'use client';
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.grid}>
          
          {/* Column 1: About */}
          <div className={styles.col}>
            <div className={styles.logoGroup}>
              <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" style={{ height: '70px', width: 'auto', transform: 'scale(2.5)', transformOrigin: 'left center' }} />
            </div>
            <p className={styles.aboutText}>
              Our secure online donation platform allows you to make contributions quickly and safely. Choose from various.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink}>f</a>
              <a href="#" className={styles.socialLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink}>in</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.col}>
            <h3 className={styles.heading}>
              Quick Links
              <div className={styles.headingLine} />
            </h3>
            <ul className={styles.linkList}>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Services</a></li>
              <li><a href="#">Our Blogs</a></li>
              <li><a href="#">FAQ'S</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Recent Posts */}
          <div className={styles.col}>
            <h3 className={styles.heading}>
              Recent Posts
              <div className={styles.headingLine} />
            </h3>
            <div className={styles.postList}>
              <div className={styles.postItem}>
                <div 
                  className={styles.postImg}
                  style={{ backgroundImage: 'url(/images/cause-v2-img1.jpg)' }}
                />
                <div className={styles.postInfo}>
                  <span className={styles.postDate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    20 April, 2025
                  </span>
                  <a href="#" className={styles.postTitle}>Top 5 Most Famous Technology Trend In 2024</a>
                </div>
              </div>
              <div className={styles.postItem}>
                <div 
                  className={styles.postImg}
                  style={{ backgroundImage: 'url(/images/cause-v2-img2.jpg)' }}
                />
                <div className={styles.postInfo}>
                  <span className={styles.postDate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    15 April, 2025
                  </span>
                  <a href="#" className={styles.postTitle}>The Surfing Man Will Blow Your Mind</a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Our Services */}
          <div className={styles.col}>
            <h3 className={styles.heading}>
              Our Services
              <div className={styles.headingLine} />
            </h3>
            <ul className={styles.linkList}>
              <li><a href="#">Give Donation</a></li>
              <li><a href="#">Education Support</a></li>
              <li><a href="#">Food Support</a></li>
              <li><a href="#">Health Support</a></li>
              <li><a href="#">Our Campaign</a></li>
            </ul>
          </div>

        </div>

      </div>
      
      {/* ── Bottom Bar ── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <div className={styles.copyright}>
            © All Copyright 2025 by Donatix
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Terms and Condition</a>
            <a href="#">Privacy and Policy</a>
          </div>
        </div>
      </div>
      
    </footer>
  );
}
