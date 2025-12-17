/**
 * Gender Toggle Component
 *
 * Prominent toggle for switching between men's and women's collections.
 * Inspired by COS's minimal design with clean typography.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Gender } from '@/types/shop';
import { useLastGender } from '@/lib/hooks/use-shop-state';

interface GenderToggleProps {
  className?: string;
  currentGender?: Gender;
}

export function GenderToggle({ className, currentGender }: GenderToggleProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const t = useTranslations('shop.gender');
  const { setLastGender } = useLastGender();

  const handleGenderChange = (gender: Gender) => {
    setLastGender(gender);
    router.push(`/${locale}/shop/${gender}`);
  };

  return (
    <div className={cn('flex items-center justify-center gap-1 border-b border-border', className)}>
      <button
        onClick={() => handleGenderChange('women')}
        className={cn(
          'relative px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] transition-colors',
          'hover:text-foreground',
          currentGender === 'women' ? 'text-foreground' : 'text-muted-foreground'
        )}
        aria-current={currentGender === 'women' ? 'page' : undefined}
      >
        {t('women')}
        {currentGender === 'women' && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
        )}
      </button>

      <div className="h-4 w-px bg-border" />

      <button
        onClick={() => handleGenderChange('men')}
        className={cn(
          'relative px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] transition-colors',
          'hover:text-foreground',
          currentGender === 'men' ? 'text-foreground' : 'text-muted-foreground'
        )}
        aria-current={currentGender === 'men' ? 'page' : undefined}
      >
        {t('men')}
        {currentGender === 'men' && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
        )}
      </button>
    </div>
  );
}
