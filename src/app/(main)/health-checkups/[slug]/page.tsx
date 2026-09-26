import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import styles from '@/components/PremiumCheckupSection/PremiumCheckupSection.module.css';
import AnimatedHeading from '@/components/AnimatedHeading/AnimatedHeading';
import BookCheckupButton from '@/components/PremiumCheckupSection/BookCheckupButton';
import BookingFormSection from '@/components/BookingFormSection/BookingFormSection';
import React from 'react';
import Link from 'next/link';

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
      tests: { orderBy: { order: 'asc' } },
      profiles: { 
        include: { parameters: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' } 
      } 
    }
  });

  if (!pkg) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* ── Hero Section (Medicines Layout Style) ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
          <div className={styles.cross1}></div>
          <div className={styles.cross2}></div>
          <div className={styles.pill1}></div>
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🏥 BENVA OFFER PRICE</span>
          <h1 className={styles.heroTitle}>{pkg.title}</h1>
          <p className={styles.heroSubtitle}>{pkg.subtitle}</p>
          
          <div className={styles.bannerContent}>
            <div className={styles.pricingBox}>
              <span className={styles.annualText}>EXCLUSIVE OFFER</span>
              <div className={styles.priceDisplay}>
                <span className={styles.perYear}>₹</span>
                <span className={styles.amount}>{pkg.price}</span>
              </div>
              <div className={styles.dailyCost}>Only</div>
            </div>

            <div className={styles.valueBox}>
              <span className={styles.actualPriceText}>Package Highlights</span>
              <div className={styles.strikethroughPrice}>72+ Tests</div>
              <div className={styles.saveBadge}>Home Collection</div>
            </div>
          </div>
          
          <div style={{ marginTop: '32px' }}>
             <BookCheckupButton title={pkg.title} price={pkg.price} />
          </div>

          <div className={styles.heroImageWrapper}>
            <div className={styles.heroImage} style={{ backgroundImage: `url(${pkg.image})` }} />
          </div>
        </div>
      </section>

      {/* ── Main Content Section ── */}
      <section className={styles.mainContentSection}>
        <div className={styles.mainContainer}>
          <div className={styles.contentGrid}>
            
            {/* Left Column: Tests */}
            <div className={styles.leftColumn}>
              <div className={styles.testsSection}>
                <h3 className={styles.sectionTitle}>Tests Included in this Package</h3>
                <div className={styles.testsGrid}>
                  {pkg.tests && pkg.tests.length > 0 ? pkg.tests.map((test, idx) => (
                    <details key={idx} className={styles.testAccordion}>
                      <summary className={styles.testAccordionSummary}>
                        {test.name} ({test.parameters.split(',').length})
                      </summary>
                      <div className={styles.testAccordionContent}>
                        <ul className={styles.testParamList}>
                          {test.parameters.split(',').map((p, pIdx) => (
                            <li key={pIdx} className={styles.testParamItem}>{p.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )) : pkg.profiles && pkg.profiles.length > 0 ? pkg.profiles.map((profile, idx) => (
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
            </div>

            {/* Right Column: Sticky Info */}
            <div className={styles.rightColumn}>
              <div className={styles.stickySidebar}>
                
                <div className={styles.suitableCard}>
                  <h3 className={styles.sectionTitle}>Package Suitable For</h3>
                  <div className={styles.suitableRow}>
                    <div className={styles.suitableBadge}>{simpleCheckIcon} Working Professionals</div>
                    <div className={styles.suitableBadge}>{simpleCheckIcon} Senior Citizens</div>
                    <div className={styles.suitableBadge}>{simpleCheckIcon} Men & Women</div>
                    <div className={styles.suitableBadge}>{simpleCheckIcon} Diabetic Patients</div>
                    <div className={styles.suitableBadge}>{simpleCheckIcon} Preventive Checkups</div>
                  </div>
                </div>

                <div className={styles.trustSidebar}>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <span className={styles.trustText}>Trusted Partner Labs</span>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <span className={styles.trustText}>Home Sample Collection</span>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <span className={styles.trustText}>Secure Reports</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Render the modal which listens to openBookingModal event */}
      <BookingFormSection />

      {/* ── Mobile Sticky Footer ── */}
      <div className={styles.mobileStickyFooter}>
        <div className={styles.mobilePriceCol}>
          <span className={styles.mobilePrice}>₹{pkg.price}</span>
          <span className={styles.mobileTestsCount}>72+ tests included</span>
        </div>
        <div className={styles.mobileActions}>
          <Link href={`/book-checkup?packageTitle=${encodeURIComponent(pkg.title)}&packagePrice=${encodeURIComponent(pkg.price)}`} className={styles.mobileBookBtn}>
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
