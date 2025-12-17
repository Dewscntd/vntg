'use client';

import { Shirt, Globe, Sparkles, Calendar, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  getSeasonDisplayName,
  getCareInstructionDisplayName,
  CARE_INSTRUCTIONS,
  SEASONS,
} from '@/lib/data/product-options';
import { useTranslations } from '@/lib/hooks/use-translations';

interface GarmentDetailsProps {
  material?: string | null;
  countryOfOrigin?: string | null;
  careInstructions?: string | null;
  season?: 'spring-summer' | 'fall-winter' | 'all-season' | null;
  collectionYear?: number | null;
  className?: string;
  compact?: boolean;
}

export function GarmentDetails({
  material,
  countryOfOrigin,
  careInstructions,
  season,
  collectionYear,
  className,
  compact = false,
}: GarmentDetailsProps) {
  const { isHebrew } = useTranslations();

  // Check if we have any details to show
  const hasDetails = material || countryOfOrigin || careInstructions || season || collectionYear;

  if (!hasDetails) {
    return null;
  }

  const careIcon =
    careInstructions && CARE_INSTRUCTIONS.find((c) => c.value === careInstructions)?.icon;
  const seasonIcon = season && SEASONS.find((s) => s.value === season)?.icon;

  const details = [
    {
      key: 'material',
      label: isHebrew ? 'חומר' : 'Material',
      value: material,
      icon: Shirt,
      show: !!material,
    },
    {
      key: 'origin',
      label: isHebrew ? 'ארץ ייצור' : 'Made in',
      value: countryOfOrigin,
      icon: Globe,
      show: !!countryOfOrigin,
    },
    {
      key: 'care',
      label: isHebrew ? 'הוראות טיפול' : 'Care',
      value: careInstructions ? getCareInstructionDisplayName(careInstructions, isHebrew) : null,
      emoji: careIcon,
      icon: Sparkles,
      show: !!careInstructions,
    },
    {
      key: 'season',
      label: isHebrew ? 'עונה' : 'Season',
      value:
        season && collectionYear
          ? `${getSeasonDisplayName(season, isHebrew)} ${collectionYear}`
          : season
            ? getSeasonDisplayName(season, isHebrew)
            : null,
      emoji: seasonIcon,
      icon: Calendar,
      show: !!(season || collectionYear),
    },
  ].filter((detail) => detail.show);

  if (details.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn('space-y-2 rounded-lg border bg-muted/30 p-4', className)}>
        {details.map((detail, index) => (
          <div key={detail.key} className="flex items-center gap-2 text-sm">
            {detail.emoji ? (
              <span className="text-base">{detail.emoji}</span>
            ) : (
              <detail.icon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-muted-foreground">{detail.label}:</span>
            <span className="text-foreground">{detail.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wind className="h-5 w-5" />
          {isHebrew ? 'פרטי הבגד' : 'Garment Details'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.map((detail, index) => (
          <div key={detail.key}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {detail.emoji ? (
                  <span className="text-xl">{detail.emoji}</span>
                ) : (
                  <detail.icon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-muted-foreground">{detail.label}</span>
              </div>
              <Badge variant="secondary" className="text-sm font-medium">
                {detail.value}
              </Badge>
            </div>
            {index < details.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default GarmentDetails;
