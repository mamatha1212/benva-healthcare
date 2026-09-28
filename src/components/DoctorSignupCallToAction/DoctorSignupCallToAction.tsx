'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Stethoscope } from 'lucide-react';
import styles from './DoctorSignupCallToAction.module.css';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

export default function DoctorSignupCallToAction() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <ScrollReveal animation="fadeUp">
          <div className={styles.card}>
            <div className={styles.content}>
              <div className={styles.iconWrapper}>
                <Stethoscope size={32} />
              </div>
              <h2 className={styles.title}>Partner With Us</h2>
              <p className={styles.description}>
                Are you a healthcare professional looking to expand your practice and provide premium care? Join BENVA Healthcare's network of certified and top-tier medical providers.
              </p>
              <ul className={styles.benefits}>
                <li><ArrowRight size={16} /> Access to a wider patient base</li>
                <li><ArrowRight size={16} /> Seamless telemedicine platform</li>
                <li><ArrowRight size={16} /> Dedicated support for your practice</li>
              </ul>
            </div>
            <div className={styles.actionArea}>
              <div className={styles.actionContent}>
                <h3>Ready to join our network?</h3>
                <p>Complete our fast and secure onboarding process to become a certified partner.</p>
                <Link href="/doctor-onboarding" className={styles.ctaButton}>
                  Signup as a Doctor
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
