import HeroBanner from '@/components/HeroBanner/HeroBanner';
import VolunteerSection from '@/components/VolunteerSection/VolunteerSection';
import AboutSection from '@/components/AboutSection/AboutSection';
import PremiumCheckupSection from '@/components/PremiumCheckupSection/PremiumCheckupSection';
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

export default function Home() {
  return (
    <main>
      <HeroBanner />
      <WhatWeDoSection />
      <AboutSection />
      <PremiumCheckupSection />
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

