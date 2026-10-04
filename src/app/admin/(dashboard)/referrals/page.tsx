import React from 'react';
import ReferralsClient from './ReferralsClient';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Manage Referrals | Benva Admin',
};

export default async function ReferralsPage() {
  const states = await prisma.state.findMany({
    include: { districts: true },
    orderBy: { name: 'asc' }
  });
  return <ReferralsClient initialStates={states} />;
}
