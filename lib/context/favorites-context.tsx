'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from '@/lib/auth/auth-context';

// Types
export interface FavoriteItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    inventory_count: number;
    discount_percent?: number;
  };
}

export interface FavoritesState {
  items: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

export interface FavoritesContextType extends FavoritesState {
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

// Actions
type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEAR_FAVORITES' };

// Initial state
const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  error: null,
};

// LocalStorage keys
const FAVORITES_STORAGE_KEY = 'vntg_favorites';

// Reducer
function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_FAVORITES':
      return {
        ...state,
        items: action.payload,
        isLoading: false,
        error: null,
      };

    case 'ADD_FAVORITE': {
      // Check if already exists
      if (state.items.some((item) => item.product_id === action.payload.product_id)) {
        return state;
      }
      return {
        ...state,
        items: [action.payload, ...state.items],
        isLoading: false,
        error: null,
      };
    }

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        items: state.items.filter((item) => item.product_id !== action.payload),
        isLoading: false,
        error: null,
      };

    case 'CLEAR_FAVORITES':
      return {
        ...state,
        items: [],
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
}

// LocalStorage helpers
function saveFavoritesToStorage(items: FavoriteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save favorites to storage:', error);
  }
}

function loadFavoritesFromStorage(): FavoriteItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load favorites from storage:', error);
    return null;
  }
}

function clearFavoritesFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear favorites from storage:', error);
  }
}

// Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { user, session } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  // Fetch favorites from API
  const fetchFavorites = useCallback(async () => {
    if (!session?.access_token) {
      // Load from localStorage for guests
      const localFavorites = loadFavoritesFromStorage();
      if (localFavorites) {
        dispatch({ type: 'SET_FAVORITES', payload: localFavorites });
      }
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('/api/favorites', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;

      dispatch({ type: 'SET_FAVORITES', payload: data.items || [] });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [session?.access_token]);

  // Load favorites on mount and when user changes
  useEffect(() => {
    const currentUserId = user?.id || null;

    if (currentUserId && currentUserId !== lastUserIdRef.current && session?.access_token) {
      lastUserIdRef.current = currentUserId;
      fetchFavorites();
    } else if (!currentUserId && lastUserIdRef.current) {
      // User logged out - load from localStorage
      lastUserIdRef.current = null;
      const localFavorites = loadFavoritesFromStorage();
      dispatch({ type: 'SET_FAVORITES', payload: localFavorites || [] });
    } else if (!currentUserId && !lastUserIdRef.current) {
      // Initial load for guest
      const localFavorites = loadFavoritesFromStorage();
      if (localFavorites) {
        dispatch({ type: 'SET_FAVORITES', payload: localFavorites });
      }
    }
  }, [user?.id, session?.access_token, fetchFavorites]);

  // Save to localStorage when favorites change (for guests)
  useEffect(() => {
    if (!session) {
      if (state.items.length > 0) {
        saveFavoritesToStorage(state.items);
      } else {
        clearFavoritesFromStorage();
      }
    }
  }, [session, state.items]);

  // Add to favorites
  const addToFavorites = async (productId: string) => {
    // Check if already favorited
    if (state.items.some((item) => item.product_id === productId)) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (session?.access_token) {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add to favorites');
        }

        // Refresh favorites to get the full product data
        await fetchFavorites();
      } else {
        // For guests, create a minimal favorite item
        // In real app, we'd fetch product data, but for now use placeholder
        const newFavorite: FavoriteItem = {
          id: `fav-${Date.now()}`,
          product_id: productId,
          created_at: new Date().toISOString(),
          product: {
            id: productId,
            name: 'Product',
            price: 0,
            image_url: null,
            inventory_count: 0,
          },
        };
        dispatch({ type: 'ADD_FAVORITE', payload: newFavorite });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (productId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (session?.access_token) {
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
      }

      dispatch({ type: 'REMOVE_FAVORITE', payload: productId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  };

  // Check if product is favorited
  const isFavorite = (productId: string): boolean => {
    return state.items.some((item) => item.product_id === productId);
  };

  // Clear all favorites
  const clearFavorites = async () => {
    if (session?.access_token) {
      try {
        await fetch('/api/favorites/clear', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      } catch (error) {
        console.error('Failed to clear favorites on server:', error);
      }
    }

    dispatch({ type: 'CLEAR_FAVORITES' });
    clearFavoritesFromStorage();
  };

  const value: FavoritesContextType = {
    ...state,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refreshFavorites: fetchFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// Hook
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
