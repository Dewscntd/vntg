// Comprehensive cart and order flow simulations
import { generateExtensiveProducts, generateExtensiveUsers } from './extensive-mock-data';
import { errorScenarios } from './error-scenarios';

const simulateDelay = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Cart state management
class MockCartManager {
  private carts: Map<string, any[]> = new Map();
  private savedForLater: Map<string, any[]> = new Map();

  async addToCart(userId: string, productId: string, quantity: number = 1, options?: any) {
    await simulateDelay(200);

    // Check for inventory
    const products = generateExtensiveProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.inventory_count < quantity) {
      throw new Error('Insufficient inventory');
    }

    const userCart = this.carts.get(userId) || [];
    const existingItem = userCart.find(
      (item) =>
        item.product_id === productId && JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.inventory_count < newQuantity) {
        throw new Error('Insufficient inventory');
      }
      existingItem.quantity = newQuantity;
      existingItem.updated_at = new Date().toISOString();
    } else {
      userCart.push({
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product_id: productId,
        quantity,
        options: options || {},
        added_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    this.carts.set(userId, userCart);
    return this.getCartWithProducts(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    await simulateDelay(150);

    const userCart = this.carts.get(userId) || [];
    const item = userCart.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, itemId);
    }

    // Check inventory
    const products = generateExtensiveProducts();
    const product = products.find((p) => p.id === item.product_id);

    if (product && product.inventory_count < quantity) {
      throw new Error('Insufficient inventory');
    }

    item.quantity = quantity;
    item.updated_at = new Date().toISOString();

    this.carts.set(userId, userCart);
    return this.getCartWithProducts(userId);
  }

  async removeFromCart(userId: string, itemId: string) {
    await simulateDelay(100);

    const userCart = this.carts.get(userId) || [];
    const filteredCart = userCart.filter((item) => item.id !== itemId);

    this.carts.set(userId, filteredCart);
    return this.getCartWithProducts(userId);
  }

  async saveForLater(userId: string, itemId: string) {
    await simulateDelay(150);

    const userCart = this.carts.get(userId) || [];
    const savedItems = this.savedForLater.get(userId) || [];

    const itemIndex = userCart.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    const [item] = userCart.splice(itemIndex, 1);
    item.saved_at = new Date().toISOString();
    savedItems.push(item);

    this.carts.set(userId, userCart);
    this.savedForLater.set(userId, savedItems);

    return {
      cart: await this.getCartWithProducts(userId),
      savedItems: await this.getSavedItemsWithProducts(userId),
    };
  }

  async moveToCart(userId: string, itemId: string) {
    await simulateDelay(150);

    const userCart = this.carts.get(userId) || [];
    const savedItems = this.savedForLater.get(userId) || [];

    const itemIndex = savedItems.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Saved item not found');
    }

    const [item] = savedItems.splice(itemIndex, 1);
    delete item.saved_at;
    item.updated_at = new Date().toISOString();
    userCart.push(item);

    this.carts.set(userId, userCart);
    this.savedForLater.set(userId, savedItems);

    return {
      cart: await this.getCartWithProducts(userId),
      savedItems: await this.getSavedItemsWithProducts(userId),
    };
  }

  async getCartWithProducts(userId: string) {
    const userCart = this.carts.get(userId) || [];
    const products = generateExtensiveProducts();

    const cartWithProducts = userCart.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        ...item,
        product,
        subtotal: product ? product.price * item.quantity : 0,
      };
    });

    const subtotal = cartWithProducts.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      items: cartWithProducts,
      summary: {
        item_count: userCart.length,
        total_quantity: userCart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        tax,
        shipping,
        total,
      },
    };
  }

  async getSavedItemsWithProducts(userId: string) {
    const savedItems = this.savedForLater.get(userId) || [];
    const products = generateExtensiveProducts();

    return savedItems.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return { ...item, product };
    });
  }

  async clearCart(userId: string) {
    await simulateDelay(100);
    this.carts.set(userId, []);
    return { success: true };
  }

  async applyCoupon(userId: string, couponCode: string) {
    await simulateDelay(300);

    const validCoupons = {
      SAVE10: { type: 'percentage', value: 0.1, description: '10% off' },
      SAVE20: { type: 'percentage', value: 0.2, description: '20% off' },
      FREESHIP: { type: 'free_shipping', value: 0, description: 'Free shipping' },
      WELCOME15: { type: 'percentage', value: 0.15, description: '15% off for new customers' },
      EXPIRED: { type: 'expired', value: 0, description: 'Expired coupon' },
    };

    const coupon = validCoupons[couponCode as keyof typeof validCoupons];

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (coupon.type === 'expired') {
      throw new Error('Coupon has expired');
    }

    return {
      code: couponCode,
      ...coupon,
      applied_at: new Date().toISOString(),
    };
  }
}

