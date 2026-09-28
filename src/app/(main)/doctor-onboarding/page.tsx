import React from 'react';
import { Metadata } from 'next';
import styles from './page.module.css';
import DoctorOnboardingForm from '@/components/DoctorOnboardingForm/DoctorOnboardingForm';

export const metadata: Metadata = {
  title: 'Doctor Onboarding | BENVA Healthcare',
  description: 'Join BENVA Healthcare as a certified doctor. Complete the onboarding form to get started.',
};

export default function DoctorOnboardingPage() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.container}>
          <h1>Doctor Onboarding Form</h1>
          <p>Join our network of premium healthcare providers</p>
        </div>
      </div>
      <DoctorOnboardingForm />
    </main>
  );
}
