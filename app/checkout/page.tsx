'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ChevronLeft, X, Tag, ShoppingCart, Plus, Minus } from 'lucide-react';
import ProductRating from '@/componenets/ProductRating';
import ProductModal from '@/componenets/ProductModel';
import Image from 'next/image';


export default function CheckoutPage() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  const handleCloseModal = () => {
    setSelectedProductId(null);
  };

  const handleReviewSubmit = (id: number, newRating: number, newCount: number) => {
    // Handle review submission if needed
    console.log('Review submitted:', { id, newRating, newCount });
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">There are no items in your cart to checkout.</p>
        <Link href="/products" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-black">
      <div className="mb-6">
        <Link href="/cart" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft size={20} />
          <span className="ml-1">Back to cart</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md flex flex-col justify-between overflow-hidden relative">
            {/* Remove button */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 z-10"
              aria-label="Remove item"
              title="Remove item"
            >
              <X size={20} className="text-red-600" />
            </button>

            <div className="p-4 flex flex-col h-full">
              <div>
                <div 
                  className="cursor-pointer"
                  onClick={() => handleProductClick(item.id)}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={300}
                    className="h-48 w-full object-contain mb-4 hover:opacity-80 transition-opacity"
                  />
                </div>

                <h3 
                  className="font-bold text-lg mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleProductClick(item.id)}
                >
                  {item.name}
                </h3>

                {/* Use our reusable ProductRating component */}
                <div className="mb-2">
                  <ProductRating 
                    productId={item.id} 
                    initialRating={item.rating?.rate || 0}
                    initialCount={item.rating?.count || 0}
                  />
                </div>
                
                {item.category && (
                  <div className="flex items-center mb-2 text-sm text-gray-600">
                    <Tag size={16} className="mr-1 text-gray-500" />
                    <span>{item.category}</span>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      aria-label="Increase quantity"
                      title="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Price Information */}
                <div className="mb-4">
                  <div className="text-xl font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  {item.quantity > 1 && (
                    <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                  )}
                </div>
              </div>

              {/* Buy Now button always at bottom */}
              <div className="mt-auto">
                <Link
                  href={`/products/${item.id}/payment`}
                  className="block w-full bg-yellow-600 text-white py-2 text-center rounded hover:bg-yellow-700 font-medium"
                >
                  Place Order (${(item.price * item.quantity).toFixed(2)})
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} {cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'})</span>
          <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
          <button
            onClick={clearCart}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
          >
            Clear All
          </button>
          
          <Link
            href="/checkout/all-payment"
            className="flex justify-center items-center bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-medium"
          >
            <ShoppingCart size={20} className="mr-2" />
            Buy All Products (${subtotal.toFixed(2)})
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