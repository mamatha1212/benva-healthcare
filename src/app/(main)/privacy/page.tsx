import React from 'react';
import styles from '../legal.module.css';

export default function PrivacyPage() {
  return (
    <>
      <main className={styles.pageWrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <span className={styles.lastUpdated}>Last Updated: August 2026</span>

          <div className={styles.content}>
          <p>
            At BENVA Healthcare, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li>Personal details: Name, age, gender.</li>
            <li>Contact details: Phone number, WhatsApp number, email address.</li>
            <li>Location details: Address, area, district, state.</li>
            <li>Inquiry details: Messages submitted via our contact forms.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>Your information is used strictly to provide and improve our services. Specifically, we use your data to:</p>
          <ul>
            <li>Process your service requests and health checkup bookings.</li>
            <li>Contact you regarding your inquiries, appointments, and membership status.</li>
            <li>Facilitate communication between you and our partner healthcare providers.</li>
            <li>Improve our website and customer service experience.</li>
          </ul>

          <h2>3. Data Protection and Sharing</h2>
          <p>
            We implement reasonable security measures to protect your personal information against unauthorized access, alteration, or disclosure. 
            We do not sell or rent your personal information to third parties. We may share your data with trusted partner healthcare providers solely for the purpose of fulfilling your requested services.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Our website may use cookies to enhance user experience, track website usage, and remember your preferences. You can choose to set your web browser to refuse cookies, or to alert you when cookies are being sent.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data held by us. If you wish to exercise these rights, please contact us.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at <strong>Benvahealthcaresupport@gmail.com</strong>.
          </p>
        </div>
        </div>
      </main>
    </>
  );
}

