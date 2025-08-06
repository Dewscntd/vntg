'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations, Language } from '@/lib/hooks/use-translations';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function LanguageSelector({
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
}: LanguageSelectorProps) {
  const { language, switchLanguage, isHebrew } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  const handleLanguageChange = (newLanguage: Language) => {
    switchLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLanguage?.flag} {currentLanguage?.nativeName}
            </span>
          )}
          {!showLabel && <span className="text-xs">{currentLanguage?.flag}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isHebrew ? 'start' : 'end'} className="min-w-[150px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer gap-2 ${language === lang.code ? 'bg-accent' : ''}`}
          >
            <span className="text-base">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple flag-only language toggle for mobile/compact layouts
 */
export function LanguageToggle() {
  const { language, switchLanguage } = useTranslations();

  const toggleLanguage = () => {
    switchLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-lg"
      title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
    >
      {language === 'he' ? '🇺🇸' : '🇮🇱'}
    </Button>
  );
}

export default LanguageSelector;
