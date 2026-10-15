import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import MedicinesClient from './MedicinesClient';

export const dynamic = 'force-dynamic';

export default async function MedicinesPage() {
  const initialOrders = await prisma.medicineOrder.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <Suspense fallback={<div style={{ padding: '24px', color: '#64748b' }}>Loading Medicines & Reminders...</div>}>
      <MedicinesClient initialOrders={initialOrders} />
    </Suspense>
  );
}
