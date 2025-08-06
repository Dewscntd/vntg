'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  israeliBrands,
  searchBrands,
  getBrandDisplayName,
  Brand,
  getPopularBrands,
} from '@/lib/data/israeli-brands';
import { useTranslations } from '@/lib/hooks/use-translations';

interface BrandSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  category?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function BrandSelector({
  value,
  onValueChange,
  category,
  placeholder,
  className,
  required,
  disabled,
}: BrandSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isHebrew } = useTranslations();

  // Filter brands based on category and search
  const filteredBrands = useMemo(() => {
    return searchBrands(searchQuery, category);
  }, [searchQuery, category]);

  // Get popular brands for the category
  const popularBrands = useMemo(() => {
    const popular = getPopularBrands();
    return category
      ? popular.filter((brand) => brand.category.includes(category))
      : popular.slice(0, 10);
  }, [category]);

  // Find selected brand
  const selectedBrand = israeliBrands.find((brand) => brand.name === value);

  const handleSelect = (brandName: string) => {
    onValueChange?.(brandName);
    setOpen(false);
    setSearchQuery('');
  };

  const displayValue = selectedBrand
    ? getBrandDisplayName(selectedBrand, isHebrew)
    : placeholder || (isHebrew ? 'בחר מותג' : 'Select brand');

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', !value && 'text-muted-foreground')}
            disabled={disabled}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align={isHebrew ? 'end' : 'start'}>
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={isHebrew ? 'חפש מותג...' : 'Search brands...'}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 focus:ring-0"
              />
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>{isHebrew ? 'לא נמצאו מותגים' : 'No brands found'}</CommandEmpty>

              {/* Popular Brands */}
              {!searchQuery && popularBrands.length > 0 && (
                <CommandGroup heading={isHebrew ? 'מותגים פופולריים' : 'Popular Brands'}>
                  {popularBrands.map((brand) => (
                    <CommandItem
                      key={`popular-${brand.name}`}
                      value={brand.name}
                      onSelect={() => handleSelect(brand.name)}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4',
                          value === brand.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="truncate">{getBrandDisplayName(brand, isHebrew)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* All Brands */}
              <CommandGroup
                heading={
                  searchQuery
                    ? isHebrew
                      ? 'תוצאות חיפוש'
                      : 'Search Results'
                    : isHebrew
                      ? 'כל המותגים'
                      : 'All Brands'
                }
              >
                {filteredBrands.map((brand) => (
                  <CommandItem
                    key={brand.name}
                    value={brand.name}
                    onSelect={() => handleSelect(brand.name)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Check
                      className={cn('h-4 w-4', value === brand.name ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">{getBrandDisplayName(brand, isHebrew)}</span>
                    <span className="text-xs text-muted-foreground">
                      {brand.category.join(', ')}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Manual Entry Option */}
              <CommandGroup heading={isHebrew ? 'אחר' : 'Other'}>
                <CommandItem
                  onSelect={() => {
                    const customBrand = searchQuery.trim();
                    if (customBrand) {
                      handleSelect(customBrand);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4 opacity-0" />
                  <span className="text-muted-foreground">
                    {searchQuery
                      ? isHebrew
                        ? `הוסף "${searchQuery}"`
                        : `Add "${searchQuery}"`
                      : isHebrew
                        ? 'הכנס מותג אחר...'
                        : 'Enter custom brand...'}
                  </span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Simple brand input with autocomplete suggestions
 */
interface BrandInputProps {
  value?: string;
  onChange?: (value: string) => void;
  category?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function BrandInput({
  value = '',
  onChange,
  category,
  placeholder,
  className,
  required,
  disabled,
}: BrandInputProps) {
  const [suggestions, setSuggestions] = useState<Brand[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isHebrew } = useTranslations();

  const handleInputChange = (inputValue: string) => {
    onChange?.(inputValue);

    if (inputValue.length > 0) {
      const results = searchBrands(inputValue, category).slice(0, 8);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (brand: Brand) => {
    onChange?.(brand.name);
    setShowSuggestions(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder || (isHebrew ? 'הכנס מותג...' : 'Enter brand...')}
        required={required}
        disabled={disabled}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onFocus={() =>
          value.length > 0 && setSuggestions(searchBrands(value, category).slice(0, 8))
        }
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {suggestions.map((brand) => (
            <button
              key={brand.name}
              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-100"
              onClick={() => handleSuggestionClick(brand)}
              type="button"
            >
              <span>{getBrandDisplayName(brand, isHebrew)}</span>
              {brand.popular && <Star className="h-3 w-3 text-yellow-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrandSelector;
