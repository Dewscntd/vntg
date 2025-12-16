'use client';

import { useState } from 'react';
import { Star, Shield, Recycle, Truck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveH2 } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Enthusiast',
    content: 'Found an incredible 90s Carhartt jacket in perfect condition. The curation here is unmatched - every piece feels special.',
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Sustainable Living Advocate',
    content: 'Finally, a vintage store that cares about authenticity. The quality check process gives me confidence in every purchase.',
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Vintage Collector',
    content: 'The selection is incredible. I\'ve found rare pieces here that I couldn\'t find anywhere else. My go-to for unique finds.',
    avatar: 'https://i.pravatar.cc/100?img=5',
    rating: 5,
  },
];

// Benefits data
const benefits = [
  {
    icon: Shield,
    title: 'Authenticity Guaranteed',
    description: 'Every item verified by our experts',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Recycle,
    title: 'Sustainable Choice',
    description: '10,000+ items given new life',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Star,
    title: 'Hand-Curated',
    description: 'Only the best make the cut',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $75',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

function TestimonialCard({ testimonial, isActive }: { testimonial: typeof testimonials[0]; isActive: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center px-4 transition-all duration-500',
        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
      )}
    >
      <Quote className="mb-6 h-10 w-10 text-primary/20" />
      <blockquote className="mb-6 max-w-2xl text-center text-xl font-medium leading-relaxed text-foreground md:text-2xl">
        "{testimonial.content}"
      </blockquote>
      <div className="flex items-center gap-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div className="text-left">
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
      {/* Star Rating */}
      <div className="mt-4 flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    </div>
  );
}

export function TrustSection() {
  const t = useTranslations('landing.trust');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <ScrollReveal animation="fadeIn">
          <div className="mb-16 text-center">
            <ResponsiveH2 size="md" className="mb-4 text-foreground">
              {t('title')}
            </ResponsiveH2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Testimonials Carousel */}
        <ScrollReveal animation="fadeIn" delay={200}>
          <div className="relative mb-20 min-h-[320px] md:min-h-[280px]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                isActive={currentTestimonial === index}
              />
            ))}

            {/* Navigation */}
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      currentTestimonial === index
                        ? 'w-6 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Benefits Grid */}
        <ScrollReveal animation="fadeIn" delay={400}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className={cn('rounded-lg p-2.5', benefit.bgColor)}>
                  <benefit.icon className={cn('h-5 w-5', benefit.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Stats Row */}
        <ScrollReveal animation="fadeIn" delay={600}>
          <div className="mt-16 grid grid-cols-2 gap-8 border-t pt-12 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground md:text-4xl">4.9/5</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('stats.rating')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground md:text-4xl">5,000+</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('stats.customers')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground md:text-4xl">10,000+</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('stats.items')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground md:text-4xl">30 Days</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('stats.returns')}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
