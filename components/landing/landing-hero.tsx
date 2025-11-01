'use client';

import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal, TextReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveDisplay, ResponsiveLead } from '@/components/ui/responsive-typography';

export function LandingHero() {
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
              <span className="font-medium">אופנת יד שנייה נבחרת</span>
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
              אופנה מחודשת שמספרת את הסיפור שלכם
            </ResponsiveDisplay>
          </TextReveal>

          {/* Subheading */}
          <ScrollReveal animation="fadeIn" delay={400}>
            <ResponsiveLead size="lg" className="mx-auto max-w-2xl text-muted-foreground">
              לכל פריט ב-Peakees יש עבר. גלו אופנה מקיימת וחד-פעמית שמתאימה בדיוק לסיפור שלכם – מפריטי בסיס על-זמניים ועד פריטים צבעוניים שמושכים תשומת לב.
            </ResponsiveLead>
          </ScrollReveal>

          {/* Key Value Points */}
          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>אופנה מקיימת</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>אוצרות איכותית</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>פריטים חד-פעמיים</span>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal animation="fadeIn" delay={800}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="group" asChild>
                <TransitionLink href="/shop">
                  <span>לגלות את הקולקציה</span>
                  <ArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </TransitionLink>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <TransitionLink href="#story">להכיר את Peakees</TransitionLink>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollReveal animation="fadeIn" delay={1200}>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-wider">גללו להמשך</span>
            <div className="h-6 w-0.5 animate-pulse bg-current"></div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
