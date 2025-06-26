// Loyalty program service for managing points, rewards, and tiers

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  pointsMultiplier: number;
  color: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_shipping' | 'product' | 'experience';
  value: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface UserLoyalty {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  currentTier: string;
  nextTier?: string;
  pointsToNextTier: number;
  lifetimeSpent: number;
  joinedAt: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  rewardId?: string;
  createdAt: string;
  expiresAt?: string;
}

export class LoyaltyService {
  private tiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      minPoints: 0,
      benefits: ['1x points on purchases', 'Birthday discount'],
      pointsMultiplier: 1,
      color: '#CD7F32',
    },
    {
      id: 'silver',
      name: 'Silver',
      minPoints: 500,
      benefits: ['1.5x points on purchases', 'Free shipping', 'Early access to sales'],
      pointsMultiplier: 1.5,
      color: '#C0C0C0',
    },
    {
      id: 'gold',
      name: 'Gold',
      minPoints: 1500,
      benefits: [
        '2x points on purchases',
        'Free shipping',
        'Priority support',
        'Exclusive products',
      ],
      pointsMultiplier: 2,
      color: '#FFD700',
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minPoints: 5000,
      benefits: [
        '3x points on purchases',
        'Free shipping',
        'Priority support',
        'Personal shopper',
        'VIP events',
      ],
      pointsMultiplier: 3,
      color: '#E5E4E2',
    },
  ];

  private rewards: LoyaltyReward[] = [
    {
      id: 'discount_10',
      name: '$10 Off',
      description: '$10 off your next purchase',
      pointsCost: 100,
      type: 'discount',
      value: 10,
      isActive: true,
    },
    {
      id: 'discount_25',
      name: '$25 Off',
      description: '$25 off your next purchase',
      pointsCost: 250,
      type: 'discount',
      value: 25,
      isActive: true,
    },
    {
      id: 'free_shipping',
      name: 'Free Shipping',
      description: 'Free shipping on your next order',
      pointsCost: 50,
      type: 'free_shipping',
      value: 0,
      isActive: true,
    },
    {
      id: 'discount_percent_15',
      name: '15% Off',
      description: '15% off your entire order',
      pointsCost: 500,
      type: 'discount',
      value: 15,
      isActive: true,
    },
  ];

  // Calculate points earned from purchase
  calculatePointsEarned(orderTotal: number, userTier: string): number {
    const tier = this.tiers.find((t) => t.id === userTier) || this.tiers[0];
    const basePoints = Math.floor(orderTotal); // 1 point per dollar
    return Math.floor(basePoints * tier.pointsMultiplier);
  }

  // Get user's current tier
  getUserTier(totalPoints: number): LoyaltyTier {
    const sortedTiers = [...this.tiers].sort((a, b) => b.minPoints - a.minPoints);
    return sortedTiers.find((tier) => totalPoints >= tier.minPoints) || this.tiers[0];
  }

  // Get next tier for user
  getNextTier(totalPoints: number): LoyaltyTier | null {
    const currentTier = this.getUserTier(totalPoints);
    const sortedTiers = [...this.tiers].sort((a, b) => a.minPoints - b.minPoints);
    const currentIndex = sortedTiers.findIndex((tier) => tier.id === currentTier.id);

    return currentIndex < sortedTiers.length - 1 ? sortedTiers[currentIndex + 1] : null;
  }

  // Calculate points needed for next tier
  getPointsToNextTier(totalPoints: number): number {
    const nextTier = this.getNextTier(totalPoints);
    return nextTier ? nextTier.minPoints - totalPoints : 0;
  }

  // Award points for purchase
  async awardPoints(userId: string, orderId: string, orderTotal: number): Promise<boolean> {
    try {
      // Get user's current loyalty data
      const userLoyalty = await this.getUserLoyalty(userId);
      const currentTier = this.getUserTier(userLoyalty.totalPoints);

      // Calculate points to award
      const pointsEarned = this.calculatePointsEarned(orderTotal, currentTier.id);

      // Award points
      const response = await fetch('/api/loyalty/award-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          points: pointsEarned,
          type: 'earned',
          description: `Points earned from order`,
          orderId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  // Redeem reward
  async redeemReward(
    userId: string,
    rewardId: string
  ): Promise<{ success: boolean; code?: string }> {
    try {
      const reward = this.rewards.find((r) => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      const response = await fetch('/api/loyalty/redeem-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          rewardId,
          pointsCost: reward.pointsCost,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, code: data.code };
      }

      return { success: false };
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return { success: false };
    }
  }

  // Get user loyalty data
  async getUserLoyalty(userId: string): Promise<UserLoyalty> {
    try {
      const response = await fetch(`/api/loyalty/user/${userId}`);
      if (response.ok) {
        return await response.json();
      }

      // Return default loyalty data if not found
      return {
        userId,
        totalPoints: 0,
        availablePoints: 0,
        currentTier: 'bronze',
        pointsToNextTier: 500,
        lifetimeSpent: 0,
        joinedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user loyalty:', error);
      throw error;
    }
  }

  // Get points history
  async getPointsHistory(userId: string, limit = 50): Promise<PointsTransaction[]> {
    try {
      const response = await fetch(`/api/loyalty/history/${userId}?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching points history:', error);
      return [];
    }
  }

  // Get available rewards
  getAvailableRewards(userPoints: number): LoyaltyReward[] {
    return this.rewards.filter((reward) => reward.isActive && reward.pointsCost <= userPoints);
  }

  // Get all rewards
  getAllRewards(): LoyaltyReward[] {
    return this.rewards.filter((reward) => reward.isActive);
  }

  // Get all tiers
  getAllTiers(): LoyaltyTier[] {
    return this.tiers;
  }

  // Check if user can redeem reward
  canRedeemReward(userPoints: number, rewardId: string): boolean {
    const reward = this.rewards.find((r) => r.id === rewardId);
    return reward ? reward.isActive && userPoints >= reward.pointsCost : false;
  }

  // Calculate tier progress percentage
  getTierProgress(totalPoints: number): number {
    const currentTier = this.getUserTier(totalPoints);
    const nextTier = this.getNextTier(totalPoints);

    if (!nextTier) return 100; // Already at highest tier

    const pointsInCurrentTier = totalPoints - currentTier.minPoints;
    const pointsNeededForNextTier = nextTier.minPoints - currentTier.minPoints;

    return Math.min(100, (pointsInCurrentTier / pointsNeededForNextTier) * 100);
  }

  // Format points display
  formatPoints(points: number): string {
    return new Intl.NumberFormat('en-US').format(points);
  }

  // Get tier color
  getTierColor(tierId: string): string {
    const tier = this.tiers.find((t) => t.id === tierId);
    return tier?.color || '#CD7F32';
  }
}

// Create singleton instance
export const loyaltyService = new LoyaltyService();

// Utility functions
export function formatPointsValue(points: number): string {
  return `${points} ${points === 1 ? 'point' : 'points'}`;
}

export function calculatePointsValue(points: number, conversionRate = 0.01): number {
  return points * conversionRate; // Default: 1 point = $0.01
}

export function formatPointsAsCurrency(points: number, conversionRate = 0.01): string {
  const value = calculatePointsValue(points, conversionRate);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
