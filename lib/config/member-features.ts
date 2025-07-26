// Configuration for member vs guest features

export interface FeatureAccess {
  guests: boolean;
  members: boolean;
  admin?: boolean;
}

export const FEATURES = {
  // Core Shopping Features
  browsing: {
    viewProducts: { guests: true, members: true },
    searchProducts: { guests: true, members: true },
    filterProducts: { guests: true, members: true },
    viewProductDetails: { guests: true, members: true },
  },

  // Cart & Checkout Features
  cart: {
    addToCart: { guests: true, members: true },
    viewCart: { guests: true, members: true },
    updateQuantity: { guests: true, members: true },
    removeItems: { guests: true, members: true },
    persistCart: { guests: false, members: true }, // Members get server-side cart persistence
  },

  checkout: {
    guestCheckout: { guests: true, members: false }, // Only for guests
    memberCheckout: { guests: false, members: true },
    saveShippingAddress: { guests: false, members: true },
    savePaymentMethods: { guests: false, members: true },
    expressCheckout: { guests: false, members: true }, // Using saved addresses
  },

  // Account Features
  account: {
    orderHistory: { guests: false, members: true },
    orderTracking: { guests: false, members: true },
    reorderPreviousOrders: { guests: false, members: true },
    manageAddresses: { guests: false, members: true },
    managePaymentMethods: { guests: false, members: true },
    accountSettings: { guests: false, members: true },
  },

  // Member Benefits
  memberBenefits: {
    memberPricing: { guests: false, members: true },
    earlyAccess: { guests: false, members: true },
    memberOnlyProducts: { guests: false, members: true },
    loyaltyProgram: { guests: false, members: true },
    personalizedRecommendations: { guests: false, members: true },
    memberSupport: { guests: false, members: true },
  },

  // Communication Features
  communication: {
    orderNotifications: { guests: true, members: true }, // Via email
    marketingEmails: { guests: false, members: true }, // Opt-in for members
    wishlistReminders: { guests: false, members: true },
    restockNotifications: { guests: false, members: true },
  },

  // Social & Community Features
  social: {
    productReviews: { guests: false, members: true },
    wishlist: { guests: false, members: true },
    shareProducts: { guests: true, members: true },
    ratingsAndReviews: { guests: false, members: true },
  },

  // Admin Features
  admin: {
    manageProducts: { guests: false, members: false, admin: true },
    manageOrders: { guests: false, members: false, admin: true },
    manageUsers: { guests: false, members: false, admin: true },
    analytics: { guests: false, members: false, admin: true },
  },
} as const;

// Helper functions
export function canAccessFeature(
  feature: string,
  subFeature: string,
  userType: 'guest' | 'member' | 'admin'
): boolean {
  const featureObj = (FEATURES as any)[feature]?.[subFeature];
  if (!featureObj) return false;

  switch (userType) {
    case 'guest':
      return featureObj.guests || false;
    case 'member':
      return featureObj.members || false;
    case 'admin':
      return featureObj.admin || featureObj.members || false;
    default:
      return false;
  }
}

export function getUserType(session: any): 'guest' | 'member' | 'admin' {
  if (!session) return 'guest';

  // Check if user has admin role
  if (
    session.user?.app_metadata?.role === 'admin' ||
    session.user?.user_metadata?.role === 'admin'
  ) {
    return 'admin';
  }

  return 'member';
}

// Get list of features available to user type
export function getAvailableFeatures(userType: 'guest' | 'member' | 'admin') {
  const available: string[] = [];

  Object.entries(FEATURES).forEach(([category, features]) => {
    Object.entries(features).forEach(([feature, access]) => {
      if (canAccessFeature(category, feature, userType)) {
        available.push(`${category}.${feature}`);
      }
    });
  });

  return available;
}

// Member benefits for marketing/conversion
export const MEMBER_BENEFITS = [
  {
    icon: '💾',
    title: 'Saved Information',
    description: 'Save shipping addresses and payment methods for express checkout',
    category: 'convenience',
  },
  {
    icon: '📦',
    title: 'Order History',
    description: 'Track all your orders, reorder favorites, and view purchase history',
    category: 'tracking',
  },
  {
    icon: '💰',
    title: 'Member Pricing',
    description: 'Access exclusive member discounts and special offers',
    category: 'savings',
  },
  {
    icon: '⭐',
    title: 'Early Access',
    description: 'Be the first to shop new arrivals and limited edition items',
    category: 'exclusivity',
  },
  {
    icon: '🎯',
    title: 'Personalized Experience',
    description: 'Get product recommendations based on your purchase history',
    category: 'personalization',
  },
  {
    icon: '❤️',
    title: 'Wishlist',
    description: 'Save items for later and get notified when they go on sale',
    category: 'convenience',
  },
  {
    icon: '📧',
    title: 'Smart Notifications',
    description: 'Get notified about order updates, restocks, and exclusive deals',
    category: 'communication',
  },
  {
    icon: '🏆',
    title: 'Loyalty Rewards',
    description: 'Earn points on every purchase and unlock exclusive rewards',
    category: 'rewards',
  },
];

export default FEATURES;
