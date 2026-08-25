'use client';
import React, { useState } from 'react';
import styles from './Navbar.module.css';

const navLinks = ['Home', 'Health Packages', 'Medicines', 'Membership Card', 'Home Healthcare', 'About Us', 'Contact Us'];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      {/* Top info bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              +91 9111145556
            </span>
            <span className={styles.topBarItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              +91 9111145556
            </span>
            <span className={styles.topBarItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Benvahealthcaresupport@gmail.com
            </span>
          </div>
          <div className={styles.topBarRight}>
            <span>Follow Us</span>
            <a href="https://www.facebook.com/share/1cgaz5Z239/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="facebook">
              <SocialIcon name="facebook" />
            </a>
            <a href="https://www.instagram.com/benva_healthcare?igsi=MXhvZTVodXZlcmc0dA==" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="instagram">
              <SocialIcon name="instagram" />
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className={styles.mainNav}>
        <div className={styles.navInner}>
          {/* Logo */}
          <a href="/" className={styles.logo}>
            <img src="/images/Benva%20NEW.png" alt="Benva Healthcare" className={styles.logoImage} />
          </a>

          {/* Nav Links */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
            {navLinks.map((link) => (
              <li key={link} className={styles.navItem}>
                <a 
                  href={link === 'Home' ? '/' : '#'} 
                  onClick={(e) => {
                    if (link === 'Medicines') {
                      e.preventDefault();
                      const el = document.getElementById('services-grid');
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }
                  }}
                  className={styles.navLink}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className={styles.navActions}>
            <a href="#donate" className={styles.donateBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              BOOK APPOINTMENT
            </a>
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function SocialIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    facebook: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
    instagram: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    linkedin: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  };
  return <>{icons[name]}</>;
}
