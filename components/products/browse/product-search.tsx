'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProducts } from '@/lib/hooks';

export interface ProductSearchProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
}

export function ProductSearch({
  placeholder = 'Search products...',
  className,
  showSuggestions = true,
  onSearch,
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useProducts({
    url:
      debouncedQuery.length >= 2
        ? `/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`
        : undefined,
    cacheKey: `search-suggestions-${debouncedQuery}`,
    enabled: showSuggestions && debouncedQuery.length >= 2 && isOpen,
  });

  const suggestionProducts = suggestions?.products || [];

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsOpen(false);

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Navigate to search page
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', searchQuery.trim());
      router.push(`/search?${params.toString()}`);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (showSuggestions && value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (productName: string) => {
    setQuery(productName);
    handleSearch(productName);
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (showSuggestions && query.length >= 2) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-20"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center space-x-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className="h-7 px-2"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : suggestionProducts.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Suggestions</div>
              {suggestionProducts.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.name)}
                  className="flex w-full items-center space-x-3 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1 truncate">{product.name}</span>
                  {product.category && (
                    <span className="text-xs text-muted-foreground">
                      in {product.category.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No products found for "{debouncedQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
