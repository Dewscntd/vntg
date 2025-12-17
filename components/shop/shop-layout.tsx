/**
 * Shop Layout Component
 *
 * Main layout wrapper for shop pages following COS aesthetic.
 * Provides consistent structure with header, gender toggle, and category tabs.
 */

'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Gender } from '@/types/shop';
import { Header } from '@/components/layout/header';
import { GenderToggle } from './gender-toggle';
import { CategoryTabs } from './category-tabs';

interface ShopLayoutProps {
  gender: Gender;
  category?: string;
  children: ReactNode;
}

export function ShopLayout({ gender, category, children }: ShopLayoutProps) {
  const t = useTranslations('shop');

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header with Logo, Search, and Action Icons (minimal variant for shop pages) */}
      <Header variant="minimal" />

      {/* Gender Toggle */}
      <div className="border-b bg-background">
        <GenderToggle currentGender={gender} />
      </div>

      {/* Category Navigation */}
      <CategoryTabs gender={gender} activeCategory={category} />

      {/* Main Content */}
      <main className="mx-auto max-w-[1920px]">{children}</main>
    </div>
  );
}
