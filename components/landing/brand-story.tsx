'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { Heart, Leaf, Users, ArrowRight } from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';
import { ResponsiveH2, ResponsiveLead } from '@/components/ui/responsive-typography';

export function BrandStory() {
  return (
    <section id="story" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title="The VNTG Story"
          subtitle="Born from a passion for sustainable fashion and the belief that every piece of clothing has a story worth telling"
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Story Content */}
            <div className="space-y-6" data-reveal>
              <div className="space-y-4">
                <ResponsiveLead className="text-foreground">
                  We started VNTG because we believe fashion should be personal, sustainable, and
                  timeless.
                </ResponsiveLead>
                <p className="leading-relaxed text-muted-foreground">
                  In a world of fast fashion, we curate vintage and second-hand pieces that have
                  character, history, and quality craftsmanship. Each item in our collection is
                  carefully selected not just for its style, but for its story and potential to
                  become part of your unique narrative.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  From timeless denim jackets to elegant vintage dresses, from rare books to classic
                  games—we believe in offering pieces that transcend trends and speak to individual
                  style and values.
                </p>
              </div>

              <Button className="group" asChild>
                <TransitionLink href="/about">
                  <span>Read Our Full Story</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </TransitionLink>
              </Button>
            </div>

            {/* Values Grid */}
            <div className="grid gap-6 sm:grid-cols-2" data-reveal>
              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Sustainable</h3>
                  <p className="text-sm text-muted-foreground">
                    Giving pre-loved fashion a second life reduces waste and environmental impact.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold">Curated</h3>
                  <p className="text-sm text-muted-foreground">
                    Every piece is hand-selected for quality, style, and authenticity.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Inclusive</h3>
                  <p className="text-sm text-muted-foreground">
                    Fashion for everyone—men, women, teens, kids, and beyond.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Unique</h3>
                  <p className="text-sm text-muted-foreground">
                    Find one-of-a-kind pieces that express your individual style.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
