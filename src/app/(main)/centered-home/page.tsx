import CenteredHeroBanner from '@/components/CenteredHeroBanner/CenteredHeroBanner';
import AboutSection from '@/components/AboutSection/AboutSection';
import BookingFormSection from '@/components/BookingFormSection/BookingFormSection';
import WhatWeDoSection from '@/components/WhatWeDoSection/WhatWeDoSection';
import MembershipFormSection from '@/components/MembershipFormSection/MembershipFormSection';
import HomeHealthcareFormSection from '@/components/HomeHealthcareFormSection/HomeHealthcareFormSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection/WhyChooseUsSection';
import DoorstepSection from '@/components/DoorstepSection/DoorstepSection';
import WorkProcessSection from '@/components/WorkProcessSection/WorkProcessSection';
import ServiceAreasSection from '@/components/ServiceAreasSection/ServiceAreasSection';
import TestimonialSection from '@/components/TestimonialSection/TestimonialSection';
import FaqSection from '@/components/FaqSection/FaqSection';
import ContactSection from '@/components/ContactSection/ContactSection';
import StatsSection from '@/components/StatsSection/StatsSection';

export default function CenteredHome() {
  return (
    <main>
      <CenteredHeroBanner />
      {/* We add a small wrapper to handle the overlap gracefully if WhatWeDoSection starts immediately */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <WhatWeDoSection />
      </div>
      <AboutSection />
      <BookingFormSection />
      <MembershipFormSection />
      <HomeHealthcareFormSection />
      <WhyChooseUsSection />
      <DoorstepSection />
      <WorkProcessSection />
      <ServiceAreasSection />
      <TestimonialSection />
      <FaqSection />
      <ContactSection />
      <StatsSection />
    </main>
  );
}

