// Stripe stub implementation for local development

// Simulate Stripe API delays
const simulateDelay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Stripe client for server-side operations
export const createStripeStub = () => ({
  paymentIntents: {
    create: async (params: any) => {
      await simulateDelay(400);
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: params.amount,
        currency: params.currency || 'usd',
        status: 'requires_payment_method',
        payment_method_types: ['card'],
        created: Math.floor(Date.now() / 1000),
        metadata: params.metadata || {},
      };
    },
    
    retrieve: async (id: string) => {
      await simulateDelay(300);
      return {
        id,
        client_secret: `${id}_secret_mock`,
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
        payment_method_types: ['card'],
        created: Math.floor(Date.now() / 1000),
        metadata: {},
      };
    },
    
    update: async (id: string, params: any) => {
      await simulateDelay(300);
      return {
        id,
        client_secret: `${id}_secret_mock`,
        amount: params.amount || 2000,
        currency: params.currency || 'usd',
        status: 'requires_payment_method',
        payment_method_types: ['card'],
        created: Math.floor(Date.now() / 1000),
        metadata: params.metadata || {},
      };
    },
    
    confirm: async (id: string, params: any) => {
      await simulateDelay(800);
      return {
        id,
        client_secret: `${id}_secret_mock`,
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
        payment_method_types: ['card'],
        created: Math.floor(Date.now() / 1000),
        metadata: {},
        charges: {
          data: [{
            id: `ch_mock_${Date.now()}`,
            amount: 2000,
            currency: 'usd',
            status: 'succeeded',
            receipt_url: 'https://pay.stripe.com/receipts/mock',
          }],
        },
      };
    },
  },
  
  customers: {
    create: async (params: any) => {
      await simulateDelay(300);
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name,
        created: Math.floor(Date.now() / 1000),
        metadata: params.metadata || {},
      };
    },
    
    retrieve: async (id: string) => {
      await simulateDelay(200);
      return {
        id,
        email: 'customer@example.com',
        name: 'Mock Customer',
        created: Math.floor(Date.now() / 1000),
        metadata: {},
      };
    },
    
    update: async (id: string, params: any) => {
      await simulateDelay(250);
      return {
        id,
        email: params.email || 'customer@example.com',
        name: params.name || 'Mock Customer',
        created: Math.floor(Date.now() / 1000),
        metadata: params.metadata || {},
      };
    },
  },
  
  products: {
    create: async (params: any) => {
      await simulateDelay(300);
      return {
        id: `prod_mock_${Date.now()}`,
        name: params.name,
        description: params.description,
        active: true,
        created: Math.floor(Date.now() / 1000),
        metadata: params.metadata || {},
      };
    },
    
    retrieve: async (id: string) => {
      await simulateDelay(200);
      return {
        id,
        name: 'Mock Product',
        description: 'A mock product for testing',
        active: true,
        created: Math.floor(Date.now() / 1000),
        metadata: {},
      };
    },
  },
  
  prices: {
    create: async (params: any) => {
      await simulateDelay(300);
      return {
        id: `price_mock_${Date.now()}`,
        product: params.product,
        unit_amount: params.unit_amount,
        currency: params.currency || 'usd',
        active: true,
        created: Math.floor(Date.now() / 1000),
        metadata: params.metadata || {},
      };
    },
    
    retrieve: async (id: string) => {
      await simulateDelay(200);
      return {
        id,
        product: 'prod_mock_123',
        unit_amount: 2000,
        currency: 'usd',
        active: true,
        created: Math.floor(Date.now() / 1000),
        metadata: {},
      };
    },
  },
  
  webhooks: {
    constructEvent: (payload: any, signature: string, secret: string) => {
      // Mock webhook event
      return {
        id: `evt_mock_${Date.now()}`,
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_mock_123',
            status: 'succeeded',
            amount: 2000,
            currency: 'usd',
          },
        },
        created: Math.floor(Date.now() / 1000),
      };
    },
  },
});

// Mock Stripe.js client for frontend
export const createStripeJsStub = () => ({
  elements: () => ({
    create: (type: string, options?: any) => ({
      mount: (selector: string) => {
        console.log(`Mock Stripe Element ${type} mounted to ${selector}`);
      },
      destroy: () => {
        console.log('Mock Stripe Element destroyed');
      },
      update: (options: any) => {
        console.log('Mock Stripe Element updated', options);
      },
      on: (event: string, handler: Function) => {
        console.log(`Mock Stripe Element event listener added: ${event}`);
        // Simulate successful setup
        if (event === 'ready') {
          setTimeout(() => handler(), 100);
        }
      },
    }),
    
    submit: async () => {
      await simulateDelay(300);
      return { error: null };
    },
  }),
  
  confirmPayment: async (options: any) => {
    await simulateDelay(1000);
    
    // Simulate successful payment
    return {
      paymentIntent: {
        id: 'pi_mock_123',
        status: 'succeeded',
        amount: 2000,
        currency: 'usd',
      },
      error: null,
    };
  },
  
  confirmSetup: async (options: any) => {
    await simulateDelay(800);
    return {
      setupIntent: {
        id: 'seti_mock_123',
        status: 'succeeded',
      },
      error: null,
    };
  },
  
  retrievePaymentIntent: async (clientSecret: string) => {
    await simulateDelay(300);
    return {
      paymentIntent: {
        id: 'pi_mock_123',
        client_secret: clientSecret,
        status: 'succeeded',
        amount: 2000,
        currency: 'usd',
      },
      error: null,
    };
  },
});

// Export mock constructors
export const mockStripe = createStripeJsStub();
export const mockStripeServer = createStripeStub();