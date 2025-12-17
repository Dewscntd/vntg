'use client';

import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { ScrollReveal, TextReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveH2, ResponsiveLead } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';

export function LandingCTA() {
  const t = useTranslations('landing.cta');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          {/* Badge */}
          <ScrollReveal animation="fadeIn" delay={200}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">{t('badge')}</span>
            </div>
          </ScrollReveal>

          {/* Main CTA Heading */}
          <TextReveal>
            <ResponsiveH2
              size="xl"
              gradient
              gradientFrom="from-foreground"
              gradientTo="to-foreground/80"
              className="leading-tight"
            >
              {t('headline')}
            </ResponsiveH2>
          </TextReveal>

          {/* Supporting Text */}
          <ScrollReveal animation="fadeIn" delay={400}>
            <ResponsiveLead size="lg" className="mx-auto max-w-2xl text-muted-foreground">
              {t('subheading')}
            </ResponsiveLead>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="group px-8 py-6 text-lg" asChild>
                <TransitionLink href="/shop">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  <span>{t('buttons.shop')}</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </TransitionLink>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
                <TransitionLink href="/categories">{t('buttons.categories')}</TransitionLink>
              </Button>
            </div>
          </ScrollReveal>

          {/* Additional Info */}
          <ScrollReveal animation="fadeIn" delay={800}>
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>{t('info.shipping')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>{t('info.returns')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>{t('info.checkout')}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
