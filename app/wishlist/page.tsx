'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Loader2 } from 'lucide-react';
import Image from 'next/image';
import ProductModal from '@/componenets/ProductModel';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated, isLoading } = useCart();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
  };

  const handleReviewSubmit = (id: number, newRating: number, newCount: number) => {
    console.log('Review submitted:', { id, newRating, newCount });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Loader2 size={64} className="mx-auto text-indigo-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold mb-4">Loading your wishlist...</h2>
        <p className="text-gray-500">Please wait while we fetch your items.</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to access your wishlist.</p>
        <Link
          href="/login"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block"
        >
          Log In
        </Link>
      </div>
    );
  }

  // Empty wishlist
  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Start adding products you love to your wishlist.</p>
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Wishlist ({wishlist.length} item{wishlist.length > 1 ? 's' : ''})</h2>
        <div className="text-sm text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
          Favorites saved securely
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {wishlist.map((item) => (
            <li key={item.product_id} className="flex justify-between items-center p-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div
                  className="cursor-pointer"
                  onClick={() => handleProductClick(item.product_id)}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded hover:opacity-80 transition-opacity"
                  />
                </div>
                <div>
                  <h3
                    className="font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => handleProductClick(item.product_id)}
                  >
                    {item.name}
                  </h3>
                  {item.category && (
                    <p className="text-sm text-gray-500">{item.category}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Product Modal */}
      {selectedProductId && (
        <ProductModal
          productId={selectedProductId}
          onClose={handleCloseModal}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
