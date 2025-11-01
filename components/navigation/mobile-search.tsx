'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { microInteractions } from '@/lib/animations/micro-interactions';

export interface MobileSearchProps {
  className?: string;
  placeholder?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'trending';
  count?: number;
}

export function MobileSearch({ className, placeholder = 'חיפוש מוצרים...' }: MobileSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Mock trending searches and suggestions
  const trendingSearches = ['מעילי וינטג׳', 'סניקרס רטרו', 'שעונים קלאסיים', 'תיקי מעצבים', 'דנים יד שנייה'];

  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'מעיל עור וינטג׳', type: 'product', count: 24 },
    { id: '2', text: 'סניקרס רטרו', type: 'product', count: 18 },
    { id: '3', text: 'בגדים', type: 'category', count: 156 },
    { id: '4', text: 'אקססוריז', type: 'category', count: 89 },
    { id: '5', text: 'שעוני וינטג׳', type: 'trending' },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search input changes
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (value.length > 0) {
      // Filter suggestions based on query
      const filtered = mockSuggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter((search) => search !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));

    // Navigate to search results
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'category') {
      router.push(`/categories?search=${encodeURIComponent(suggestion.text)}`);
    } else {
      handleSearch(suggestion.text);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // Handle trigger click with animation
  const handleTriggerClick = () => {
    if (triggerRef.current) {
      microInteractions.buttonPress(triggerRef.current);
    }
    setIsOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          className={cn('touch-manipulation lg:hidden', className)}
          onClick={handleTriggerClick}
          aria-label="פתיחת חיפוש"
        >
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="top"
        className="flex h-full flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query);
                  }
                }}
                placeholder={placeholder}
                className="h-12 touch-manipulation pr-10 pl-4 text-right text-base"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="shrink-0 touch-manipulation"
              aria-label="סגירת חיפוש"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-4">
            {/* Search Suggestions */}
            {query && suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">הצעות לחיפוש</h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex w-full touch-manipulation items-center justify-between rounded-lg p-3 text-right transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{suggestion.text}</span>
                        {suggestion.type === 'category' && (
                          <Badge variant="outline" className="text-xs">
                            קטגוריה
                          </Badge>
                        )}
                        {suggestion.type === 'trending' && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="ml-1 h-3 w-3" />
                            חיפוש חם
                          </Badge>
                        )}
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.count} פריטים
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">חיפושים אחרונים</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ניקוי
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex w-full touch-manipulation items-center gap-3 rounded-lg p-3 text-right transition-colors hover:bg-accent"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {!query && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">חיפושים מובילים</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="inline-flex touch-manipulation items-center gap-1 rounded-full bg-muted px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {query && suggestions.length === 0 && (
              <div className="py-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">לא נמצאו הצעות לחיפוש „{query}”</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(query)}
                  className="mt-4"
                >
                  לחפש בכל זאת
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
