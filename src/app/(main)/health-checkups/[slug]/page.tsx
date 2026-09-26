import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import styles from '@/components/PremiumCheckupSection/PremiumCheckupSection.module.css';
import BookCheckupButton from '@/components/PremiumCheckupSection/BookCheckupButton';
import BookingFormSection from '@/components/BookingFormSection/BookingFormSection';
import React from 'react';
import Link from 'next/link';

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

  // Calculate original price (e.g. + ₹1000 for display purposes)
  const numericPrice = parseInt(pkg.price.replace(/\D/g, ''), 10) || 0;
  const originalPrice = numericPrice > 0 ? numericPrice + 1200 : '';

  // Get total tests count
  let totalTestsCount = 0;
  if (pkg.tests && pkg.tests.length > 0) {
    totalTestsCount = pkg.tests.reduce((acc, test) => acc + test.parameters.split(',').length, 0);
  } else if (pkg.profiles && pkg.profiles.length > 0) {
    totalTestsCount = pkg.profiles.reduce((acc, profile) => acc + profile.parameters.length, 0);
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainGrid}>
        
        {/* ── Left Column ── */}
        <div className={styles.leftCol}>
          <img src={pkg.image} alt={pkg.title} className={styles.pkgImage} />
          
          <div className={styles.priceSection}>
            <div className={styles.priceCol}>
              {originalPrice && <span className={styles.originalPrice}>₹{originalPrice}</span>}
              <span className={styles.currentPrice}>₹{pkg.price}</span>
            </div>
            <BookCheckupButton title={pkg.title} price={pkg.price} />
          </div>
          <div className={styles.testsCountLink}>{totalTestsCount}+ tests included</div>
        </div>

        {/* ── Middle Column ── */}
        <div className={styles.midCol}>
          <h1 className={styles.pageTitle}>{pkg.title}</h1>
          
          <div className={styles.tagsRow}>
            <span className={styles.tagBadge}>📅 Reports earliest by 24 hours</span>
            <span className={styles.tagBadge}>🏠 Home Sample Collection</span>
          </div>
          
          <div className={styles.disclaimerText}>
            *Report TAT may vary depending on the vendor/laboratory selected
          </div>

          <div className={styles.testsInfo}>
            <h3 className={styles.testsHeader}>{totalTestsCount} tests included</h3>
            
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

        {/* ── Right Column ── */}
        <div className={styles.rightCol}>
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Unable to book a test?</h3>
            <input type="text" placeholder="Please Enter Your Name" className={styles.inputField} />
            <input type="tel" placeholder="Please Enter Your Phone Number" className={styles.inputField} />
            <button className={styles.callbackBtn}>Request Call Back</button>
            
            <div className={styles.orDivider}>- - - - or - - - -</div>
            
            <div className={styles.callUsBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Call us:</span>
              <a href="tel:+919111145556" className={styles.callUsNumber}>+91 91111 45556</a>
            </div>
          </div>
        </div>

      </div>

      <BookingFormSection />

      {/* ── Mobile Sticky Footer ── */}
      <div className={styles.mobileStickyFooter}>
        <div className={styles.mobilePriceCol}>
          <span className={styles.mobilePrice}>₹{pkg.price}</span>
          <span className={styles.mobileTestsCount}>{totalTestsCount}+ tests</span>
        </div>
        <div className={styles.mobileActions}>
          <a href="tel:+919111145556" className={styles.mobileCallBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
          <BookCheckupButton title={pkg.title} price={pkg.price} />
        </div>
      </div>
    </div>
  );
}
