'use client';

import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal, TextReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveDisplay, ResponsiveLead } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';

export function LandingHero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="space-y-8">
          {/* Brand Badge */}
          <ScrollReveal animation="fadeIn" delay={200}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">{t('badge')}</span>
            </div>
          </ScrollReveal>

          {/* Main Headline */}
          <TextReveal>
            <ResponsiveDisplay
              size="lg"
              gradient
              gradientFrom="from-foreground"
              gradientTo="to-foreground/80"
              className="mx-auto max-w-4xl leading-tight"
            >
              {t('headline')}
            </ResponsiveDisplay>
          </TextReveal>

          {/* Subheading */}
          <ScrollReveal animation="fadeIn" delay={400}>
            <ResponsiveLead size="lg" className="mx-auto max-w-2xl text-muted-foreground">
              {t('subheading')}
            </ResponsiveLead>
          </ScrollReveal>

          {/* Key Value Points */}
          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>{t('valuePoints.sustainable')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>{t('valuePoints.quality')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>{t('valuePoints.unique')}</span>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal animation="fadeIn" delay={800}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="group" asChild>
                <TransitionLink href="/shop">
                  <span>{t('cta.explore')}</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </TransitionLink>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <TransitionLink href="#story">{t('cta.learn')}</TransitionLink>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollReveal animation="fadeIn" delay={1200}>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-wider">{t('scroll')}</span>
            <div className="h-6 w-0.5 animate-pulse bg-current"></div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
