// Wishlist service for managing user wishlists
import React from 'react';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category_id: string;
    inventory_count: number;
  };
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  shareCode?: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export class WishlistService {
  // Add item to wishlist
  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  // Get user's wishlist
  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const response = await fetch(`/api/wishlist/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  // Check if product is in wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getUserWishlist(userId);
      return wishlist.some((item) => item.productId === productId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  // Toggle wishlist item
  async toggleWishlist(userId: string, productId: string): Promise<boolean> {
    const isInWishlist = await this.isInWishlist(userId, productId);

    if (isInWishlist) {
      return await this.removeFromWishlist(userId, productId);
    } else {
      return await this.addToWishlist(userId, productId);
    }
  }

  // Move wishlist item to cart
  async moveToCart(userId: string, productId: string, quantity = 1): Promise<boolean> {
    try {
      // Add to cart
      const addToCartResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (addToCartResponse.ok) {
        // Remove from wishlist
        await this.removeFromWishlist(userId, productId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error moving to cart:', error);
      return false;
    }
  }

  // Share wishlist
  async shareWishlist(userId: string): Promise<string | null> {
    try {
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.shareCode;
      }

      return null;
    } catch (error) {
      console.error('Error sharing wishlist:', error);
      return null;
    }
  }

  // Get shared wishlist
  async getSharedWishlist(shareCode: string): Promise<Wishlist | null> {
    try {
      const response = await fetch(`/api/wishlist/shared/${shareCode}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching shared wishlist:', error);
      return null;
    }
  }

  // Clear wishlist
  async clearWishlist(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  }

  // Get wishlist statistics
  async getWishlistStats(userId: string): Promise<{
    totalItems: number;
    totalValue: number;
    averagePrice: number;
    oldestItem: string;
    newestItem: string;
  }> {
    try {
      const wishlist = await this.getUserWishlist(userId);

      const totalItems = wishlist.length;
      const totalValue = wishlist.reduce((sum, item) => sum + (item.product?.price || 0), 0);
      const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

      const sortedByDate = [...wishlist].sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      );

      const oldestItem = sortedByDate[0]?.addedAt || '';
      const newestItem = sortedByDate[sortedByDate.length - 1]?.addedAt || '';

      return {
        totalItems,
        totalValue,
        averagePrice,
        oldestItem,
        newestItem,
      };
    } catch (error) {
      console.error('Error getting wishlist stats:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        averagePrice: 0,
        oldestItem: '',
        newestItem: '',
      };
    }
  }

  // Get price drop alerts for wishlist items
  async getPriceDropAlerts(userId: string): Promise<WishlistItem[]> {
    try {
      const response = await fetch(`/api/wishlist/${userId}/price-drops`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching price drop alerts:', error);
      return [];
    }
  }

  // Set price alert for wishlist item
  async setPriceAlert(userId: string, productId: string, targetPrice: number): Promise<boolean> {
    try {
      const response = await fetch('/api/wishlist/price-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
          targetPrice,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error setting price alert:', error);
      return false;
    }
  }
}

// Create singleton instance
export const wishlistService = new WishlistService();

// React hook for wishlist
export function useWishlist(userId?: string) {
  const [wishlist, setWishlist] = React.useState<WishlistItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      loadWishlist();
    }
  }, [userId]);

  const loadWishlist = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const items = await wishlistService.getUserWishlist(userId);
      setWishlist(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!userId) return false;

    const success = await wishlistService.addToWishlist(userId, productId);
    if (success) {
      await loadWishlist();
    }
    return success;
  };

  const removeFromWishlist = async (productId: string) => {
    if (!userId) return false;

    const success = await wishlistService.removeFromWishlist(userId, productId);
    if (success) {
      await loadWishlist();
    }
    return success;
  };

  const toggleWishlist = async (productId: string) => {
    if (!userId) return false;

    const success = await wishlistService.toggleWishlist(userId, productId);
    if (success) {
      await loadWishlist();
    }
    return success;
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refresh: loadWishlist,
  };
}

// Utility functions
export function formatWishlistValue(totalValue: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalValue);
}

export function getWishlistItemAge(addedAt: string): string {
  const now = new Date();
  const added = new Date(addedAt);
  const diffInDays = Math.floor((now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}
