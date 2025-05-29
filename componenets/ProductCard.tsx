'use client';
import React from 'react';
import { FaStar, FaHeart } from 'react-icons/fa';
import { CartItem, useCart } from '@/context/CartContext';
import { WishlistItem } from '@/context/WishlistContext';
import { useRatings } from '@/context/RatingsContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  onClick: (id: number) => void;
};

export default function ProductCard({
  id,
  name,
  image,
  price,
  description,
  category,
  rating = 0,
  reviewCount = 0,
  onClick,
}: ProductCardProps) {
  const { cartItems, addToCart, isAuthenticated } = useCart();
  const isInCart = cartItems.some(item => item.id === id);
  const { ratings } = useRatings();
  const { wishlist, addToWishlist, removeFromWishlist, isAuthenticated: isWishlistAuthenticated } = useWishlist();
  const router = useRouter();

  const isWishlisted = wishlist.some(item => item.product_id === id);
  const ratingInfo = ratings[id];
  const actualRating = ratingInfo ? ratingInfo.rate : rating;
  const actualCount = ratingInfo ? ratingInfo.count : reviewCount;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCart) {
      const item: CartItem = { id, name, image, price, description, category, quantity: 1 };
      addToCart(item);
      toast.success('Item added to cart!', {
        style: {
          background: '#dcfce7',
          color: '#065f46',
          border: '1px solid #22c55e',
        },
      });
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is authenticated
    if (!isWishlistAuthenticated) {
      toast.error('Please log in to add items to your wishlist', {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
        },
      });
      router.push('/login');
      return;
    }

    const item: WishlistItem = { 
      product_id: id, 
      name, 
      image, 
      price, 
      description, 
      category 
    };

    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist(item);
    }
  };

  return (
    <div
      onClick={() => onClick(id)}
      className="relative bg-white text-black rounded-lg shadow-lg p-4 flex flex-col h-full cursor-pointer hover:shadow-xl transition-shadow duration-200"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-gray-100 hover:scale-110 transition-all duration-200"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <FaHeart
          size={20}
          className={`transition-colors duration-200 ${
            isWishlisted 
              ? 'text-red-500 drop-shadow-sm' 
              : 'text-gray-300 hover:text-gray-400'
          }`}
        />
      </button>

      <img 
        src={image} 
        alt={name} 
        className="h-60 w-full object-contain mb-4 bg-gray-50 rounded-md" 
      />
      
      <h3 className="text-xl font-semibold mb-2 line-clamp-1 hover:text-indigo-600 transition-colors">
        {name}
      </h3>
      
      <p className="text-gray-600 mb-2 flex-grow line-clamp-2 text-sm">
        {description}
      </p>

      {/* Rating */}
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, idx) => (
          <FaStar
            key={idx}
            size={16}
            color={idx < Math.round(actualRating) ? '#FFC107' : '#E4E5E9'}
            className="mr-1"
          />
        ))}
        <span className="text-gray-500 text-sm ml-1">({actualCount})</span>
      </div>

      {/* Price and Add to Cart */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <p className="text-xl font-bold text-gray-900">${price.toFixed(2)}</p>
        <button
          onClick={handleAddToCart}
          disabled={isInCart}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isInCart 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
          }`}
        >
          {isInCart ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}