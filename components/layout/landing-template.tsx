'use client';

import { cn } from '@/lib/utils';
import { LandingHeader } from './landing-header';
import { Footer } from './footer';

export interface LandingTemplateProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function LandingTemplate({ 
  children, 
  className, 
  showHeader = true,
  showFooter = true 
}: LandingTemplateProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {showHeader && <LandingHeader />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}