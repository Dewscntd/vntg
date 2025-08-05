// Admin functionality mocks for comprehensive testing
import { generateExtensiveProducts, generateExtensiveUsers, generateExtensiveOrders } from './extensive-mock-data';
import { mockCategories } from './mock-data';

const simulateDelay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Admin dashboard analytics
export const mockAdminAnalytics = {
  async getDashboardStats() {
    await simulateDelay(400);
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    return {
      overview: {
        total_revenue: 156789.45,
        total_orders: 1234,
        total_customers: 5678,
        total_products: 89,
        conversion_rate: 3.4,
        avg_order_value: 127.15,
      },
      period_comparison: {
        revenue_change: 12.5, // % change from previous period
        orders_change: 8.2,
        customers_change: 15.7,
        conversion_change: -2.1,
      },
      recent_activity: [
        { type: 'order', message: 'New order #VNTG-2024-1001 for $299.99', timestamp: new Date(now.getTime() - 5 * 60 * 1000) },
        { type: 'customer', message: 'New customer registration: jane.doe@example.com', timestamp: new Date(now.getTime() - 15 * 60 * 1000) },
        { type: 'product', message: 'Product "iPhone 15 Pro" low stock alert (5 remaining)', timestamp: new Date(now.getTime() - 30 * 60 * 1000) },
        { type: 'refund', message: 'Refund processed for order #VNTG-2024-0987', timestamp: new Date(now.getTime() - 45 * 60 * 1000) },
      ],
      top_products: [
        { id: 'prod-001', name: 'iPhone 15 Pro', sales: 45, revenue: 44999.55 },
        { id: 'prod-007', name: 'Nike Air Force 1', sales: 89, revenue: 9790.00 },
        { id: 'prod-003', name: 'Sony WH-1000XM5', sales: 32, revenue: 11199.68 },
      ],
      sales_by_category: mockCategories.map(cat => ({
        category: cat.name,
        sales: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 50000) + 5000,
      })),
    };
  },
  
  async getRevenueChart(period = '30d') {
    await simulateDelay(300);
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        visitors: Math.floor(Math.random() * 500) + 100,
      });
    }
    
    return data;
  },
};

// Admin product management
export class MockAdminProductManager {
  private products = generateExtensiveProducts();
  
  async getAllProducts(filters = {}, pagination = { page: 1, limit: 20 }) {
    await simulateDelay(200);
    
    let filteredProducts = [...this.products];
    
    // Apply filters
    if ((filters as any).category) {
      filteredProducts = filteredProducts.filter(p => p.category_id === (filters as any).category);
    }
    
    if ((filters as any).status) {
      filteredProducts = filteredProducts.filter(p => 
        (filters as any).status === 'active' ? p.is_active : !p.is_active
      );
    }
    
    if ((filters as any).stock_status) {
      filteredProducts = filteredProducts.filter(p => {
        switch ((filters as any).stock_status) {
          case 'in_stock': return p.stock_quantity > 0;
          case 'low_stock': return p.stock_quantity > 0 && p.stock_quantity <= 10;
          case 'out_of_stock': return p.stock_quantity === 0;
          default: return true;
        }
      });
    }
    
    // Apply pagination
    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      pagination: {
        current_page: page,
        per_page: limit,
        total: filteredProducts.length,
        total_pages: Math.ceil(filteredProducts.length / limit),
      },
    };
  }
  
  async createProduct(productData: any) {
    await simulateDelay(400);
    
    const newProduct = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      rating: null,
      review_count: 0,
    };
    
    this.products.push(newProduct);
    return newProduct;
  }
  
  async updateProduct(productId: string, updates: any) {
    await simulateDelay(300);
    
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return this.products[productIndex];
  }
  
  async deleteProduct(productId: string) {
    await simulateDelay(250);
    
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    this.products.splice(productIndex, 1);
    return { success: true };
  }
  
  async bulkUpdatePrices(updates: { id: string; price: number; compare_price?: number }[]) {
    await simulateDelay(600);
    
    const updated = [];
    for (const update of updates) {
      const productIndex = this.products.findIndex(p => p.id === update.id);
      if (productIndex !== -1) {
        this.products[productIndex].price = update.price;
        if (update.compare_price) {
          this.products[productIndex].compare_price = update.compare_price;
        }
        this.products[productIndex].updated_at = new Date().toISOString();
        updated.push(this.products[productIndex]);
      }
    }
    
    return { updated_count: updated.length, products: updated };
  }
  
  async bulkUpdateInventory(updates: { id: string; stock_quantity: number }[]) {
    await simulateDelay(500);
    
    const updated = [];
    for (const update of updates) {
      const productIndex = this.products.findIndex(p => p.id === update.id);
      if (productIndex !== -1) {
        this.products[productIndex].stock_quantity = update.stock_quantity;
        this.products[productIndex].updated_at = new Date().toISOString();
        updated.push(this.products[productIndex]);
      }
    }
    
    return { updated_count: updated.length, products: updated };
  }
}

