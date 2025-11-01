'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';

const testimonials = [
  {
    name: 'נועה לוי',
    role: 'חובבת וינטג׳',
    avatar: 'https://via.placeholder.com/100x100?text=NL',
    content:
      'מצאתי ב-Peakees את מעיל הג׳ינס המושלם. הוא מרגיש כמו חדש והפך לפריט שאני לא מורידה. כיף לדעת שאני קונה באופן מקיים.',
    rating: 5,
    initials: 'NL',
  },
  {
    name: 'עמית כהן',
    role: 'פעיל סביבה',
    avatar: 'https://via.placeholder.com/100x100?text=AK',
    content:
      'כמי שמנסה להפחית צריכה, Peakees היא בדיוק מה שחיפשתי. כל רכישה נותנת חיים חדשים לפריטים איכותיים ומיוחדים.',
    rating: 5,
    initials: 'AK',
  },
  {
    name: 'שרית אברמוב',
    role: 'אספנית וינטג׳',
    avatar: 'https://via.placeholder.com/100x100?text=SA',
    content:
      'האוצרות של Peakees מדויקת. מצאתי פריטי אספנות נדירים שלא ראיתי בשום מקום אחר. האיכות והאותנטיות פשוט מרשימות.',
    rating: 5,
    initials: 'SA',
  },
  {
    name: 'דניאל פרידמן',
    role: 'בלוגרית סטייל',
    avatar: 'https://via.placeholder.com/100x100?text=DF',
    content:
      'Peakees היא הכתובת שלי למציאות ייחודיות. יש מגוון מטורף – מפריטי בסיס ועד פריטי הצהרה, והחוויה באתר נעימה וקלה.',
    rating: 5,
    initials: 'DF',
  },
  {
    name: 'הילה בן-דוד',
    role: 'מנהלת מוצר',
    avatar: 'https://via.placeholder.com/100x100?text=HB',
    content:
      'אני אוהבת למצוא פריטים מקצועיים ומיוחדים למשרד. Peakees נותנת לי להתלבש אחרת ועדיין להישאר אלגנטית.',
    rating: 5,
    initials: 'HB',
  },
  {
    name: 'רן ואילת צור',
    role: 'הורים מודעי סביבה',
    avatar: 'https://via.placeholder.com/100x100?text=RC',
    content:
      'לקנות לילדים דרך Peakees זה תענוג. בגדים איכותיים עם אופי, ואנחנו גם מלמדים אותם על צריכה אחראית.',
    rating: 5,
    initials: 'RC',
  },
];

export function SocialProof() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title="מה הלקוחות שלנו מספרים"
          subtitle="הצטרפו לאלפי משפחות שכבר מצאו את הפריט האהוב הבא שלהן ב-Peakees"
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="relative h-full overflow-hidden border-0 shadow-lg"
                data-reveal
              >
                <CardContent className="p-6 text-right">
                  {/* Quote Icon */}
                  <Quote className="mb-4 h-8 w-8 text-primary/20" />

                  {/* Rating */}
                  <div className="mb-4 flex items-center justify-end gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    „{testimonial.content}”
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex flex-row-reverse items-center gap-3 text-right">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="text-xs font-medium">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
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
              <div className="text-sm text-muted-foreground">דירוג לקוחות</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">2-3 ימים</div>
              <div className="text-sm text-muted-foreground">זמן משלוח ממוצע</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">30 ימים</div>
              <div className="text-sm text-muted-foreground">מדיניות החזרה</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">תמיכת לקוחות</div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