// Order state management
class MockOrderManager {
  private orders: Map<string, any> = new Map();
  private orderSequence = 1001;

  async createOrder(
    userId: string,
    cartData: any,
    shippingAddress: any,
    billingAddress: any,
    paymentMethod: any
  ) {
    await simulateDelay(500);

    // Simulate potential order creation errors
    const errorCheck = errorScenarios.find((s) => s.id === 'validation_error');
    if (errorCheck?.trigger()) {
      throw new Error('Order validation failed');
    }

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = `Peakees-2024-${this.orderSequence++}`;

    const order = {
      id: orderId,
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      fulfillment_status: 'unfulfilled',
      items: cartData.items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.subtotal,
        options: item.options,
      })),
      subtotal: cartData.summary.subtotal,
      tax_amount: cartData.summary.tax,
      shipping_amount: cartData.summary.shipping,
      total: cartData.summary.total,
      currency: 'USD',
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.orders.set(orderId, order);
    return order;
  }

  async updateOrderStatus(orderId: string, status: string, fulfillmentStatus?: string) {
    await simulateDelay(200);

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    if (fulfillmentStatus) {
      order.fulfillment_status = fulfillmentStatus;
    }
    order.updated_at = new Date().toISOString();

    // Add tracking number for shipped orders
    if (fulfillmentStatus === 'shipped' && !order.tracking_number) {
      order.tracking_number = `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    this.orders.set(orderId, order);
    return order;
  }

  async addTrackingNumber(orderId: string, trackingNumber: string, carrier?: string) {
    await simulateDelay(150);

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.tracking_number = trackingNumber;
    order.shipping_carrier = carrier || 'USPS';
    order.fulfillment_status = 'shipped';
    order.shipped_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();

    this.orders.set(orderId, order);
    return order;
  }

  async cancelOrder(orderId: string, reason?: string) {
    await simulateDelay(300);

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new Error('Cannot cancel order in current status');
    }

    order.status = 'cancelled';
    order.cancellation_reason = reason || 'Customer request';
    order.cancelled_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();

    this.orders.set(orderId, order);
    return order;
  }

  async processRefund(orderId: string, amount?: number, reason?: string) {
    await simulateDelay(400);

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const refundAmount = amount || order.total;
    const refundId = `refund-${Date.now()}`;

    order.refunds = order.refunds || [];
    order.refunds.push({
      id: refundId,
      amount: refundAmount,
      reason: reason || 'Customer request',
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    order.payment_status = 'refunded';
    order.updated_at = new Date().toISOString();

    this.orders.set(orderId, order);
    return order;
  }

  async getOrder(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getUserOrders(userId: string, limit = 20, offset = 0) {
    const userOrders = Array.from(this.orders.values())
      .filter((order) => order.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);

    return {
      orders: userOrders,
      total: Array.from(this.orders.values()).filter((order) => order.user_id === userId).length,
    };
  }
}

// Checkout flow simulation
export class MockCheckoutFlow {
  private cartManager = new MockCartManager();
  private orderManager = new MockOrderManager();

  async validateAddress(address: any) {
    await simulateDelay(300);

    const requiredFields = ['street', 'city', 'state', 'zip', 'country'];
    const missingFields = requiredFields.filter((field) => !address[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Simulate address validation service
    if (address.zip === '00000') {
      throw new Error('Invalid ZIP code');
    }

    return {
      validated: true,
      standardized_address: {
        ...address,
        street: address.street.toUpperCase(),
      },
      delivery_estimate: {
        min_days: 3,
        max_days: 7,
        cost: address.zip.startsWith('9') ? 15.99 : 9.99, // Higher cost for West Coast
      },
    };
  }

  async calculateTax(cartData: any, address: any) {
    await simulateDelay(200);

    // Simulate tax calculation based on address
    const taxRates: Record<string, number> = {
      CA: 0.0875, // California
      NY: 0.08, // New York
      TX: 0.0625, // Texas
      FL: 0.06, // Florida
      WA: 0.065, // Washington
    };

    const taxRate = taxRates[address.state] || 0.05; // Default 5%
    const taxableAmount = cartData.summary.subtotal;
    const taxAmount = taxableAmount * taxRate;

    return {
      tax_rate: taxRate,
      tax_amount: taxAmount,
      taxable_amount: taxableAmount,
      breakdown: {
        state_tax: taxAmount * 0.7,
        local_tax: taxAmount * 0.3,
      },
    };
  }

  async calculateShipping(cartData: any, address: any, method = 'standard') {
    await simulateDelay(250);

    const weight = cartData.items.reduce(
      (total: number, item: any) => total + (item.product.weight || 1) * item.quantity,
      0
    );

    const shippingMethods = {
      standard: { cost: 9.99, days: '5-7' },
      expedited: { cost: 19.99, days: '2-3' },
      overnight: { cost: 39.99, days: '1' },
      free: { cost: 0, days: '7-10' },
    };

    const baseMethod =
      shippingMethods[method as keyof typeof shippingMethods] || shippingMethods.standard;

    // Free shipping for orders over $50
    if (cartData.summary.subtotal >= 50 && method === 'standard') {
      return { ...baseMethod, cost: 0, reason: 'Free shipping on orders $50+' };
    }

    // Weight-based pricing
    const weightSurcharge = Math.max(0, (weight - 5) * 2); // $2 per lb over 5 lbs

    return {
      ...baseMethod,
      cost: baseMethod.cost + weightSurcharge,
      weight_surcharge: weightSurcharge,
    };
  }

  async processPayment(paymentData: any, orderTotal: number) {
    await simulateDelay(1000); // Simulate payment processing time

    // Simulate payment failures based on card number
    const testCards = {
      '4000000000000002': 'card_declined',
      '4000000000000069': 'expired_card',
      '4000000000000127': 'incorrect_cvc',
      '4000000000000119': 'processing_error',
    };

    const error = testCards[paymentData.card_number as keyof typeof testCards];
    if (error) {
      throw new Error(`Payment failed: ${error}`);
    }

    // Simulate successful payment
    return {
      payment_intent_id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'succeeded',
      amount: orderTotal,
      currency: 'usd',
      created: Date.now(),
      charges: [
        {
          id: `ch_${Date.now()}`,
          amount: orderTotal,
          currency: 'usd',
          status: 'succeeded',
          receipt_url: `https://pay.stripe.com/receipts/mock_${Date.now()}`,
        },
      ],
    };
  }

  // Complete checkout flow
  async completeCheckout(userId: string, checkoutData: any) {
    try {
      // 1. Get current cart
      const cart = await this.cartManager.getCartWithProducts(userId);

      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // 2. Validate addresses
      const shippingValidation = await this.validateAddress(checkoutData.shipping_address);
      const billingValidation = await this.validateAddress(checkoutData.billing_address);

      // 3. Calculate final pricing
      const tax = await this.calculateTax(cart, checkoutData.shipping_address);
      const shipping = await this.calculateShipping(
        cart,
        checkoutData.shipping_address,
        checkoutData.shipping_method
      );

      const finalTotal = cart.summary.subtotal + tax.tax_amount + shipping.cost;

      // 4. Process payment
      const payment = await this.processPayment(checkoutData.payment_method, finalTotal);

      // 5. Create order
      const order = await this.orderManager.createOrder(
        userId,
        {
          ...cart,
          summary: {
            ...cart.summary,
            tax: tax.tax_amount,
            shipping: shipping.cost,
            total: finalTotal,
          },
        },
        shippingValidation.standardized_address,
        billingValidation.standardized_address,
        {
          ...checkoutData.payment_method,
          payment_intent_id: payment.payment_intent_id,
        }
      );

      // 6. Clear cart
      await this.cartManager.clearCart(userId);

      // 7. Update order with payment success
      await this.orderManager.updateOrderStatus(order.id, 'processing', 'unfulfilled');

      return {
        order,
        payment,
        success: true,
      };
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  // Expose managers for direct access
  get cart() {
    return this.cartManager;
  }
  get orders() {
    return this.orderManager;
  }
}

// Export singleton instance
export const mockCheckoutFlow = new MockCheckoutFlow();
