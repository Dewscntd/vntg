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
    title: 'אופנה ידידותית לסביבה',
    description:
      'הורידו את טביעת הרגל הסביבתית עם פריטי יד שנייה איכותיים, מעוצבים ואחראיים.',
    badge: 'קיימות',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Star,
    title: 'איכות ללא פשרות',
    description:
      'כל פריט נבדק ומטופל בקפידה כדי לעמוד בסטנדרטים הגבוהים שלנו של מצב ואותנטיות.',
    badge: 'פרימיום',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Award,
    title: 'מציאות מיוחדות',
    description:
      'לגלות פריטים חד-פעמיים וסיפורים נדירים שלא תמצאו בשום מקום אחר.',
    badge: 'בלעדי',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Truck,
    title: 'משלוח מהיר ובטוח',
    description:
      'משלוח מהיר ואמין עם אריזה קפדנית כדי שהפריטים יגיעו אליכם מושלמים.',
    badge: 'אמינות',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: CreditCard,
    title: 'תשלומים מאובטחים',
    description:
      'חוויית קנייה בטוחה עם מגוון אפשרויות תשלום מותאמות לישראל.',
    badge: 'ביטחון',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: RotateCcw,
    title: 'החזרות קלות',
    description:
      'לא התחברתם? מדיניות ההחזרות הידידותית שלנו מאפשרת לקנות בראש שקט.',
    badge: 'גמישות',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
];

export function ValuePropositions() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title="למה לבחור ב-Peakees?"
          subtitle="אנחנו מחויבים לחוויית קנייה ישראלית יוצאת דופן עם אופנה מקיימת, איכותית ומלאת אופי"
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
              <div className="text-sm text-muted-foreground">פריטים שעברו אוצרות</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">משפחות מרוצות</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">שיעור שביעות רצון</div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
