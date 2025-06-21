import { z } from 'zod';

// Base cart item schema
export const cartItemSchema = z.object({
  user_id: z.string().uuid({ message: 'Invalid user ID' }),
  product_id: z.string().uuid({ message: 'Invalid product ID' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
});

// Schema for adding an item to the cart
export const addToCartSchema = z.object({
  product_id: z.string().uuid({ message: 'Invalid product ID' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }).default(1),
});

// Schema for updating a cart item
export const updateCartItemSchema = z.object({
  id: z.string().uuid({ message: 'Invalid cart item ID' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
});

// Schema for removing an item from the cart
export const removeFromCartSchema = z.object({
  id: z.string().uuid({ message: 'Invalid cart item ID' }),
});

// Types
export type CartItem = z.infer<typeof cartItemSchema>;
export type AddToCart = z.infer<typeof addToCartSchema>;
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCart = z.infer<typeof removeFromCartSchema>;
