import { z } from 'zod';

// Shipping address validation schema
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
  address: z.string().min(1, 'Address is required').max(100, 'Address too long'),
  address2: z.string().max(100, 'Address line 2 too long').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name too long'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters').max(10, 'ZIP code too long'),
  country: z.string().min(1, 'Country is required').max(50, 'Country name too long'),
});

// Billing address validation schema (extends shipping)
export const billingAddressSchema = shippingAddressSchema.extend({
  sameAsShipping: z.boolean().optional(),
});

// Payment method validation schema
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'paypal', 'apple_pay', 'google_pay']),
  saveForFuture: z.boolean().optional(),
});

// Order creation schema
export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema.optional(),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Payment intent creation schema
export const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('usd'),
  orderId: z.string().uuid('Invalid order ID').optional(),
  metadata: z.record(z.string()).optional(),
});

// Checkout session schema
export const checkoutSessionSchema = z.object({
  step: z.enum(['shipping', 'payment', 'review', 'confirmation']),
  shippingAddress: shippingAddressSchema.optional(),
  billingAddress: billingAddressSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  shippingMethod: z.enum(['standard', 'express', 'overnight']).optional(),
  guestCheckout: z.boolean().default(false),
});

// Guest checkout schema
export const guestCheckoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  createAccount: z.boolean().default(false),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.createAccount && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Shipping method schema
export const shippingMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  estimatedDays: z.number().min(1),
});

// Order summary schema
export const orderSummarySchema = z.object({
  subtotal: z.number().min(0),
  shipping: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
});

// Types derived from schemas
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type BillingAddress = z.infer<typeof billingAddressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
export type GuestCheckout = z.infer<typeof guestCheckoutSchema>;
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type OrderSummary = z.infer<typeof orderSummarySchema>;

// Validation helper functions
export const validateShippingAddress = (data: unknown) => {
  return shippingAddressSchema.safeParse(data);
};

export const validateBillingAddress = (data: unknown) => {
  return billingAddressSchema.safeParse(data);
};

export const validatePaymentMethod = (data: unknown) => {
  return paymentMethodSchema.safeParse(data);
};

export const validateCreateOrder = (data: unknown) => {
  return createOrderSchema.safeParse(data);
};

export const validateCheckoutSession = (data: unknown) => {
  return checkoutSessionSchema.safeParse(data);
};

export const validateGuestCheckout = (data: unknown) => {
  return guestCheckoutSchema.safeParse(data);
};
