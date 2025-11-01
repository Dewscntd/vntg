'use client';

import Link from 'next/link';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 text-right">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center justify-end gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">Peakees</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Peakees מחברת בין משפחות וקהילות דרך אופנה יד שנייה איכותית, אוצרות מוקפדת וחוויה מקומית חמה.
            </p>
            <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
              עשוי באהבה <Heart className="mx-1 h-4 w-4 text-red-500" /> לאופנה מקיימת
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">חנות</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <TransitionLink
                href="/shop"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                כל המוצרים
              </TransitionLink>
              <TransitionLink
                href="/categories"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                קטגוריות
              </TransitionLink>
              <TransitionLink
                href="/categories/cat-1"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                אופנה לגברים
              </TransitionLink>
              <TransitionLink
                href="/categories/cat-2"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                אופנה לנשים
              </TransitionLink>
              <TransitionLink
                href="/categories/cat-3"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                סטייל לנוער
              </TransitionLink>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">החברה</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <TransitionLink
                href="/about"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                מי אנחנו
              </TransitionLink>
              <TransitionLink
                href="/contact"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                צור קשר
              </TransitionLink>
              <TransitionLink
                href="/account"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                החשבון שלי
              </TransitionLink>
              <TransitionLink
                href="/tracking"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                מעקב הזמנה
              </TransitionLink>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">להישאר מעודכנים</h3>
            <p className="text-sm text-muted-foreground">
              הצטרפו לניוזלטר וקבלו ראשונים עדכונים על פריטים חדשים ומכירות קהילה.
            </p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input type="email" placeholder="הכניסו כתובת אימייל" className="text-sm" />
                <Button size="sm">הירשמו</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                אנחנו שומרים על הפרטיות שלכם ותמיד תוכלו להסיר את עצמכם מהרשימה.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:gap-6 md:text-right">
              <span>&copy; 2024 Peakees. כל הזכויות שמורות.</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  מדיניות פרטיות
                </Link>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  תנאי שימוש
                </Link>
                <Link href="/returns" className="transition-colors hover:text-foreground">
                  החזרות והחלפות
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>hello@peakees.co.il</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>03-555-1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
