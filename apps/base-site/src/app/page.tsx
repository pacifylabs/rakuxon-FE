import { AudienceSplit } from '@/sections/AudienceSplit';
import { CapabilityGrid } from '@/sections/CapabilityGrid';
import { CoursePaths } from '@/sections/CoursePaths';
import { DestinationCounts } from '@/sections/DestinationCounts';
import { ClosingCtaBand } from '@/sections/ClosingCtaBand';
import { HomeHero } from '@/sections/HomeHero';
import { HowItWorks } from '@/sections/HowItWorks';
import { MeetInstitutions } from '@/sections/MeetInstitutions';
import { PopularDestinations } from '@/sections/PopularDestinations';
import { StatBar } from '@/sections/StatBar';
import { Testimonials } from '@/sections/Testimonials';
// import { TrustLogoBar } from '@/sections/TrustLogoBar';

/** Statically generated: no data fetching, no product auth, no Cloudinary. */
export const dynamic = 'force-static';

/** Section order follows docs/04b § 3.1 – § 3.10 exactly. */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CoursePaths />
      <CapabilityGrid />
      <DestinationCounts />
      <StatBar />
      <HowItWorks />
      <PopularDestinations />
      <MeetInstitutions />
      <Testimonials />
      <AudienceSplit />
      <ClosingCtaBand />
    </>
  );
}
