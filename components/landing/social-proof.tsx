'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';
import { useTranslations } from 'next-intl';

const testimonials = [
  {
    key: 'sarah',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    initials: 'SJ',
  },
  {
    key: 'michael',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    initials: 'MC',
  },
  {
    key: 'emma',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    initials: 'ER',
  },
  {
    key: 'david',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    initials: 'DP',
  },
  {
    key: 'lisa',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    initials: 'LW',
  },
  {
    key: 'alex',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    initials: 'AT',
  },
];

export function SocialProof() {
  const t = useTranslations('landing.socialProof');

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title={t('title')}
          subtitle={t('subtitle')}
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.key}
                className="relative h-full overflow-hidden border-0 shadow-lg"
                data-reveal
              >
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="mb-4 h-8 w-8 text-primary/20" />

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    "{t(`testimonials.${testimonial.key}.content`)}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={t(`testimonials.${testimonial.key}.name`)}
                      />
                      <AvatarFallback className="text-xs font-medium">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {t(`testimonials.${testimonial.key}.name`)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t(`testimonials.${testimonial.key}.role`)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid gap-8 text-center sm:grid-cols-4" data-reveal>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">{t('stats.rating')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">2-3 Days</div>
              <div className="text-sm text-muted-foreground">{t('stats.delivery')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">30 Days</div>
              <div className="text-sm text-muted-foreground">{t('stats.returns')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">{t('stats.support')}</div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
