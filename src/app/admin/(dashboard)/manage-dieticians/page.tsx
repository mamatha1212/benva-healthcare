import React from 'react';
import { prisma } from '@/lib/prisma';
import DieticianList from './DieticianList';

export const dynamic = 'force-dynamic';

export default async function ManageDieticiansAdmin() {
  const dieticians = await prisma.doctor.findMany({
    where: {
      type: 'DIETICIAN'
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <DieticianList initialDieticians={dieticians} />
    </div>
  );
}

