'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './VolunteerSection.module.css';


// Real avatar photos from uploaded images
const avatars = [
  { src: '/images/why-choose-v1-img3.png', alt: 'Person 1' },
  { src: '/images/why-choose-v1-img4.png', alt: 'Person 2' },
  { src: '/images/why-choose-v1-img5.png', alt: 'Person 3' },
  { src: '/images/why-choose-v1-img6.png', alt: 'Person 4' },
];

function useCountUp(target: number, duration = 1800, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
}

export default function VolunteerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const happyCount = useCountUp(2000, 1800, visible);

  return (
    <section className={styles.section} ref={sectionRef} id="volunteer">
      {/* Topographic pattern background texture */}
      <div
        className={styles.sectionPattern}
        style={{ backgroundImage: 'url(/images/feature-v1-pattern2.png)' }}
      />

      <div className={styles.container}>

        {/* ── Card 1: Become a Volunteer ── */}
        <div
          className={`${styles.card} ${styles.cardLeft}`}
          style={{ backgroundImage: 'url(/images/feature-v1-img1.jpg)' }}
        >
          {/* White decorative shape */}
          <div
            className={styles.cardShape}
            style={{ backgroundImage: 'url(/images/feature-v1-shape1.png)' }}
          />
          <div className={styles.cardOverlay} />
          <div className={styles.cardContent}>
            <div className={styles.cardTag}>
              <span className={styles.tagDot} />
              Volunteer
            </div>
            <h2 className={styles.cardTitle}>Become a volunteer</h2>
            <p className={styles.cardDesc}>
              Provide resources such as reports, infogra educational materials
              related to the charity&apos;s cause. Use a clear and intuitive
              navigation menu to help users
            </p>
            <a href="#" className={styles.btnOrange}>
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Card 2: Stats (center teal) ── */}
        <div className={`${styles.card} ${styles.cardTeal}`}>
          <div className={styles.circleDecor} />
          <div className={styles.cardContent}>

            {/* Real photo avatar stack */}
            <div className={styles.avatarStack}>
              {avatars.map((av, i) => (
                <div
                  key={i}
                  className={styles.avatar}
                  style={{ zIndex: avatars.length - i }}
                >
                  <Image
                    src={av.src}
                    alt={av.alt}
                    width={48}
                    height={48}
                    className={styles.avatarImg}
                  />
                </div>
              ))}
              <div className={`${styles.avatar} ${styles.avatarPlus}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>

            <div className={styles.statNumber}>
              {happyCount >= 1000 ? `${(happyCount / 1000).toFixed(0)}k+` : `${happyCount}+`}
            </div>
            <p className={styles.statLabel}>Happy People</p>

            <div className={styles.statDivider} />

            <div className={styles.miniStats}>
              <div className={styles.miniStat}>
                <span className={styles.miniNum}>500+</span>
                <span className={styles.miniLabel}>Volunteers</span>
              </div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}>
                <span className={styles.miniNum}>150+</span>
                <span className={styles.miniLabel}>Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 3: Join Us ── */}
        <div
          className={`${styles.card} ${styles.cardRight}`}
          style={{ backgroundImage: 'url(/images/feature-v1-img2.jpg)' }}
        >
          {/* White decorative shape */}
          <div
            className={styles.cardShape}
            style={{ backgroundImage: 'url(/images/feature-v1-shape2.png)' }}
          />
          <div className={styles.cardOverlay} />
          <div className={styles.cardContent}>
            <div className={styles.cardTag}>
              <span className={styles.tagDot} />
              Community
            </div>
            <h2 className={styles.cardTitle}>Join Us volunteer</h2>
            <p className={styles.cardDesc}>
              Provide resources such as reports, infogra educational materials
              related to the charity&apos;s cause. Use a clear and intuitive
              navigation menu to help users
            </p>
            <a href="#" className={styles.btnWhite}>
              Join Us Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
