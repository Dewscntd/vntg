export const dynamic = 'force-dynamic';

import { LandingTemplate } from '@/components/layout/landing-template';
import { HeroEditorial } from '@/components/landing/hero-editorial';
import { FeaturedProducts } from '@/components/landing/featured-products';
import { CategoryTiles } from '@/components/landing/category-tiles';
import { BrandStory } from '@/components/landing/brand-story';
import { TrustSection } from '@/components/landing/trust-section';
import { NewsletterSignup } from '@/components/landing/newsletter-signup';

export default function LandingPage() {
  return (
    <LandingTemplate className="bg-background">
      {/* Hero with Editorial Product Imagery */}
      <HeroEditorial />

      {/* Featured Products - Just Dropped */}
      <FeaturedProducts />

      {/* Shop by Category Tiles */}
      <CategoryTiles />

      {/* Brand Story - Condensed */}
      <BrandStory />

      {/* Trust Section - Testimonials + Benefits */}
      <TrustSection />

      {/* Newsletter Signup CTA */}
      <NewsletterSignup />
    </LandingTemplate>
  );
}
