import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import styles from '@/components/PremiumCheckupSection/PremiumCheckupSection.module.css';
import AnimatedHeading from '@/components/AnimatedHeading/AnimatedHeading';
import BookCheckupButton from '@/components/PremiumCheckupSection/BookCheckupButton';
import BookingFormSection from '@/components/BookingFormSection/BookingFormSection';
import React from 'react';

const checkIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const simpleCheckIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default async function PackageDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const pkg = await prisma.healthPackage.findUnique({
    where: { slug: resolvedParams.slug },
    include: { 
      profiles: { 
        include: { parameters: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' } 
      } 
    }
  });

  if (!pkg) {
    notFound();
  }

  // Tests are now fetched dynamically from pkg.tests

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <section className={styles.section} id="premium-checkup">
        <div className={styles.container}>
          <div className={styles.grid}>

            {/* ── Left Column (Image & Hook) ── */}
            <div className={styles.imageCol}>
              <div className={styles.imageBox} style={{ backgroundImage: `url(${pkg.image})` }} />
              <div className={styles.pricingOverlay}>
                <div className={styles.pricingHeader}>
                  <span className={styles.offerLabel}>BENVA Offer Price</span>
                </div>
                <div className={styles.price}>₹{pkg.price} <span>Only</span></div>

                <div className={styles.pricingHighlights}>
                  <div>{simpleCheckIcon} 72+ Tests</div>
                  <div>{simpleCheckIcon} Home Sample Collection</div>
                  <div>{simpleCheckIcon} Digital Reports</div>
                  <div>{simpleCheckIcon} Doctor Guidance</div>
                  <div>{simpleCheckIcon} Fast Report Delivery</div>
                  <div>{simpleCheckIcon} Trusted Partner Labs</div>
                </div>

                <BookCheckupButton title={pkg.title} price={pkg.price} />
              </div>
            </div>

            {/* ── Right Column (Details) ── */}
            <div className={styles.contentCol}>

              <div className={styles.headingWrapper}>
                <AnimatedHeading className={styles.mainHeading}>{pkg.title}</AnimatedHeading>
                <p className={styles.subHeading}>{pkg.subtitle}</p>
              </div>

              <div className={styles.testsSection}>
                <h3 className={styles.sectionTitle}>Tests Included</h3>
                <div className={styles.testsGrid}>
                  {pkg.profiles && pkg.profiles.length > 0 ? pkg.profiles.map((profile, idx) => (
                    <details key={idx} className={styles.testAccordion}>
                      <summary className={styles.testAccordionSummary}>
                        {profile.name} ({profile.parameters.length})
                      </summary>
                      <div className={styles.testAccordionContent}>
                        <ul className={styles.testParamList}>
                          {profile.parameters.map((p, pIdx) => (
                            <li key={pIdx} className={styles.testParamItem}>{p.name}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px' }}>No tests added yet.</div>
                  )}
                </div>
              </div>

              <div className={styles.testsSection}>
                <h3 className={styles.sectionTitle}>Package Suitable For</h3>
                <div className={styles.suitableRow}>
                  <div className={styles.suitableBadge}>{simpleCheckIcon} Working Professionals</div>
                  <div className={styles.suitableBadge}>{simpleCheckIcon} Senior Citizens</div>
                  <div className={styles.suitableBadge}>{simpleCheckIcon} Men & Women</div>
                  <div className={styles.suitableBadge}>{simpleCheckIcon} Diabetic Patients</div>
                  <div className={styles.suitableBadge}>{simpleCheckIcon} Preventive Checkups</div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Trust Row ── */}
          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <span className={styles.trustText}>Trusted Partner Labs</span>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <span className={styles.trustText}>Home Sample Collection</span>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <span className={styles.trustText}>Secure Reports</span>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <span className={styles.trustText}>Dedicated Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Render the modal which listens to openBookingModal event */}
      <BookingFormSection />
    </div>
  );
}
