import type { Metadata } from 'next';
import HomeHealthcareSection from '@/components/HomeHealthcareSection/HomeHealthcareSection';
import HomeHealthcareFormSection from '@/components/HomeHealthcareFormSection/HomeHealthcareFormSection';

export const metadata: Metadata = {
  title: 'Home Healthcare Services | BENVA Healthcare',
  description:
    'Professional healthcare support delivered at your doorstep — BP check, sugar monitoring, nurse visits, physiotherapy, elder care and more across Andhra Pradesh & Telangana.',
};

export default function HomeHealthcarePage() {
  return (
    <main>
      <HomeHealthcareSection />
      {/* Form modal — opens on "Book a Service" click */}
      <HomeHealthcareFormSection />
    </main>
  );
}
