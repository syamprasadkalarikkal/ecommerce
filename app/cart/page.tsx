'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Loader2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import ProductModal from '@/componenets/ProductModel';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, updateQuantity, isLoading, isAuthenticated } = useCart();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
  };

  const handleReviewSubmit = (id: number, newRating: number, newCount: number) => {
    console.log('Review submitted:', { id, newRating, newCount });
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Loader2 size={64} className="mx-auto text-indigo-600 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold mb-4">Loading your cart...</h2>
        <p className="text-gray-500">Please wait while we fetch your items.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please log in to view your cart</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to access your shopping cart.</p>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block">
          Log In
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&rsquo;t added any products to your cart yet.</p>
        <Link href="/products" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h2>
        <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Cart auto-saves
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <li key={item.id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
                {/* Product Image and Info */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div 
                    className="cursor-pointer flex-shrink-0"
                    onClick={() => handleProductClick(item.id)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium text-lg cursor-pointer hover:text-indigo-600 transition-colors truncate"
                      onClick={() => handleProductClick(item.id)}
                    >
                      {item.name}
                    </h3>
                    {item.category && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{item.category}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">${item.price.toFixed(2)} each</p>
                  </div>
                </div>

                {/* Quantity and Price Actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between md:w-2/5 space-y-4 md:space-y-0 md:space-x-6">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 md:justify-center">
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">Qty:</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-medium text-lg">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                      title="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price and Remove Button */}
                  <div className="flex flex-col items-end text-right">
                    <span className="text-xl font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 text-sm font-medium transition-colors mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 text-lg">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          <span className="text-lg font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-6 font-bold border-t pt-4">
          <span className="text-xl">Total</span>
          <span className="text-2xl text-gray-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between mt-6 space-y-3 sm:space-y-0 gap-3">
          <button
            onClick={clearCart}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 font-medium transition-colors"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 text-center font-medium transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
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
