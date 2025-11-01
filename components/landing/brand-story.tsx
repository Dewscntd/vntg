'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { Heart, Leaf, Users, ArrowRight } from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';
import { ResponsiveH2, ResponsiveLead } from '@/components/ui/responsive-typography';

export function BrandStory() {
  return (
    <section id="story" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title="הסיפור של Peakees"
          subtitle="נולד מאהבה לקיימות ולהאמונה שלכל פריט יד שנייה יש נשמה שראוי לחלוק"
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Story Content */}
            <div className="space-y-6" data-reveal>
              <div className="space-y-4">
                <ResponsiveLead className="text-foreground">
                  התחלנו את Peakees כדי להוכיח שאפשר ליהנות מאופנה אישית, מקיימת ומלאת משמעות.
                </ResponsiveLead>
                <p className="leading-relaxed text-muted-foreground">
                  בעולם של אופנה מהירה, אנחנו בוחרים בקפידה פריטי יד שנייה עם אופי, היסטוריה ואיכות.
                  כל פריט נבחר לא רק לפי הסטייל, אלא גם לפי הסיפור והפוטנציאל שלו להפוך לחלק מהמסע האישי שלכם.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  ממעילי ג'ינס על-זמניים ועד שמלות ערב, מספרים נדירים ועד משחקי ילדות קלאסיים – אנחנו מאמינים בפריטים שעוברים מדור לדור ומתחברים לערכים של כל משפחה.
                </p>
              </div>

              <Button className="group" asChild>
                <TransitionLink href="/about">
                  <span>לקרוא את הסיפור המלא</span>
                  <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </TransitionLink>
              </Button>
            </div>

            {/* Values Grid */}
            <div className="grid gap-6 sm:grid-cols-2" data-reveal>
              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">קיימות</h3>
                  <p className="text-sm text-muted-foreground">
                    לכל פריט יש הזדמנות שנייה – וכך אנחנו מצמצמים בזבוז ומשפיעים לטובה על הסביבה המקומית.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold">אוצרות אישית</h3>
                  <p className="text-sm text-muted-foreground">
                    כל פריט עובר ידיים אוהבות ובדיקה קפדנית כדי להבטיח איכות, אותנטיות והתאמה למשפחות בישראל.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">לכל המשפחה</h3>
                  <p className="text-sm text-muted-foreground">
                    אופנה לכל גיל ומידה – נשים, גברים, נוער וילדים – כי קהילה מתחילה בבית.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 p-6 shadow-lg">
                <CardContent className="space-y-3 p-0 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">ייחודיות</h3>
                  <p className="text-sm text-muted-foreground">
                    למצוא את הפריט החד-פעמי שמספר את הסיפור שלכם ומוסיף צבע לארון.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
