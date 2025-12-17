'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { Heart, Leaf, Users, ArrowRight } from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';
import { ResponsiveH2, ResponsiveLead } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';

export function BrandStory() {
  const t = useTranslations('landing.brandStory');

  return (
    <section id="story" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title={t('title')}
          subtitle={t('subtitle')}
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Story Content */}
            <div className="space-y-6" data-reveal>
              <div className="space-y-4">
                <ResponsiveLead className="text-foreground">{t('lead')}</ResponsiveLead>
                <p className="leading-relaxed text-muted-foreground">{t('paragraph1')}</p>
                <p className="leading-relaxed text-muted-foreground">{t('paragraph2')}</p>
              </div>

              <Button className="group" asChild>
                <TransitionLink href="/about">
                  <span>{t('cta')}</span>
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
                  <h3 className="font-semibold">{t('values.sustainable.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('values.sustainable.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold">{t('values.curated.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('values.curated.description')}</p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">{t('values.inclusive.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('values.inclusive.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">{t('values.unique.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('values.unique.description')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
