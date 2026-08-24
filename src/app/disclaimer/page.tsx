import React from 'react';
import styles from '../legal.module.css';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main className={styles.pageWrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Disclaimer</h1>
          <span className={styles.lastUpdated}>Last Updated: August 2026</span>

          <div className={styles.content}>
          <p>
            The information and services provided by BENVA Healthcare are for general informational and facilitation purposes only.
          </p>

          <h2>1. Healthcare Aggregator Role</h2>
          <p>
            BENVA Healthcare acts strictly as a healthcare aggregator and facilitator. We connect patients with trusted laboratories, pharmacies, doctors, and healthcare service providers. 
          </p>

          <h2>2. Third-Party Services</h2>
          <p>
            Laboratory testing, medicine services, teleconsultation, and other direct healthcare services are provided through respective independent healthcare partners and service providers, not by BENVA Healthcare directly. We do not assume liability for the medical advice, diagnosis, or treatment provided by these third-party professionals.
          </p>

          <h2>3. No Medical Advice</h2>
          <p>
            The content on our platform is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>

          <h2>4. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Disclaimer, please contact us at <strong>Benvahealthcaresupport@gmail.com</strong>.
          </p>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
