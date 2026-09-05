import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HealthPackages.module.css';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HealthPackagesPage() {
  const packages = await prisma.healthPackage.findMany({
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className={styles.pageContainer}>
      
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.mainTitle}>Health Packages</h1>
          <p className={styles.mainSubtitle}>Comprehensive test packages at best prices</p>
        </div>
      </header>

      {/* ── Package List ── */}
      <main id="packages" className={styles.packageList}>
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`${styles.card} ${styles[pkg.theme] || styles.themePink} ${pkg.layout === 'right' ? styles.cardRight : ''}`}
          >
            
            <div className={styles.content}>
              <h3 className={styles.title}>{pkg.title}</h3>
              <p className={styles.subtitle}>{pkg.subtitle}</p>
              
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{pkg.price}</span>
                <span className={styles.originalPrice}>₹{pkg.originalPrice}</span>
                <span className={styles.discountBadge}>{pkg.discount}</span>
              </div>
              
              <Link href={`/health-checkups/${pkg.slug}`} className={styles.viewMoreBtn}>
                Book Now
              </Link>
            </div>

            <div className={styles.imageWrapper}>
              {pkg.isPopular && <div className={styles.popularTag}>MOST POPULAR</div>}
              <Image 
                src={pkg.image} 
                alt={pkg.title} 
                fill 
                sizes="(max-width: 768px) 150px, 200px"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
            No health packages available yet.
          </div>
        )}
      </main>

    </div>
  );
}

