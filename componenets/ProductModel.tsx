'use client';
import React, { useEffect, useState } from 'react';
import { fetchProductById } from '@/services/api';
import { ProductType } from '../types';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { CartItem, useCart } from '@/context/CartContext';
import { useRatings } from '@/context/RatingsContext';
import { useRouter } from 'next/navigation';

type ProductModalProps = {
  productId: number;
  onClose: () => void;
  onReviewSubmit: (id: number, newRating: number, newCount: number) => void;
};

type StoredReview = {
  rating: number;
  experience: string;
};

export default function ProductModal({ productId, onClose, onReviewSubmit }: ProductModalProps) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userExperience, setUserExperience] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const { cartItems, addToCart, isAuthenticated } = useCart();
  const { ratings, updateRating, getUserReview, deleteUserReview } = useRatings();
  const router = useRouter();
  
  const isInCart = cartItems.some(item => item.id === productId);

  const reviewStorageKey = `verideal_review_${productId}`;

  // Load product + review
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchProductById(productId);
        if (!isMounted) return;
        setProduct(data);

        // Load review from localStorage
        const userReview = getUserReview(productId);
        if (userReview) {
          setUserRating(userReview.rating);
          setUserExperience(userReview.experience);
          setSubmitted(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [productId, getUserReview]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isInCart && product) {
      const item: CartItem = {
        id: productId,
        name: product.name || '',
        image: product.image || '',
        price: product.price || 0,
        description: product.description || '',
        category: product.category || '',
        quantity: 1 // <-- Add this line
      };
      addToCart(item);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/login');
      return;
    }
    
    if (userRating > 0 && userExperience.trim() && product) {
      // Get current rating data
      const currentRating = ratings[productId];
      const initialCount = product.rating?.count || 0;
      const initialRate = product.rating?.rate || 0;
      
      // Calculate the new average rating
      const reviewCount = currentRating ? currentRating.count : initialCount;
      const oldTotal = (currentRating ? currentRating.rate : initialRate) * reviewCount;
      const newCount = reviewCount + 1;
      const newAvg = (oldTotal + userRating) / newCount;

      // Store the user's review
      const review: StoredReview = {
        rating: userRating,
        experience: userExperience,
      };
      localStorage.setItem(reviewStorageKey, JSON.stringify(review));
      
      // Update the context
      updateRating(productId, newAvg, newCount);
      setSubmitted(true);
      
      // Notify parent component
      onReviewSubmit(productId, newAvg, newCount);
    }
  };

  const handleDeleteReview = () => {
    deleteUserReview(productId);
    setSubmitted(false);
    setUserRating(0);
    setUserExperience('');
    
    // Reset the rating in the UI to the original product rating
    if (product && product.rating) {
      onReviewSubmit(productId, product.rating.rate, product.rating.count);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">Loading...</div>
    </div>
  );

  if (!product) return null;

  // Get current rating from context if available, otherwise use product data
  const productRating = ratings[productId] || {
    rate: product.rating?.rate || 0,
    count: product.rating?.count || 0
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white max-w-xl w-full p-6 rounded-lg relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className="object-contain w-full h-auto rounded"
            />
          </div>

          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            <p className="text-gray-700 mb-4">{product.description}</p>

            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, idx) => (
                <FaStar
                  key={idx}
                  className="mr-1"
                  size={20}
                  color={idx < Math.round(productRating.rate) ? '#FFC107' : '#E4E5E9'}
                />
              ))}
              <span className="ml-2 text-gray-600">
                {productRating.rate.toFixed(1)} ({productRating.count} reviews)
              </span>
            </div>

            <p className="text-xl font-semibold text-green-600 mb-4">
              ${product.price}
            </p>

            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`px-4 py-2 rounded ${
                isInCart
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isInCart ? 'Added to Cart' : 'Add to Cart'}
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Rating:</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <FaStar
                          size={24}
                          color={star <= (hoverRating || userRating) ? '#FFB800' : '#E4E5E9'}
                          className="mr-1 cursor-pointer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Your Experience:</label>
                  <textarea
                    value={userExperience}
                    onChange={e => setUserExperience(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Share your experience with this product"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Your Review</h4>
                  <button
                    onClick={handleDeleteReview}
                    className="text-gray-500 hover:text-red-600"
                    aria-label="Delete review"
                    title="Delete review"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
                <div className="flex items-center mt-1 mb-1">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar
                      key={idx}
                      size={20}
                      color={idx < userRating ? '#FFC107' : '#E4E5E9'}
                      className="mr-1"
                    />
                  ))}
                </div>
                <p className="text-gray-700">{userExperience}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}