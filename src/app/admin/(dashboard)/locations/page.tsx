import React from 'react';
import { prisma } from '@/lib/prisma';
import LocationsView from './LocationsView';

export default async function LocationsPage() {
  const states = await prisma.state.findMany({
    include: {
      districts: {
        include: {
          areas: true
        },
        orderBy: {
          name: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <LocationsView states={states} />
  );
}
