"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Loader2, Plus, Minus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    updateQuantity,
    isLoading,
    isAuthenticated,
  } = useCart();
  const router = useRouter();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center py-24">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-black mb-6 mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">Securing your collection...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-black">
        <div className="max-w-4xl mx-auto py-24 px-8 text-center border-b border-black/10">
          <h2 className="text-5xl font-serif tracking-tighter mb-4">Exclusive Access</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold mb-12">
            Please sign in to view your reserved pieces.
          </p>
          <Link
            href="/login"
            className="inline-block px-12 py-4 bg-black text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#800000] transition-colors"
          >
            Authenticate
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-black">
        <div className="max-w-4xl mx-auto py-32 px-8 text-center border-b border-black/10">
          <h2 className="text-5xl font-serif tracking-tighter mb-4">Your Bag is Empty</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold mb-12">
            Discover the latest arrivals in our curated collections.
          </p>
          <Link
            href="/collections"
            className="inline-block px-12 py-4 bg-black text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#800000] transition-colors"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-black/10 pb-8 gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif tracking-tighter">Your Bag</h1>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 text-right">
            {totalItems} {totalItems === 1 ? "Piece Selected" : "Pieces Selected"}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart Items */}
          <div className="flex-1 space-y-8">
            {cartItems.map((item) => (
              <div key={item.id} className="group flex flex-col md:flex-row gap-8 pb-8 border-b border-black/5">
                {/* Visual */}
                <div
                  className="w-full md:w-40 h-56 flex-shrink-0 cursor-pointer border border-black/10 transition-all duration-700 bg-black/5"
                  onClick={() => handleProductClick(item.id)}
                  style={{
                    backgroundColor: [
                      "#FDFBF7", "#F8F5F0", "#F4ECE2", "#E8E2D9", "#F2F0EB", "#FAF3E0"
                    ][item.id % 6]
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 backdrop-blur-sm">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border border-black px-4 py-2 bg-white/50">
                      View Piece
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="text-2xl font-serif cursor-pointer hover:text-[#800000] transition-colors"
                        onClick={() => handleProductClick(item.id)}
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-black/40 hover:text-red-600 transition-colors p-2 -mr-2"
                        aria-label="Remove item"
                      >
                        <X size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
                        {item.category}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-8 gap-6">
                    {/* Quantity */}
                    <div className="flex items-center border border-black/10">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center text-sm font-light">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">Total</p>
                      <p className="text-xl font-serif">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-between">
              <Link href="/collections" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:text-[#800000] transition-colors border-b border-transparent hover:border-[#800000] pb-1">
                Back to Collections
              </Link>
              <button
                onClick={clearCart}
                className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 hover:text-red-600 transition-colors"
              >
                Empty Bag
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white border border-black/5 p-8 lg:p-12 sticky top-8">
              <h3 className="text-2xl font-serif mb-8 border-b border-black/5 pb-4">Order Summary</h3>

              <div className="space-y-4 mb-8 text-sm font-light">
                <div className="flex justify-between">
                  <span className="opacity-60">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Shipping</span>
                  <span className="text-black uppercase tracking-[0.1em] text-[10px] font-bold">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Taxes</span>
                  <span className="opacity-60">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-black/10 pt-6 mb-10 flex justify-between items-end">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Estimated Total</span>
                <span className="text-3xl font-serif text-[#800000]">₹{subtotal.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-black text-white px-8 py-5 text-center text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#800000] transition-all duration-300"
              >
                Proceed to Secure Checkout
              </Link>

              <div className="mt-8 text-center space-y-2">
                <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-30">Complimentary Returns</p>
                <p className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-20">within 14 days of delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
