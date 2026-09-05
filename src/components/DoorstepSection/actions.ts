'use server';

import { prisma } from '@/lib/prisma';

export async function getAreas() {
  try {
    const areas = await prisma.area.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });
    return areas.map(a => a.name);
  } catch (error) {
    console.error('Failed to fetch areas:', error);
    return [];
  }
}

export async function getLocationsHierarchy() {
  try {
    const states = await prisma.state.findMany({
      include: {
        districts: {
          include: {
            areas: true
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    return states;
  } catch (error) {
    console.error('Failed to fetch locations hierarchy:', error);
    return [];
  }
}
