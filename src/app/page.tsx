import Navbar from '@/components/Navbar/Navbar';
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import VolunteerSection from '@/components/VolunteerSection/VolunteerSection';
import AboutSection from '@/components/AboutSection/AboutSection';
import WhatWeDoSection from '@/components/WhatWeDoSection/WhatWeDoSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection/WhyChooseUsSection';
import StatsSection from '@/components/StatsSection/StatsSection';
import CausesSection from '@/components/CausesSection/CausesSection';
import DoorstepSection from '@/components/DoorstepSection/DoorstepSection';
import WorkProcessSection from '@/components/WorkProcessSection/WorkProcessSection';
import TeamSection from '@/components/TeamSection/TeamSection';
import TestimonialSection from '@/components/TestimonialSection/TestimonialSection';
import EventsSection from '@/components/EventsSection/EventsSection';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroBanner />
      <VolunteerSection />
      <AboutSection />
      <WhatWeDoSection />
      <DoorstepSection />
      <WorkProcessSection />
      <TestimonialSection />
      <TeamSection />
      <CausesSection />
      <WhyChooseUsSection />
      <StatsSection />
      <EventsSection />
      <Footer />
    </main>
  );
}
