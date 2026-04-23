"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ChevronLeft, X, Tag, ShoppingCart, Plus, Minus } from "lucide-react";
import ProductRating from "@/componenets/ProductRating";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">
          There are no items in your cart to checkout.
        </p>
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-black">
      <div className="mb-12">
        <Link
          href="/cart"
          className="flex items-center text-xs uppercase tracking-[0.2em] font-medium text-foreground hover:opacity-70 transition-opacity w-fit"
        >
          <ChevronLeft size={16} />
          <span className="ml-2 border-b border-transparent hover:border-foreground transition-all">Back to cart</span>
        </Link>
      </div>

      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-xs uppercase tracking-[0.4em] opacity-60 mb-4 block">Review Order</span>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tighter">Your Bag</h1>
        <div className="w-16 h-px bg-accent mt-8"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-background border border-black/10 flex flex-col justify-between relative group hover:border-black/30 transition-colors"
          >
            {/* Remove button */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="absolute top-4 right-4 bg-background border border-transparent hover:border-red-600 rounded-full p-1 z-10 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Remove item"
              title="Remove item"
            >
              <X size={16} className="text-red-600" />
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
                  className="font-serif text-lg mb-2 cursor-pointer hover:underline underline-offset-4"
                  onClick={() => handleProductClick(item.id)}
                >
                  {item.name}
                </h3>

                {/* Use our reusable ProductRating component */}
                <div className="mb-3 opacity-80">
                  <ProductRating
                    productId={item.id}
                    initialRating={item.rating?.rate || 0}
                    initialCount={item.rating?.count || 0}
                  />
                </div>

                {item.category && (
                  <div className="flex items-center mb-6 text-xs uppercase tracking-widest text-foreground/60">
                    <Tag size={12} className="mr-2" />
                    <span>{item.category}</span>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest font-medium text-foreground mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 border border-black/30 flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-serif text-lg">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 border border-black/30 flex items-center justify-center hover:bg-black/5 transition-colors"
                      aria-label="Increase quantity"
                      title="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Price Information */}
                <div className="mb-6 pt-4 border-t border-black/10">
                  <div className="font-serif text-xl">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-xs uppercase tracking-widest text-foreground/50 mt-1">
                      ₹{item.price.toFixed(2)} each
                    </div>
                  )}
                </div>
              </div>

              {/* Buy Now button always at bottom */}
              <div className="mt-auto">
                <Link
                  href={`/products/${item.id}/payment`}
                  className="block w-full border border-black text-foreground py-3 text-center hover:bg-black hover:text-white transition-colors text-xs uppercase tracking-[0.2em] font-bold"
                >
                  Place Order (₹{(item.price * item.quantity).toFixed(2)})
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-16 border-t border-black/10 pt-12 flex flex-col items-end">
        <div className="w-full md:w-1/2 lg:w-1/3 space-y-6">
          <div className="flex justify-between items-center text-sm uppercase tracking-widest border-b border-black/10 pb-4">
            <span className="text-foreground/70">
              Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              {cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1
                ? "item"
                : "items"}
              )
            </span>
            <span className="font-serif text-2xl text-foreground">₹{subtotal.toFixed(2)}</span>
          </div>

          <p className="text-xs text-foreground/50 italic text-right">
            Shipping & taxes calculated at checkout
          </p>

          <div className="flex flex-col space-y-3 pt-4">
            <Link
              href="/checkout/all-payment"
              className="w-full flex justify-center items-center bg-black text-white px-10 py-5 hover:bg-[#800000] transition-colors duration-500 text-xs uppercase tracking-[0.2em] font-bold"
            >
              <ShoppingCart size={16} className="mr-3" />
              Proceed to Checkout
            </Link>

            <button
              onClick={clearCart}
              className="w-full py-4 text-xs uppercase tracking-[0.2em] font-bold text-foreground/50 hover:text-black transition-colors"
            >
              Clear Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
