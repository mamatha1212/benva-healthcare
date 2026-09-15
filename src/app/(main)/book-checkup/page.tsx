import React from 'react';
import BookCheckupClient from './BookCheckupClient';
import { prisma } from '@/lib/prisma';
import { getLocationsHierarchy } from '@/components/DoorstepSection/actions';

export const metadata = {
  title: 'Book Health Checkup | BENVA Healthcare',
  description: 'Book your comprehensive health checkup with BENVA Healthcare today.',
};

export default async function BookCheckupPage() {
  const allPackages = await prisma.healthPackage.findMany({
    select: { title: true, price: true }
  });
  const locations = await getLocationsHierarchy();

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 80px)', 
      background: '#000000' 
    }}>
      <div style={{ 
        flex: '1 1 50%', 
        padding: '60px 40px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <BookCheckupClient availablePackages={allPackages} initialLocations={locations} />
      </div>
      <div style={{ 
        flex: '1 1 50%', 
        backgroundImage: 'url(/images/ai-bg.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        borderTopLeftRadius: '40px',
        borderBottomLeftRadius: '40px',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
      }}></div>
    </div>
  );
}
