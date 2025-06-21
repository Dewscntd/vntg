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

export function MobileSearch({ className, placeholder = 'Search products...' }: MobileSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Mock trending searches and suggestions
  const trendingSearches = [
    'vintage jackets',
    'retro sneakers',
    'classic watches',
    'designer bags',
    'vintage denim'
  ];

  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'vintage leather jacket', type: 'product', count: 24 },
    { id: '2', text: 'retro sneakers', type: 'product', count: 18 },
    { id: '3', text: 'Clothing', type: 'category', count: 156 },
    { id: '4', text: 'Accessories', type: 'category', count: 89 },
    { id: '5', text: 'vintage watches', type: 'trending' },
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
      const filtered = mockSuggestions.filter(suggestion =>
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
      ...recentSearches.filter(search => search !== searchQuery)
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
          className={cn('lg:hidden touch-manipulation', className)}
          onClick={handleTriggerClick}
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent 
        side="top" 
        className="h-full p-0 flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-4 pb-0">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                className="pl-10 pr-4 h-12 text-base touch-manipulation"
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
              className="touch-manipulation shrink-0"
              aria-label="Close search"
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
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Suggestions
                </h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-accent transition-colors touch-manipulation"
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{suggestion.text}</span>
                        {suggestion.type === 'category' && (
                          <Badge variant="outline" className="text-xs">
                            Category
                          </Badge>
                        )}
                        {suggestion.type === 'trending' && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.count} items
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
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Recent Searches
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-accent transition-colors touch-manipulation"
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
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-full bg-muted hover:bg-accent transition-colors touch-manipulation"
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
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No suggestions found for "{query}"
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(query)}
                  className="mt-4"
                >
                  Search anyway
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
