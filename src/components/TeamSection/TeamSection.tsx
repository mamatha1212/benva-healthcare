'use client';
import React from 'react';
import styles from './TeamSection.module.css';

const teamMembers = [
  {
    id: 1,
    name: 'Daniel Thomas',
    role: 'Volunteer',
    image: '/images/team-v1-img1.jpg',
  },
  {
    id: 2,
    name: 'Annette Black',
    role: 'Volunteer',
    image: '/images/team-v1-img2.jpg',
  },
  {
    id: 3,
    name: 'Albert Flores',
    role: 'Volunteer',
    image: '/images/team-v1-img3.jpg',
  },
  {
    id: 4,
    name: 'Jessica Lauren',
    role: 'Volunteer',
    image: '/images/team-v1-img4.jpg',
  },
];

export default function TeamSection() {
  return (
    <section className={styles.section} id="team">
      <div className={styles.container}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>Our Volunteer</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <h2 className={styles.heading}>Meet The Constructive Volunteer</h2>
        </div>

        {/* ── Team Grid ── */}
        <div className={styles.grid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.card}>
              {/* Photo Area */}
              <div 
                className={styles.photoArea}
                style={{ backgroundImage: `url(${member.image}), linear-gradient(#e5e7eb, #d1d5db)` }}
              >
                {/* Plus Button */}
                <button className={styles.plusBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Info Box */}
              <div className={styles.infoBoxWrapper}>
                <div className={styles.infoBox}>
                  <h3 className={styles.name}>{member.name}</h3>
                  <p className={styles.role}>{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
