import { prisma } from '@/lib/prisma';
import MedicinesClient from './MedicinesClient';

export const dynamic = 'force-dynamic';

export default async function MedicinesPage() {
  const initialOrders = await prisma.medicineOrder.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <MedicinesClient initialOrders={initialOrders} />;
}
