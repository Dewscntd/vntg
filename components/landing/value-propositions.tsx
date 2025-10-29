'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Recycle,
  Star,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Award,
  Clock,
} from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';
import { useTranslations } from 'next-intl';

const benefits = [
  {
    icon: Recycle,
    key: 'ecoFriendly',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Star,
    key: 'quality',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Award,
    key: 'uniqueFinds',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Truck,
    key: 'shipping',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: CreditCard,
    key: 'payments',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: RotateCcw,
    key: 'returns',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
];

export function ValuePropositions() {
  const t = useTranslations('landing.valuePropositions');

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title={t('title')}
          subtitle={t('subtitle')}
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.key}
                  className="h-full border-0 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                  data-reveal
                >
                  <CardHeader className="pb-4 text-center">
                    <div
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${benefit.bgColor}`}
                    >
                      <Icon className={`h-8 w-8 ${benefit.color}`} />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">
                        {t(`benefits.${benefit.key}.badge`)}
                      </Badge>
                      <CardTitle className="text-lg">
                        {t(`benefits.${benefit.key}.title`)}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-center">
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`benefits.${benefit.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid gap-8 text-center sm:grid-cols-3" data-reveal>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.items')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.customers')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.satisfaction')}
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
