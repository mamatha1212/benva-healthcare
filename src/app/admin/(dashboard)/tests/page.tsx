import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';
import React from 'react';
import TestAdminClient from './TestAdminClient';

export const dynamic = 'force-dynamic';

export default async function TestsDashboard() {
  const categories = await prisma.testCategory.findMany({
    include: {
      tests: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Tests & Categories</h1>
        <p className={styles.subtitle}>Organize test categories and the individual tests within them.</p>
      </div>

      <TestAdminClient categories={categories} />
    </div>
  );
}
