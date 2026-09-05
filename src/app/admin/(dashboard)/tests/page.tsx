import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';
import React from 'react';
import TestAdminClient from './TestAdminClient';

export const dynamic = 'force-dynamic';

export default async function TestsDashboard() {
  const packages = await prisma.healthPackage.findMany({
    include: {
      profiles: {
        include: { parameters: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const profiles = await prisma.testProfile.findMany({
    include: { parameters: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Tests & Categories</h1>
        <p className={styles.subtitle}>Organize test profiles and assign them to health packages.</p>
      </div>

      <TestAdminClient packages={packages} profiles={profiles} />
    </div>
  );
}