// Admin order management
export class MockAdminOrderManager {
  private orders = generateExtensiveOrders();
  
  async getAllOrders(filters = {}, pagination = { page: 1, limit: 20 }) {
    await simulateDelay(300);
    
    let filteredOrders = [...this.orders];
    
    // Apply filters
    if ((filters as any).status) {
      filteredOrders = filteredOrders.filter(o => o.status === (filters as any).status);
    }
    
    if ((filters as any).payment_status) {
      filteredOrders = filteredOrders.filter(o => o.payment_status === (filters as any).payment_status);
    }
    
    if ((filters as any).date_range) {
      const { start, end } = (filters as any).date_range;
      filteredOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= new Date(start) && orderDate <= new Date(end);
      });
    }
    
    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Apply pagination
    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      orders: paginatedOrders,
      pagination: {
        current_page: page,
        per_page: limit,
        total: filteredOrders.length,
        total_pages: Math.ceil(filteredOrders.length / limit),
      },
    };
  }
  
  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    await simulateDelay(250);
    
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    this.orders[orderIndex].status = status;
    this.orders[orderIndex].updated_at = new Date().toISOString();
    
    if (notes) {
      this.orders[orderIndex].admin_notes = this.orders[orderIndex].admin_notes || [];
      this.orders[orderIndex].admin_notes.push({
        note: notes,
        created_by: 'admin',
        created_at: new Date().toISOString(),
      });
    }
    
    return this.orders[orderIndex];
  }
  
  async addTrackingInfo(orderId: string, trackingNumber: string, carrier: string) {
    await simulateDelay(200);
    
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    this.orders[orderIndex].tracking_number = trackingNumber;
    this.orders[orderIndex].shipping_carrier = carrier;
    this.orders[orderIndex].fulfillment_status = 'shipped';
    this.orders[orderIndex].shipped_at = new Date().toISOString();
    this.orders[orderIndex].updated_at = new Date().toISOString();
    
    return this.orders[orderIndex];
  }
  
  async processRefund(orderId: string, amount: number, reason: string) {
    await simulateDelay(400);
    
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    const refund = {
      id: `refund-${Date.now()}`,
      amount,
      reason,
      status: 'completed',
      processed_by: 'admin',
      created_at: new Date().toISOString(),
    };
    
    this.orders[orderIndex].refunds = this.orders[orderIndex].refunds || [];
    this.orders[orderIndex].refunds.push(refund);
    this.orders[orderIndex].payment_status = 'refunded';
    this.orders[orderIndex].updated_at = new Date().toISOString();
    
    return { order: this.orders[orderIndex], refund };
  }
}

// Admin customer management
export class MockAdminCustomerManager {
  private customers = generateExtensiveUsers();
  
  async getAllCustomers(filters = {}, pagination = { page: 1, limit: 20 }) {
    await simulateDelay(250);
    
    let filteredCustomers = [...this.customers];
    
    // Apply filters
    if ((filters as any).role) {
      filteredCustomers = filteredCustomers.filter(c => c.role === (filters as any).role);
    }
    
    if ((filters as any).verified) {
      filteredCustomers = filteredCustomers.filter(c => c.is_verified === (filters as any).verified);
    }
    
    if ((filters as any).search) {
      const search = (filters as any).search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c => 
        c.email.toLowerCase().includes(search) ||
        c.first_name.toLowerCase().includes(search) ||
        c.last_name.toLowerCase().includes(search)
      );
    }
    
