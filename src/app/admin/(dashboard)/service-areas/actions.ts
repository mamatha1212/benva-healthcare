'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getServiceLocations(state: string, page: number = 1, search: string = '', statusFilter: string = 'ALL', phleboFilter: string = 'ALL') {
  const take = 50;
  const skip = (page - 1) * take;

  const andClauses: any[] = [{ state }];

  if (statusFilter === 'ACTIVE') {
    andClauses.push({ isActive: true });
  } else if (statusFilter === 'INACTIVE') {
    andClauses.push({ isActive: false });
  }

  if (phleboFilter === 'ASSIGNED') {
    andClauses.push({
      OR: [
        { phleboName: { not: null } },
        { phlebos: { not: Prisma.AnyNull } } 
      ]
    });
  } else if (phleboFilter === 'UNASSIGNED') {
    andClauses.push({
      AND: [
        { phleboName: null },
        { phlebos: { equals: Prisma.AnyNull } }
      ]
    });
  }

  if (search) {
    andClauses.push({
      OR: [
        { pincode: { contains: search, mode: 'insensitive' } },
        { officeName: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { division: { contains: search, mode: 'insensitive' } },
      ]
    });
  }

  const whereClause = { AND: andClauses };

  const [locations, total] = await Promise.all([
    prisma.serviceLocation.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { sNo: 'asc' },
    }),
    prisma.serviceLocation.count({ where: whereClause })
  ]);

  return { locations, total, totalPages: Math.ceil(total / take) };
}

export async function updatePhlebo(id: string, phlebos: {name: string, mobile: string}[]) {
  try {
    await prisma.serviceLocation.update({
      where: { id },
      data: {
        phlebos: phlebos && phlebos.length > 0 ? (phlebos as any) : null,
      }
    });
    revalidatePath('/admin/service-areas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkImportServiceLocations(records: any[]) {
  try {
    if (!records || records.length === 0) return { success: false, error: "No records provided" };
    
    const state = records[0].state;
    // Optional: Delete existing records for this state to overwrite
    // await prisma.serviceLocation.deleteMany({ where: { state } });

    // Prisma createMany can handle arrays
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await prisma.serviceLocation.createMany({
        data: batch,
        skipDuplicates: true
      });
    }

    revalidatePath('/admin/service-areas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportAllLocations(state: string) {
  const locations = await prisma.serviceLocation.findMany({
    where: { state },
    orderBy: { sNo: 'asc' },
  });
  return locations;
}

export async function toggleServiceLocationActive(id: string, isActive: boolean) {
  try {
    await prisma.serviceLocation.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath('/admin/service-areas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
