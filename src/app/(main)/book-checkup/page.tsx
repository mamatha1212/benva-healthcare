import React, { Suspense } from 'react';
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
    <div className="book-checkup-layout">
      <div className="book-checkup-form-side">
        <Suspense fallback={<div>Loading form...</div>}>
          <BookCheckupClient availablePackages={allPackages} initialLocations={locations} />
        </Suspense>
      </div>
      <div className="book-checkup-image-side"></div>

      <style>{`
        .book-checkup-layout {
          display: flex;
          min-height: calc(100vh - 80px);
          background: #000000;
        }
        .book-checkup-form-side {
          flex: 1 1 50%;
          padding: 60px 40px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow-y: auto;
        }
        .book-checkup-image-side {
          flex: 1 1 50%;
          background-image: url(/images/ai-bg.png);
          background-size: cover;
          background-position: center;
          border-top-left-radius: 40px;
          border-bottom-left-radius: 40px;
          box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        }
        @media (max-width: 768px) {
          .book-checkup-layout {
            flex-direction: column;
          }
          .book-checkup-form-side {
            flex: unset;
            width: 100%;
            padding: 32px 16px;
          }
          .book-checkup-image-side {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
