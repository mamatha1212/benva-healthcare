import React from 'react';
import HeroVariant1 from '@/components/HeroVariant1/HeroVariant1';
import HeroVariant2 from '@/components/HeroVariant2/HeroVariant2';
import HeroVariant3 from '@/components/HeroVariant3/HeroVariant3';
import HeroVariant4 from '@/components/HeroVariant4/HeroVariant4';
import HeroVariant5 from '@/components/HeroVariant5/HeroVariant5';
import HeroVariant6 from '@/components/HeroVariant6/HeroVariant6';

const Divider = ({ title }: { title: string }) => (
  <div style={{
    width: '100%', 
    background: '#f8fafc', 
    padding: '20px', 
    textAlign: 'center', 
    borderTop: '2px solid #e2e8f0',
    borderBottom: '2px solid #e2e8f0',
  }}>
    <h3 style={{ color: '#334155', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px' }}>
      {title}
    </h3>
  </div>
);

export default function TestHeroPage() {
  return (
    <main>
      <Divider title="Variant 1" />
      <HeroVariant1 />
      
      <Divider title="Variant 2" />
      <HeroVariant2 />
      
      <Divider title="Variant 3" />
      <HeroVariant3 />
      
      <Divider title="Variant 4" />
      <HeroVariant4 />
      
      <Divider title="Variant 5" />
      <HeroVariant5 />
      
      <Divider title="Variant 6" />
      <HeroVariant6 />
    </main>
  );
}
