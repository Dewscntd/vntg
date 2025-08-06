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

const benefits = [
  {
    icon: Recycle,
    title: 'Eco-Friendly Fashion',
    description:
      "Reduce your environmental footprint with sustainable, pre-loved clothing that's both stylish and responsible.",
    badge: 'Sustainable',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description:
      'Every item is carefully inspected and curated to meet our high standards for condition and authenticity.',
    badge: 'Premium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Award,
    title: 'Unique Finds',
    description:
      "Discover one-of-a-kind vintage pieces and rare items you won't find anywhere else.",
    badge: 'Exclusive',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Truck,
    title: 'Fast & Secure Shipping',
    description:
      'Quick, reliable delivery with secure packaging to ensure your items arrive in perfect condition.',
    badge: 'Reliable',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description:
      'Shop with confidence using our secure payment system with multiple payment options.',
    badge: 'Secure',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description:
      'Not completely satisfied? Our hassle-free return policy ensures you shop with confidence.',
    badge: 'Flexible',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
];

export function ValuePropositions() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title="Why Choose VNTG?"
          subtitle="We're committed to providing an exceptional shopping experience with sustainable, high-quality vintage fashion"
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
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
                        {benefit.badge}
                      </Badge>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-center">
                    <p className="leading-relaxed text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid gap-8 text-center sm:grid-cols-3" data-reveal>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Curated Items</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
