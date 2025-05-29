'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Rating = {
  id: number;
  rate: number;
  count: number;
};

type UserReview = {
  rating: number;
  experience: string;
};

type RatingsState = {
  [key: number]: Rating;
};

type RatingsContextType = {
  ratings: RatingsState;
  updateRating: (id: number, rate: number, count: number) => void;
  getUserReview: (productId: number) => UserReview | null;
  deleteUserReview: (productId: number) => void;
  isReviewed: (productId: number) => boolean;
};

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  // Change the state structure to an object with productId as keys
  const [ratings, setRatings] = useState<RatingsState>({});

  // Load ratings from localStorage on mount
  useEffect(() => {
    const loadRatings = () => {
      const storedRatings = localStorage.getItem('verideal_ratings');
      if (storedRatings) {
        setRatings(JSON.parse(storedRatings));
      }
    };

    loadRatings();
  }, []);

  // Save ratings to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(ratings).length > 0) {
      localStorage.setItem('verideal_ratings', JSON.stringify(ratings));
    }
  }, [ratings]);

  const updateRating = (id: number, rate: number, count: number) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [id]: { id, rate, count }
    }));
  };

  const getUserReview = (productId: number): UserReview | null => {
    const reviewStorageKey = `verideal_review_${productId}`;
    const savedReview = localStorage.getItem(reviewStorageKey);
    
    if (savedReview) {
      return JSON.parse(savedReview);
    }
    
    return null;
  };

  const deleteUserReview = (productId: number) => {
    const reviewStorageKey = `verideal_review_${productId}`;
    localStorage.removeItem(reviewStorageKey);
    
    // Update the ratings state if this product has a rating entry
    setRatings(prevRatings => {
      if (!prevRatings[productId]) {
        return prevRatings;
      }
      
      // Get the product's original rating without the user's review
      const product = prevRatings[productId];
      const userReview = getUserReview(productId);
      
      // If there was no user review, just return the current state
      if (!userReview) {
        return prevRatings;
      }
      
      // Calculate the original rating and count before user's review
      const newCount = Math.max(0, product.count - 1);
      
      // If this was the only review, remove the rating entirely
      if (newCount === 0) {
        const newRatings = { ...prevRatings };
        delete newRatings[productId];
        return newRatings;
      }
      
      // Otherwise, recalculate the average excluding the user's rating
      const totalPoints = product.rate * product.count;
      const pointsWithoutUser = totalPoints - userReview.rating;
      const newRate = newCount > 0 ? pointsWithoutUser / newCount : 0;
      
      // Update with the recalculated values
      return {
        ...prevRatings,
        [productId]: {
          ...product,
          rate: newRate,
          count: newCount
        }
      };
    });
  };

  const isReviewed = (productId: number) => {
    const reviewStorageKey = `verideal_review_${productId}`;
    return localStorage.getItem(reviewStorageKey) !== null;
  };

  const value = {
    ratings,
    updateRating,
    getUserReview,
    deleteUserReview,
    isReviewed
  };

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
}