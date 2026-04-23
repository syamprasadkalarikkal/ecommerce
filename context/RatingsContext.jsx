"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const RatingsContext = createContext(undefined);

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState({});
  const [allReviews, setAllReviews] = useState([]);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    const fetchAllReviews = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUserSession(sessionData.session);

      const { data: reviews, error } = await supabase.from('reviews').select('*');
      if (!error && reviews) {
        setAllReviews(reviews);

        // Calculate aggregates
        const aggregated = {};
        reviews.forEach(review => {
          if (!aggregated[review.product_id]) {
            aggregated[review.product_id] = { rate: 0, count: 0, totalPoints: 0 };
          }
          aggregated[review.product_id].count += 1;
          aggregated[review.product_id].totalPoints += review.rating;
          aggregated[review.product_id].rate = aggregated[review.product_id].totalPoints / aggregated[review.product_id].count;
        });
        setRatings(aggregated);
      }
    };

    fetchAllReviews();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserSession(session);
    });

    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const getProductReviews = (productId) => {
    return allReviews.filter(r => Number(r.product_id) === Number(productId));
  };

  const getUserReview = (productId) => {
    if (!userSession?.user?.id) return null;
    return allReviews.find(r => Number(r.product_id) === Number(productId) && r.user_id === userSession.user.id);
  };

  const updateRating = async (productId, rating, experience) => {
    if (!userSession?.user?.id) return;

    const newReview = {
      user_id: userSession.user.id,
      product_id: parseInt(productId),
      rating,
      experience: experience || null
    };

    const { data, error } = await supabase
      .from('reviews')
      .upsert(newReview, { onConflict: 'user_id,product_id' })
      .select()
      .single();

    if (!error && data) {
      setAllReviews(prev => {
        const filtered = prev.filter(r => !(r.user_id === userSession.user.id && Number(r.product_id) === Number(productId)));
        filtered.push(data);
        return filtered;
      });
      // Recalculate context ratings
      setRatings(prev => {
        // Quick recalc logic simplified for context sync
        const relatedReviews = [...allReviews.filter(r => !(r.user_id === userSession.user.id && Number(r.product_id) === Number(productId))), data];
        const prodReviews = relatedReviews.filter(r => Number(r.product_id) === Number(productId));
        const count = prodReviews.length;
        const totalPoints = prodReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...prev,
          [productId]: { count, rate: count > 0 ? totalPoints / count : 0, totalPoints }
        };
      });
    }
  };

  const deleteUserReview = async (productId) => {
    if (!userSession?.user?.id) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', userSession.user.id)
      .eq('product_id', parseInt(productId));

    if (!error) {
      setAllReviews(prev => prev.filter(r => !(r.user_id === userSession.user.id && Number(r.product_id) === Number(productId))));
      setRatings(prev => {
        const prodReviews = allReviews.filter(r => !(r.user_id === userSession.user.id && Number(r.product_id) === Number(productId)) && Number(r.product_id) === Number(productId));
        const count = prodReviews.length;
        const totalPoints = prodReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRatings = { ...prev };
        if (count === 0) {
          delete newRatings[productId];
        } else {
          newRatings[productId] = { count, rate: totalPoints / count, totalPoints };
        }
        return newRatings;
      });
    }
  };

  const isReviewed = (productId) => {
    return getUserReview(productId) !== undefined && getUserReview(productId) !== null;
  };

  const value = {
    ratings,
    getProductReviews,
    getUserReview,
    updateRating,
    deleteUserReview,
    isReviewed,
  };

  return (
    <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>
  );
}

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error("useRatings must be used within a RatingsProvider");
  }
  return context;
}
