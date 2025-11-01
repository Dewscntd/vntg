'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMagneticButton } from '@/lib/hooks/use-enhanced-interactions';

export interface LandingHeaderProps {
  className?: string;
}

export function LandingHeader({ className }: LandingHeaderProps) {
  const logoRef = useMagneticButton<HTMLAnchorElement>(0.2);

  return (
    <header className={cn('absolute left-0 right-0 top-0 z-50 w-full bg-transparent', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2" ref={logoRef}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/90 backdrop-blur-sm transition-all group-hover:bg-primary">
              <span className="text-xl font-bold text-primary-foreground">P</span>
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Peakees
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#story" className="text-sm font-medium transition-colors hover:text-primary">
              הסיפור שלנו
            </a>
            <TransitionLink
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              על Peakees
            </TransitionLink>
            <TransitionLink
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              צור קשר
            </TransitionLink>
          </nav>

          {/* CTA Button */}
          <Button className="group" asChild>
            <TransitionLink href="/shop">
              <ShoppingBag className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">לבקר בחנות</span>
              <span className="sm:hidden">חנות</span>
            </TransitionLink>
          </Button>
        </div>
      </div>
    </header>
  );
}
