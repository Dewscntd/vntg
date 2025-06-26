'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/context/cart-context';
import {
  CheckoutSession,
  ShippingAddress,
  BillingAddress,
  PaymentMethod,
  ShippingMethod,
  OrderSummary,
} from '@/lib/validations/checkout';

// Checkout state interface
export interface CheckoutState extends CheckoutSession {
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  isGuestCheckout: boolean;
  orderSummary: OrderSummary | null;
  availableShippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;
  paymentIntentId: string | null;
  clientSecret: string | null;
}

// Checkout actions
type CheckoutAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_GUEST_CHECKOUT'; payload: boolean }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_BILLING_ADDRESS'; payload: BillingAddress }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_SHIPPING_METHOD'; payload: ShippingMethod }
  | { type: 'SET_ORDER_SUMMARY'; payload: OrderSummary }
  | { type: 'SET_AVAILABLE_SHIPPING_METHODS'; payload: ShippingMethod[] }
  | { type: 'SET_PAYMENT_INTENT'; payload: { paymentIntentId: string; clientSecret: string } }
  | { type: 'RESET_CHECKOUT' };

// Checkout context interface
export interface CheckoutContextType extends CheckoutState {
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: BillingAddress) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setGuestCheckout: (isGuest: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  calculateOrderSummary: () => Promise<void>;
  createPaymentIntent: () => Promise<void>;
  processOrder: () => Promise<string | null>;
  resetCheckout: () => void;
}

// Initial state
// Default shipping methods
const defaultShippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Free shipping on orders over $50',
    price: 0,
    estimatedDays: 5,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Faster delivery',
    price: 9.99,
    estimatedDays: 2,
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    price: 19.99,
    estimatedDays: 1,
  },
];

const initialState: CheckoutState = {
  step: 'shipping',
  currentStep: 0,
  isLoading: false,
  error: null,
  isGuestCheckout: false,
  guestCheckout: false,
  orderSummary: null,
  availableShippingMethods: defaultShippingMethods,
  selectedShippingMethod: defaultShippingMethods[0], // Default to standard shipping
  paymentIntentId: null,
  clientSecret: null,
};

// Checkout reducer
function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_STEP':
      const steps = ['shipping', 'payment', 'review', 'confirmation'] as const;
      return {
        ...state,
        currentStep: action.payload,
        step: steps[action.payload] || 'shipping',
      };

    case 'SET_GUEST_CHECKOUT':
      return { ...state, isGuestCheckout: action.payload, guestCheckout: action.payload };

    case 'SET_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };

    case 'SET_BILLING_ADDRESS':
      return { ...state, billingAddress: action.payload };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'SET_SHIPPING_METHOD':
      return {
        ...state,
        selectedShippingMethod: action.payload,
        shippingMethod: action.payload.id as any,
      };

    case 'SET_ORDER_SUMMARY':
      return { ...state, orderSummary: action.payload };

    case 'SET_AVAILABLE_SHIPPING_METHODS':
      return { ...state, availableShippingMethods: action.payload };

    case 'SET_PAYMENT_INTENT':
      return {
        ...state,
        paymentIntentId: action.payload.paymentIntentId,
        clientSecret: action.payload.clientSecret,
      };

    case 'RESET_CHECKOUT':
      return initialState;

    default:
      return state;
  }
}

// Create context
const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Checkout provider component
export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { session } = useAuth();
  const { items, total } = useCart();

  // Action creators
  const setShippingAddress = useCallback((address: ShippingAddress) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  }, []);

  const setBillingAddress = useCallback((address: BillingAddress) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  }, []);

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload: method });
  }, []);

  const setGuestCheckout = useCallback((isGuest: boolean) => {
    dispatch({ type: 'SET_GUEST_CHECKOUT', payload: isGuest });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < 3) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 3) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  }, []);

  const calculateOrderSummary = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const subtotal = total;
      const shipping = state.selectedShippingMethod?.price || 0;
      const tax = subtotal * 0.08; // 8% tax rate - should be calculated based on address
      const orderTotal = subtotal + shipping + tax;

      const summary: OrderSummary = {
        subtotal,
        shipping,
        tax,
        total: orderTotal,
      };

      dispatch({ type: 'SET_ORDER_SUMMARY', payload: summary });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to calculate order summary' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [total, state.selectedShippingMethod]);

  const createPaymentIntent = useCallback(async () => {
    if (!state.orderSummary) {
      dispatch({ type: 'SET_ERROR', payload: 'Order summary not calculated' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(state.orderSummary.total * 100), // Convert to cents
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { paymentIntentId, clientSecret } = await response.json();
      dispatch({
        type: 'SET_PAYMENT_INTENT',
        payload: { paymentIntentId, clientSecret },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create payment intent' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.orderSummary]);

  const processOrder = useCallback(async (): Promise<string | null> => {
    if (!state.shippingAddress || !state.paymentIntentId) {
      dispatch({ type: 'SET_ERROR', payload: 'Missing required order information' });
      return null;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: state.shippingAddress,
          billingAddress: state.billingAddress,
          paymentMethodId: state.paymentIntentId, // Using payment intent ID as payment method ID
          shippingMethod: state.selectedShippingMethod?.id || 'standard',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Order processing error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to process order',
      });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    state.shippingAddress,
    state.billingAddress,
    state.paymentIntentId,
    state.selectedShippingMethod,
  ]);

  const resetCheckout = useCallback(() => {
    dispatch({ type: 'RESET_CHECKOUT' });
  }, []);

  const value: CheckoutContextType = {
    ...state,
    setShippingAddress,
    setBillingAddress,
    setPaymentMethod,
    setShippingMethod,
    setGuestCheckout,
    nextStep,
    previousStep,
    goToStep,
    calculateOrderSummary,
    createPaymentIntent,
    processOrder,
    resetCheckout,
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

// Hook to use checkout context
export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
