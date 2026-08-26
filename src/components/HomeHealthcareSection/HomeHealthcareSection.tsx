'use client';
import React from 'react';
import styles from './HomeHealthcareSection.module.css';

const services = [
  { title: 'BP Check At Home',    desc: 'Regular Blood Pressure Monitoring',   emoji: '💓' },
  { title: 'Sugar Check At Home', desc: 'Blood Sugar Monitoring Support',       emoji: '🩸' },
  { title: 'Nurse Visit',         desc: 'Qualified Nursing Support',            emoji: '👩‍⚕️' },
  { title: 'Physiotherapy',       desc: 'Physiotherapy Support At Home',        emoji: '🦽' },
  { title: 'Elder Care Services', desc: 'Support For Senior Citizens',          emoji: '🧓' },
  { title: 'Attender Services',   desc: 'Patient Care Assistance',              emoji: '🤝' },
  { title: 'Doctor Home Visit',   desc: 'Subject To Availability',              emoji: '🏠' },
];

export default function HomeHealthcareSection() {
  return (
    <section className={styles.section} id="home-healthcare">
      <div className={styles.container}>

        {/* ── Left column ── */}
        <div className={styles.left}>
          <span className={styles.tag}>Home Healthcare</span>
          <h2 className={styles.heading}>
            Professional care,<br />
            <span className={styles.accent}>at your doorstep.</span>
          </h2>
          <p className={styles.desc}>
            BENVA connects you with qualified healthcare professionals for home-based
            care through our trusted partner network across Andhra Pradesh &amp; Telangana.
          </p>
          <button
            className={styles.cta}
            onClick={() => window.dispatchEvent(new Event('openHomeCareModal'))}
          >
            Book a Service
            <span className={styles.arrow}>→</span>
          </button>
          <p className={styles.note}>⚠ Availability may vary by location.</p>
        </div>

        {/* ── Right column: service list ── */}
        <div className={styles.right}>
          {services.map((s, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.itemEmoji}>{s.emoji}</span>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>{s.title}</span>
                <span className={styles.itemDesc}>{s.desc}</span>
              </div>
              <span className={styles.itemArrow}>›</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
