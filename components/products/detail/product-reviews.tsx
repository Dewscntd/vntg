'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  rating: number;
  title: string;
  content: string;
  created_at: string;
  helpful_count: number;
  unhelpful_count: number;
  verified_purchase: boolean;
}

export interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>; // e.g., { 5: 10, 4: 5, 3: 3, 2: 1, 1: 0 }
  className?: string;
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  ratingCounts,
  className,
}: ProductReviewsProps) {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [visibleReviews, setVisibleReviews] = useState(3);

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const loadMoreReviews = () => {
    setVisibleReviews((prev) => prev + 3);
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate percentage for rating bars
  const calculatePercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Overall rating summary */}
        <div className="flex flex-col items-center space-y-2 md:w-1/3">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-5 w-5',
                    star <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating breakdown */}
        <div className="space-y-2 md:w-2/3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <div className="flex w-24 items-center space-x-1">
                <span className="text-sm">{rating}</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${calculatePercentage(ratingCounts[rating] || 0)}%` }}
                />
              </div>
              <div className="w-16 text-right text-sm text-muted-foreground">
                {ratingCounts[rating] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Reviews</h3>
          <div className="space-y-4">
            {reviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted">
                      {review.user.avatar_url ? (
                        <img
                          src={review.user.avatar_url}
                          alt={review.user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                        {review.verified_purchase && (
                          <span className="ml-2 text-green-600 dark:text-green-500">
                            Verified Purchase
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">{review.title}</h4>
                  <div
                    className={cn(
                      'mt-1 text-sm',
                      !expandedReviews[review.id] && review.content.length > 200
                        ? 'line-clamp-3'
                        : ''
                    )}
                  >
                    {review.content}
                  </div>
                  {review.content.length > 200 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => toggleReviewExpansion(review.id)}
                    >
                      {expandedReviews[review.id] ? (
                        <>
                          <ChevronUp className="mr-1 h-3 w-3" /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3 w-3" /> Read more
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-muted-foreground">Was this review helpful?</span>
                  <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{review.helpful_count}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                    <ThumbsDown className="h-3 w-3" />
                    <span>{review.unhelpful_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load more button */}
          {visibleReviews < reviews.length && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMoreReviews}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  );
}
