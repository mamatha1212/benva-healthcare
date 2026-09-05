import HeroVariant4 from '@/components/HeroVariant4/HeroVariant4';
import AboutSection from '@/components/AboutSection/AboutSection';
import BookingFormSection from '@/components/BookingFormSection/BookingFormSection';
import WhatWeDoSection from '@/components/WhatWeDoSection/WhatWeDoSection';
import MembershipFormSection from '@/components/MembershipFormSection/MembershipFormSection';
import HomeHealthcareFormSection from '@/components/HomeHealthcareFormSection/HomeHealthcareFormSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection/WhyChooseUsSection';
import DoorstepSection from '@/components/DoorstepSection/DoorstepSection';
import WorkProcessSection from '@/components/WorkProcessSection/WorkProcessSection';

import TestimonialSection from '@/components/TestimonialSection/TestimonialSection';
import FaqSection from '@/components/FaqSection/FaqSection';
import ContactSection from '@/components/ContactSection/ContactSection';

export default function Home() {
  return (
    <main>
      <HeroVariant4 />
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

      <TestimonialSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
