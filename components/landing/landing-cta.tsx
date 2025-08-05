'use client';

import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { ScrollReveal, TextReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveH2, ResponsiveLead } from '@/components/ui/responsive-typography';

export function LandingCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <ScrollReveal animation="fadeIn" delay={200}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">Ready to Start Your Vintage Journey?</span>
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
              Your Perfect Vintage Piece is Waiting
            </ResponsiveH2>
          </TextReveal>

          {/* Supporting Text */}
          <ScrollReveal animation="fadeIn" delay={400}>
            <ResponsiveLead size="lg" className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of fashion-forward individuals who've discovered the joy of sustainable, 
              unique style. Start exploring our curated collection today.
            </ResponsiveLead>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="group text-lg px-8 py-6" asChild>
                <TransitionLink href="/shop">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  <span>Enter the Shop</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </TransitionLink>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <TransitionLink href="/categories">
                  Browse Categories
                </TransitionLink>
              </Button>
            </div>
          </ScrollReveal>

          {/* Additional Info */}
          <ScrollReveal animation="fadeIn" delay={800}>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Free shipping over $75</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>30-day returns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Secure checkout</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}