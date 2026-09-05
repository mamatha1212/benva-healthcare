import SplitHeroBanner from '@/components/SplitHeroBanner/SplitHeroBanner';
import AboutSection from '@/components/AboutSection/AboutSection';
import PremiumCheckupSection from '@/components/PremiumCheckupSection/PremiumCheckupSection';
import BookingFormSection from '@/components/BookingFormSection/BookingFormSection';
import WhatWeDoSection from '@/components/WhatWeDoSection/WhatWeDoSection';
import ServicesGridSection from '@/components/ServicesGridSection/ServicesGridSection';
import MembershipFormSection from '@/components/MembershipFormSection/MembershipFormSection';
import HomeHealthcareFormSection from '@/components/HomeHealthcareFormSection/HomeHealthcareFormSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection/WhyChooseUsSection';
import DoorstepSection from '@/components/DoorstepSection/DoorstepSection';
import WorkProcessSection from '@/components/WorkProcessSection/WorkProcessSection';

import TestimonialSection from '@/components/TestimonialSection/TestimonialSection';
import FaqSection from '@/components/FaqSection/FaqSection';
import ContactSection from '@/components/ContactSection/ContactSection';

export default function VariantHome() {
  return (
    <main>
      <SplitHeroBanner />
      <WhatWeDoSection />
      <AboutSection />
      <PremiumCheckupSection />
      <ServicesGridSection />
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

