export const dynamic = 'force-dynamic';

import { LandingTemplate } from '@/components/layout/landing-template';
import { LandingHero } from '@/components/landing/landing-hero';
import { BrandStory } from '@/components/landing/brand-story';
import { ValuePropositions } from '@/components/landing/value-propositions';
import { SocialProof } from '@/components/landing/social-proof';
import { LandingCTA } from '@/components/landing/landing-cta';

export default function LandingPage() {
  return (
    <LandingTemplate className="bg-background">
      <LandingHero />
      <BrandStory />
      <ValuePropositions />
      <SocialProof />
      <LandingCTA />
    </LandingTemplate>
  );
}
