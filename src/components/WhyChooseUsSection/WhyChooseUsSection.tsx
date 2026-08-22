'use client';
import React, { useState } from 'react';
import styles from './WhyChooseUsSection.module.css';

const tabs = [
  {
    id: 'crowdfunding',
    title: 'Crowdfunding',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    image: '/images/cause-v2-img1.jpg',
    heading: 'Crowdfunding',
    desc: "We're more than just a charity — we're a movement of hope. Every donation, every gift, every hour you give brings us closer to our goal.",
  },
  {
    id: 'quick_fund',
    title: 'Quick fund calleted',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    image: '/images/cause-v2-img2.jpg',
    heading: 'Quick fund calleted',
    desc: "We're more than just a charity — we're a movement of hope. Every donation, every gift, every hour you give brings us closer to our goal.",
  },
  {
    id: 'global_community',
    title: 'Global Community',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    image: '/images/cause-v2-img3.jpg',
    heading: 'Global Community',
    desc: "We're more than just a charity — we're a movement of hope. Every donation, every gift, every hour you give brings us closer to our goal.",
  },
  {
    id: 'healthy_food',
    title: 'Healthy Food',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    image: '/images/feature-v1-img1.jpg',
    heading: 'Healthy Food',
    desc: "We're more than just a charity — we're a movement of hope. Every donation, every gift, every hour you give brings us closer to our goal.",
  }
];

export default function WhyChooseUsSection() {
  const [activeTab, setActiveTab] = useState(tabs[1]);

  return (
    <section className={styles.section} id="why-choose-us">
      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Why Choose Us</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <h2 className={styles.heading}>Motives For Believing In Our<br/>Dedication And Influence</h2>
        </div>

        {/* ── Main Content Grid ── */}
        <div className={styles.grid}>
          
          {/* Left Column: Tabs */}
          <div className={styles.tabsCol}>
            
            {/* Top Left Decor Bubble */}
            <div className={styles.decorBubble}>
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
                <path d="M30 40 Q20 30 35 25 Q40 10 55 15 Q70 10 75 25 Q90 30 80 40 Q90 55 75 60 Q70 75 55 70 Q40 75 35 60 Q20 55 30 40 Z" strokeDasharray="4,4"/>
                <path d="M45 40 L50 45 L40 55 M50 45 L55 35 M55 35 L60 40 L50 50 M40 35 C40 30 50 30 50 35 M50 35 C50 30 60 30 60 35" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="none"/>
              </svg>
            </div>

            <div className={styles.tabsList}>
              {tabs.map((tab) => {
                const isActive = activeTab.id === tab.id;
                return (
                  <div 
                    key={tab.id}
                    className={`${styles.tabItem} ${isActive ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <div className={styles.tabIcon}>{tab.icon}</div>
                    <span className={styles.tabTitle}>{tab.title}</span>
                    
                    {/* SVG Curve Line (only visible if active) */}
                    {isActive && (
                      <div className={styles.activeCurve}>
                        <svg viewBox="0 0 100 80" fill="none">
                          <path 
                            d="M0,20 Q60,20 80,60 T100,70" 
                            stroke="var(--color-primary)" 
                            strokeWidth="3"
                          />
                          <circle cx="95" cy="70" r="4" fill="var(--color-primary)" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Content Box */}
          <div className={styles.contentCol}>
            <div className={styles.contentBox}>
              
              <div 
                className={styles.imageArea} 
                style={{ backgroundImage: `url(${activeTab.image}), linear-gradient(#e5e7eb, #9ca3af)` }}
              />
              
              <div className={styles.textArea}>
                <h3 className={styles.contentHeading}>{activeTab.heading}</h3>
                <p className={styles.contentDesc}>{activeTab.desc}</p>
                
                <ul className={styles.checkList}>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Accurate Testing Processes
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    100% Satisfaction Guarantee
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Award Winning Company
                  </li>
                </ul>

                <button className={styles.donateBtn}>
                  Donate Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </button>
              </div>

              {/* Background Hands Watermark inside content box */}
              <div className={styles.boxWatermark}>
                <svg viewBox="0 0 200 200" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.05">
                  <path d="M100,50 C120,30 150,40 160,60 C170,80 140,120 110,130 C90,140 50,130 40,110 C30,90 70,70 100,50 Z" />
                </svg>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
