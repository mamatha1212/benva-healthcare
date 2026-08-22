'use client';
import React from 'react';
import styles from './StatsSection.module.css';

const stats = [
  { id: 1, number: '25k+', label: 'Incredible Volunteers', color: 'green' },
  { id: 2, number: '10k+', label: 'Successful Campaigns', color: 'orange' },
  { id: 3, number: '500+', label: 'Monthly Donors', color: 'green' },
  { id: 4, number: '45k+', label: 'Team Support', color: 'orange' },
];

export default function StatsSection() {
  return (
    <section className={styles.section} id="stats">
      <div className={styles.container}>
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div key={stat.id} className={styles.statItem}>
              <h2 className={`${styles.number} ${stat.color === 'orange' ? styles.orange : styles.green}`}>
                {stat.number}
              </h2>
              <p className={styles.label}>{stat.label}</p>
              
              {/* Divider for all except last */}
              {index < stats.length - 1 && (
                <div className={styles.divider} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
