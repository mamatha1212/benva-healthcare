import React from 'react';
import { Metadata } from 'next';
import AboutHeroBanner from '@/components/AboutHeroBanner/AboutHeroBanner';
import AboutStorySection from '@/components/AboutStorySection/AboutStorySection';
import VisionMissionSection from '@/components/VisionMissionSection/VisionMissionSection';

export const metadata: Metadata = {
  title: 'About Us | BENVA Healthcare',
  description: 'Learn more about BENVA Healthcare, our mission, values, and the comprehensive healthcare services we offer across Andhra Pradesh & Telangana.',
};

export default function AboutPage() {
  return (
    <main>
      <AboutHeroBanner />
      <AboutStorySection />
      <VisionMissionSection />
    </main>
  );
}
