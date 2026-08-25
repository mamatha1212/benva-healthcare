'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HeroBanner.module.css';

const slides = [
  {
    tagline: 'Welcome To BENVA Healthcare',
    heading: 'Complete Healthcare Services\nAt Your Doorstep',
    subtitle:
      'Book Lab Tests, Order Medicines, Home Healthcare Services And Teleconsultation Through BENVA Healthcare.',
  }
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((active + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [active]);

  function goTo(idx: number) {
    if (idx === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setAnimating(false);
    }, 400);
  }

  const slide = slides[active];

  return (
    <section className={styles.hero} id="hero">
      {/* ── Background Image ── */}
      <div className={styles.bgWrapper}>
        <Image
          src="/images/hero-bg-new.png"
          alt="Benva Healthcare Hero"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        {/* Dark overlay gradient */}
        <div className={styles.overlay} />
      </div>

      {/* ── LEFT SHAPES (real uploaded PNGs) ── */}
      <div className={styles.shapesLeft}>
        {/* shape2 — orange diagonal corner lines */}
        <div className={`${styles.shapeItem} ${styles.shape1}`}>
          <Image
            src="/images/main-slider-v2-shape2.png"
            alt=""
            width={320}
            height={360}
            style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
          />
        </div>

        {/* shape4 — light/white abstract shape */}
        <div className={`${styles.shapeItem} ${styles.shape2}`}>
          <Image
            src="/images/main-slider-v2-shape4.png"
            alt=""
            width={240}
            height={280}
            style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* ── RIGHT HEALTHCARE ICON ── */}
      <div className={styles.heartWrapper}>
        <div className={styles.healthcareImg}>
          <Image
            src="/images/healthcare-icon-clean.png"
            alt="Healthcare Icon"
            width={400}
            height={400}
            style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
          />
        </div>
        <div className={styles.heartDot1} />
        <div className={styles.heartDot2} />
      </div>

      {/* ── FLOATING DOT RING ── */}
      <div className={styles.floatingRing}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="22" cy="22" r="6" fill="var(--color-primary)" opacity="0.7" />
        </svg>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.contentWrapper}>
        <div className={`${styles.content} ${animating ? styles.fadeOut : styles.fadeIn}`}>
          {/* Tagline */}
          <div className={styles.tagline}>
            <span className={styles.taglineArrow}>
              <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
                <line x1="0" y1="5" x2="24" y2="5" stroke="var(--color-primary)" strokeWidth="2" />
                <polyline points="20,1 28,5 20,9" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
              </svg>
            </span>
            <span>{slide.tagline}</span>
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>
            {slide.heading.split('\n').map((line, i) => (
              <span key={i} className={styles.headingLine}>
                {line}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>{slide.subtitle}</p>

          {/* CTA Buttons */}
          <div className={styles.buttons}>
            <Link href="/health-packages" className={styles.btnAction}>
              <div className={styles.btnIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 6L2 18" />
                  <path d="M18 10L14 6" />
                  <path d="M22 6C22 8 20 10 18 10C16 10 14 8 14 6C14 4 16 2 18 2C20 2 22 4 22 6Z" />
                  <path d="M2 18H8V22H2V18Z" />
                </svg>
              </div>
              <div className={styles.btnTextWrapper}>
                <span className={styles.btnSmallText}>Book</span>
                <span className={styles.btnLargeText}>Health Checkup</span>
              </div>
            </Link>

            <a href="#services-grid" className={styles.btnAction}>
              <div className={styles.btnIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <div className={styles.btnTextWrapper}>
                <span className={styles.btnSmallText}>Order</span>
                <span className={styles.btnLargeText}>Medicines</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── SLIDE INDICATORS (Hidden since only 1 slide now) ── */}
      {slides.length > 1 && (
        <div className={styles.indicators}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── BOTTOM WAVE SHAPE ── */}
      <div className={styles.bottomWave}>
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path
            d="M0 80 C360 20, 720 60, 1080 30 C1260 15, 1380 40, 1440 50 L1440 80 Z"
            fill="rgba(255,255,255,0.04)"
          />
        </svg>
      </div>
    </section>
  );
}
