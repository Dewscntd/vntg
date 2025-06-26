// Enhanced search service with fuzzy matching and filters

export interface SearchFilters {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  rating?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'name' | 'rating' | 'newest';
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  inventory_count: number;
  rating?: number;
  relevanceScore: number;
  category?: {
    id: string;
    name: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
  };
  suggestions: string[];
  query: string;
  filters: SearchFilters;
}

export class SearchService {
  private stopWords = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'for',
    'from',
    'has',
    'he',
    'in',
    'is',
    'it',
    'its',
    'of',
    'on',
    'that',
    'the',
    'to',
    'was',
    'will',
    'with',
  ]);

  // Main search function
  async search(
    query: string,
    filters: SearchFilters = {},
    limit = 20,
    offset = 0
  ): Promise<SearchResponse> {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          limit,
          offset,
        }),
      });

      if (response.ok) {
        return await response.json();
      }

      throw new Error('Search request failed');
    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        facets: {
          categories: [],
          priceRanges: [],
          ratings: [],
        },
        suggestions: [],
        query,
        filters,
      };
    }
  }

  // Get search suggestions
  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.suggestions || [];
      }
      return [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  // Track search analytics
  async trackSearch(query: string, results: number, filters?: SearchFilters): Promise<void> {
    // Only track search in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'search',
          sessionId: this.getSessionId(),
          properties: {
            query,
            results,
            filters,
          },
        }),
      });
    } catch (error) {
      console.error('Search tracking error:', error);
    }
  }

  // Client-side fuzzy search for cached results
  fuzzySearch(items: any[], query: string, fields: string[]): any[] {
    if (!query.trim()) return items;

    const searchTerms = this.tokenize(query.toLowerCase());

    return items
      .map((item) => ({
        ...item,
        relevanceScore: this.calculateRelevance(item, searchTerms, fields),
      }))
      .filter((item) => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Tokenize search query
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && !this.stopWords.has(word));
  }

  // Calculate relevance score
  private calculateRelevance(item: any, searchTerms: string[], fields: string[]): number {
    let score = 0;

    for (const field of fields) {
      const fieldValue = this.getNestedValue(item, field);
      if (!fieldValue) continue;

      const fieldText = fieldValue.toString().toLowerCase();
      const fieldTokens = this.tokenize(fieldText);

      for (const term of searchTerms) {
        // Exact match
        if (fieldText.includes(term)) {
          score += 10;
        }

        // Word boundary match
        for (const token of fieldTokens) {
          if (token === term) {
            score += 8;
          } else if (token.startsWith(term)) {
            score += 5;
          } else if (token.includes(term)) {
            score += 3;
          } else if (this.levenshteinDistance(token, term) <= 2) {
            score += 2;
          }
        }
      }

      // Boost for title/name fields
      if (field.includes('name') || field.includes('title')) {
        score *= 1.5;
      }
    }

    return score;
  }

  // Get nested object value
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Calculate Levenshtein distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Apply filters to search results
  applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = [...results];

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((item) => filters.categories!.includes(item.category_id));
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered.filter((item) => item.price >= min && item.price <= max);
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter((item) => item.inventory_count > 0);
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter((item) => (item.rating || 0) >= filters.rating!);
    }

    // Sort results
    if (filters.sortBy) {
      filtered = this.sortResults(filtered, filters.sortBy);
    }

    return filtered;
  }

  // Sort search results
  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    const sorted = [...results];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id)); // Assuming newer IDs are larger
      case 'relevance':
      default:
        return sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  // Generate search suggestions based on query
  generateSuggestions(query: string, products: any[]): string[] {
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Add exact matches and partial matches
    for (const product of products) {
      const name = product.name.toLowerCase();

      if (name.includes(queryLower)) {
        suggestions.add(product.name);
      }

      // Add word-based suggestions
      const words = name.split(' ');
      for (const word of words) {
        if (word.startsWith(queryLower) && word.length > queryLower.length) {
          suggestions.add(word);
        }
      }
    }

    return Array.from(suggestions).slice(0, 5);
  }

  // Get session ID for analytics
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('searchSessionId');
      if (!sessionId) {
        sessionId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('searchSessionId', sessionId);
      }
      return sessionId;
    }
    return 'server_session';
  }

  // Build search URL with filters
  buildSearchUrl(query: string, filters: SearchFilters): string {
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (filters.categories?.length) params.set('categories', filters.categories.join(','));
    if (filters.priceRange) {
      params.set('minPrice', filters.priceRange.min.toString());
      params.set('maxPrice', filters.priceRange.max.toString());
    }
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.rating) params.set('rating', filters.rating.toString());
    if (filters.sortBy) params.set('sort', filters.sortBy);

    return `/search?${params.toString()}`;
  }

  // Parse search URL to extract query and filters
  parseSearchUrl(url: string): { query: string; filters: SearchFilters } {
    const urlObj = new URL(url, 'http://localhost');
    const params = urlObj.searchParams;

    const query = params.get('q') || '';
    const filters: SearchFilters = {};

    if (params.get('categories')) {
      filters.categories = params.get('categories')!.split(',');
    }

    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    if (minPrice && maxPrice) {
      filters.priceRange = {
        min: parseFloat(minPrice),
        max: parseFloat(maxPrice),
      };
    }

    if (params.get('inStock') === 'true') {
      filters.inStock = true;
    }

    const rating = params.get('rating');
    if (rating) {
      filters.rating = parseFloat(rating);
    }

    const sortBy = params.get('sort');
    if (sortBy) {
      filters.sortBy = sortBy as any;
    }

    return { query, filters };
  }
}

// Create singleton instance
export const searchService = new SearchService();

// Utility functions
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) return text;

  const terms = query.toLowerCase().split(/\s+/);
  let highlighted = text;

  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }

  return highlighted;
}

export function formatSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

export function getSearchResultsText(total: number, query: string): string {
  if (total === 0) {
    return `No results found for "${query}"`;
  }

  const resultsText = total === 1 ? 'result' : 'results';
  return `${total.toLocaleString()} ${resultsText} for "${query}"`;
}
