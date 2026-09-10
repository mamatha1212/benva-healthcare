import { prisma } from '@/lib/prisma';
import styles from '../../page.module.css';
import React from 'react';
import BenefitsClient from './BenefitsClient';

export const dynamic = 'force-dynamic';

export default async function DietPlanBenefitsPage() {
  const allPlans = await prisma.dietPlan.findMany({
    orderBy: { createdAt: 'desc' },
    include: { benefits: { orderBy: { order: 'asc' } } }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className={styles.title}>Manage Diet Plan Details (What You Get)</h1>
          <p className={styles.subtitle}>Select a plan to manage its benefits.</p>
        </div>
        <a 
          href="/admin/diet-plans"
          style={{ background: '#f1f5f9', color: '#334155', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Diet Plans
        </a>
      </div>

      <BenefitsClient allPlans={allPlans} />
    </div>
  );
}
