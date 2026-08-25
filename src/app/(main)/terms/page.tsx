import React from 'react';
import styles from '../legal.module.css';

export default function TermsPage() {
  return (
    <>
      <main className={styles.pageWrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Terms and Conditions</h1>
          <span className={styles.lastUpdated}>Last Updated: August 2026</span>

          <div className={styles.content}>
          <p>
            Welcome to BENVA Healthcare. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
          </p>

          <h2>1. Use of Services</h2>
          <p>
            BENVA Healthcare provides a platform to book health checkups, request medicine assistance, and access home healthcare services. You agree to use these services only for lawful purposes and in accordance with these Terms.
          </p>

          <h2>2. User Accounts & Information</h2>
          <p>
            When booking a service or submitting a contact form, you must provide accurate, current, and complete information. We are not liable for any issues arising from incorrect details provided by you.
          </p>

          <h2>3. Medical Disclaimer</h2>
          <p>
            The content and services provided by BENVA Healthcare are for informational and facilitative purposes only. We are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
          </p>

          <h2>4. Payments and Refunds</h2>
          <ul>
            <li>Prices for health checkups and memberships are subject to change without notice.</li>
            <li>Refunds for cancellations are subject to the policies of our partner healthcare providers.</li>
            <li>We reserve the right to refuse or cancel any order or service request at our discretion.</li>
          </ul>

          <h2>5. Limitation of Liability</h2>
          <p>
            BENVA Healthcare acts as a facilitator between users and healthcare providers (laboratories, pharmacies, etc.). We shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services or the services of our partners.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <strong>Benvahealthcaresupport@gmail.com</strong>.
          </p>
        </div>
        </div>
      </main>
    </>
  );
}

