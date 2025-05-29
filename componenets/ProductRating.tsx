'use client';

import React from 'react';
import { FaStar } from 'react-icons/fa';
import { useRatings } from '@/context/RatingsContext';


type ProductRatingProps = {
  productId: number;
  initialRating?: number;
  initialCount?: number;
  showCount?: boolean;
  size?: number;
};


export default function ProductRating({
  productId,
  initialRating = 0,
  initialCount = 0,
  showCount = true,
  size = 20
}: ProductRatingProps) {
  const { ratings, getUserReview } = useRatings();
  
  // Get rating from context or use initial values
  const ratingInfo = ratings[productId];
  const userReview = getUserReview(productId);
  
  // Calculate the display rating
  let displayRating = initialRating;
  let reviewCount = initialCount;
  
  // If we have rating info in our context, use that instead
  if (ratingInfo) {
    displayRating = ratingInfo.rate;
    reviewCount = ratingInfo.count;
  }
  
  // If the user has submitted a review but it's not in the ratings context yet,
  // we need to manually adjust the rating (this is an edge case)
  if (userReview && !ratingInfo) {
    const userRating = userReview.rating;
    // Calculate the new average including the user's rating
    displayRating = ((displayRating * reviewCount) + userRating) / (reviewCount + 1);
    reviewCount += 1;
  }

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, idx) => (
        <FaStar
          key={idx}
          className="mr-1"
          size={size}
          color={idx < Math.round(displayRating) ? '#FFC107' : '#E4E5E9'}
        />
      ))}
      {showCount && (
        <span className="ml-2 text-gray-600">
          {displayRating.toFixed(1)} ({reviewCount} reviews)
        </span>
      )}
    </div>
  );
}