    // Apply pagination
    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
    
    return {
      customers: paginatedCustomers,
      pagination: {
        current_page: page,
        per_page: limit,
        total: filteredCustomers.length,
        total_pages: Math.ceil(filteredCustomers.length / limit),
      },
    };
  }
  
  async updateCustomer(customerId: string, updates: any) {
    await simulateDelay(200);
    
    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }
    
    this.customers[customerIndex] = {
      ...this.customers[customerIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return this.customers[customerIndex];
  }
  
  async getCustomerActivity(customerId: string) {
    await simulateDelay(300);
    
    // Generate mock activity data
    const activities = [
      { type: 'login', description: 'Customer logged in', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { type: 'order', description: 'Placed order #VNTG-2024-1001', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { type: 'support', description: 'Contacted customer support', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'registration', description: 'Account created', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    ];
    
    return activities;
  }
}

// Admin inventory management
export class MockInventoryManager {
  private inventory = new Map<string, any>();
  
  constructor() {
    // Initialize with current product inventory
    const products = generateExtensiveProducts();
    products.forEach(product => {
      this.inventory.set(product.id, {
        product_id: product.id,
        current_stock: product.stock_quantity,
        reserved_stock: Math.floor(Math.random() * 5),
        reorder_point: 10,
        reorder_quantity: 50,
        cost_per_unit: product.cost_price || product.price * 0.6,
        last_updated: new Date().toISOString(),
        movements: [],
      });
    });
  }
  
  async getInventoryLevels(filters = {}) {
    await simulateDelay(200);
    
    let inventoryItems = Array.from(this.inventory.values());
    
    if ((filters as any).low_stock) {
      inventoryItems = inventoryItems.filter(item => 
        item.current_stock <= item.reorder_point
      );
    }
    
    if ((filters as any).out_of_stock) {
      inventoryItems = inventoryItems.filter(item => 
        item.current_stock === 0
      );
    }
    
    return inventoryItems;
  }
  
  async updateStock(productId: string, quantity: number, type: 'adjustment' | 'restock' | 'sale' | 'return', notes?: string) {
    await simulateDelay(150);
    
    const item = this.inventory.get(productId);
    if (!item) {
      throw new Error('Product not found in inventory');
    }
    
    const movement = {
      id: `mov-${Date.now()}`,
      type,
      quantity_change: quantity,
      previous_stock: item.current_stock,
      new_stock: item.current_stock + quantity,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };
    
    item.current_stock += quantity;
    item.movements.unshift(movement);
    item.last_updated = new Date().toISOString();
    
    // Keep only last 50 movements
    if (item.movements.length > 50) {
      item.movements = item.movements.slice(0, 50);
    }
    
    return { item, movement };
  }
  
  async getStockMovements(productId: string, limit = 20) {
    await simulateDelay(100);
    
    const item = this.inventory.get(productId);
    if (!item) {
      throw new Error('Product not found in inventory');
    }
    
    return item.movements.slice(0, limit);
  }
  
  async generateLowStockReport() {
    await simulateDelay(300);
    
    const lowStockItems = Array.from(this.inventory.values())
      .filter(item => item.current_stock <= item.reorder_point)
      .map(item => ({
        ...item,
        suggested_reorder: item.reorder_quantity,
        estimated_cost: item.reorder_quantity * item.cost_per_unit,
      }));
    
    return {
      items: lowStockItems,
      total_items: lowStockItems.length,
      total_estimated_cost: lowStockItems.reduce((sum, item) => sum + item.estimated_cost, 0),
    };
  }
}

// Export admin manager instances
export const mockAdminProductManager = new MockAdminProductManager();
export const mockAdminOrderManager = new MockAdminOrderManager();
export const mockAdminCustomerManager = new MockAdminCustomerManager();
export const mockInventoryManager = new MockInventoryManager();