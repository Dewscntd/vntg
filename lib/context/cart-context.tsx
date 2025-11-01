'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { apiUrl } from '@/lib/utils/api';
import { useAuth } from '@/lib/auth/auth-context';
import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartFromStorage,
  syncCartWithServer,
  trackCartEvent,
  setupCartAbandonmentTracking,
} from '@/lib/utils/cart-persistence';
import { cartAnalytics } from '@/lib/utils/cart-analytics';
import { trackCartAbandonment, setupAbandonmentTracking } from '@/lib/utils/cart-abandonment';

// Types
export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    inventory_count: number;
    discount_percent?: number;
  };
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
}

export interface CartContextType extends CartState {
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
}

// Actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: { items: CartItem[]; total: number; itemCount: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' };

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
  isOpen: false,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        isLoading: false,
        error: null,
      };

    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      const newTotal = newItems.reduce((sum, item) => {
        const price = item.product.discount_percent
          ? item.product.price * (1 - item.product.discount_percent / 100)
          : item.product.price;
        return sum + price * item.quantity;
      }, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
        error: null,
      };
    }

    case 'UPDATE_ITEM': {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );

      const newTotal = newItems.reduce((sum, item) => {
        const price = item.product.discount_percent
          ? item.product.price * (1 - item.product.discount_percent / 100)
          : item.product.price;
        return sum + price * item.quantity;
      }, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
        error: null,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const newTotal = newItems.reduce((sum, item) => {
        const price = item.product.discount_percent
          ? item.product.price * (1 - item.product.discount_percent / 100)
          : item.product.price;
        return sum + price * item.quantity;
      }, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
        error: null,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null,
      };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, session } = useAuth();
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (!session) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cart'), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      dispatch({
        type: 'SET_CART',
        payload: {
          items: data.items || [],
          total: data.total || 0,
          itemCount: data.itemCount || 0,
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [session?.access_token]);

  // Load cart on mount and when user changes
  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      if (!mounted) return;

      if (session?.access_token) {
        // User is logged in - sync with server
        const localCart = loadCartFromStorage();
        if (localCart) {
          try {
            const syncedCart = await syncCartWithServer(localCart, session.access_token);
            if (syncedCart && mounted) {
              dispatch({
                type: 'SET_CART',
                payload: syncedCart,
              });
            }
          } catch (error) {
            if (mounted) {
              dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            }
          }
        } else {
          // Fetch cart directly to avoid stale closure
          if (!mounted) return;

          dispatch({ type: 'SET_LOADING', payload: true });

          try {
            const response = await fetch(apiUrl('/api/cart'), {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch cart');
            }

            const data = await response.json();

            if (mounted) {
              dispatch({
                type: 'SET_CART',
                payload: {
                  items: data.items || [],
                  total: data.total || 0,
                  itemCount: data.itemCount || 0,
                },
              });
            }
          } catch (error) {
            if (mounted) {
              dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            }
          }
        }
      } else {
        // User not logged in - load from local storage
        const localCart = loadCartFromStorage();
        if (localCart && mounted) {
          dispatch({
            type: 'SET_CART',
            payload: {
              items: localCart.items,
              total: localCart.total,
              itemCount: localCart.itemCount,
            },
          });
        } else if (mounted) {
          dispatch({ type: 'CLEAR_CART' });
        }
      }
    };

    // Only load cart if user has actually changed (login/logout)
    const currentUserId = user?.id || null;
    if (currentUserId !== lastUserId) {
      setLastUserId(currentUserId);
      loadCart();
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, lastUserId]);

  // Set up cart abandonment tracking
  useEffect(() => {
    const cleanup = setupAbandonmentTracking();

    return cleanup;
  }, []);

  // Save to local storage when cart changes (for non-authenticated users)
  useEffect(() => {
    if (!session && state.items.length > 0) {
      saveCartToStorage({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      });
    } else if (!session && state.items.length === 0) {
      clearCartFromStorage();
    }
  }, [session, state.items, state.total, state.itemCount]);

  // API functions
  const addItem = async (productId: string, quantity: number = 1) => {
    if (!session) {
      dispatch({ type: 'SET_ERROR', payload: 'Please log in to add items to cart' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cart/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      // Refresh cart after adding
      await fetchCart();

      // Track analytics event
      trackCartEvent('add_to_cart', {
        product_id: productId,
        quantity,
      });

      // Track detailed analytics
      const addedItem = state.items.find((item) => item.product_id === productId);
      if (addedItem) {
        cartAnalytics.addToCart(addedItem, session?.user?.id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const removeItem = async (itemId: string) => {
    if (!session) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cart/remove'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: itemId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      // Track analytics event
      trackCartEvent('remove_from_cart', {
        item_id: itemId,
      });

      // Track detailed analytics
      const removedItem = state.items.find((item) => item.id === itemId);
      if (removedItem) {
        cartAnalytics.removeFromCart(removedItem, session?.user?.id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!session) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(apiUrl('/api/cart/update'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: itemId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
    cartAnalytics.openCart(state.items, state.total, session?.user?.id);
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
    // Track time spent in cart (simplified)
    cartAnalytics.closeCart(state.items, state.total, 0, session?.user?.id);
  };

  const toggleCart = () => {
    if (state.isOpen) {
      closeCart();
    } else {
      openCart();
    }
  };
  const refreshCart = fetchCart;

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
