import { prisma } from '@/lib/prisma';
import React from 'react';
import StaticPageAdminClient from './StaticPageAdminClient';

export default async function StaticPagesAdmin() {
  const pages = await prisma.staticPage.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a202c', margin: '0 0 8px 0' }}>Manage Static Pages</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
          Create and manage content pages like About Us, Privacy Policy, etc.
        </p>
      </div>

      <StaticPageAdminClient pages={pages} />
    </div>
  );
}
