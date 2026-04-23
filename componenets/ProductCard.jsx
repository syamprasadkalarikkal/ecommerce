"use client";
import React from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useRatings } from "@/context/RatingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProductCard({
  id,
  name,
  image,
  price,
  description,
  category,
  sizes = [],
  colors = [],
  onClick,
}) {
  const { cartItems, addToCart, isAuthenticated } = useCart();
  const isInCart = cartItems.some((item) => item.id === id);
  const { ratings } = useRatings();
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isAuthenticated: isWishlistAuthenticated,
  } = useWishlist();
  const router = useRouter();

  const isWishlisted = wishlist.some((item) => item.product_id === id);
  const ratingInfo = ratings[id] || { rate: 0, count: 0 };
  const actualRating = ratingInfo.rate;
  const actualCount = ratingInfo.count;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isInCart) {
      const item = {
        id,
        name,
        image,
        price,
        description,
        category,
        quantity: 1,
      };
      addToCart(item);
      toast.success("Item added to cart!", {
        style: {
          background: "#dcfce7",
          color: "#065f46",
          border: "1px solid #22c55e",
        },
      });
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();

    // Check if user is authenticated
    if (!isWishlistAuthenticated) {
      toast.error("Please log in to add items to your wishlist", {
        style: {
          background: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #f87171",
        },
      });
      router.push("/login");
      return;
    }

    const item = {
      product_id: id,
      name,
      image,
      price,
      description,
      category,
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
      className="relative flex flex-col h-full cursor-pointer group bg-transparent border-0"
    >
      {/* Minimalist Color Block instead of Image */}
      <div
        className="relative aspect-[3/4] w-full mb-6 overflow-hidden transition-all duration-700 group-hover:shadow-2xl flex items-center justify-center border border-black/10"
        style={{
          backgroundColor: [
            "#FDFBF7", // Cream
            "#F8F5F0", // Off-white
            "#F4ECE2", // Warm sand
            "#E8E2D9", // Desert
            "#F2F0EB", // Soft gray
            "#FAF3E0", // Papaya
          ][id % 6]
        }}
      >
        <div className="opacity-10 text-[60px] font-serif select-none">
          {category?.charAt(0).toUpperCase()}
        </div>

        {/* Wishlist Button - Minimalist Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md transform translate-y-2 group-hover:translate-y-0"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <FaHeart
              size={14}
              className="transition-colors duration-300 text-[#D4AF37] scale-110"
            />
          ) : (
            <FaRegHeart
              size={14}
              className="transition-colors duration-300 text-gray-400 hover:text-[#D4AF37]"
            />
          )}
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent flex justify-center backdrop-blur-[2px]">
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`w-full py-2.5 px-6 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-none bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:text-gray-400`}
          >
            {isInCart ? "In Your Selection" : "Add To Collection"}
          </button>
        </div>
      </div>

      {/* Product Details - Clean Typography */}
      <div className="flex flex-col flex-grow px-2">
        <div className="flex justify-between items-start mb-2">
          <p className="text-lg font-serif text-accent tracking-tighter">₹{price.toFixed(2)}</p>
        </div>

        <p className="text-lg font-serif tracking-tight leading-tight mb-3 opacity-90">
          {description}
        </p>

        {/* Size Selection Row */}
        <div className="flex items-center gap-2 mb-4">
          {(sizes || ["S", "M", "L", "XL"]).slice(0, 4).map((size) => (
            <button
              key={size}
              onClick={(e) => {
                e.stopPropagation();
                toast.success(`Selected size: ${size}`);
              }}
              className="text-[9px] font-bold border border-gray-200 w-7 h-7 flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              {size}
            </button>
          ))}
        </div>

        {/* Brand Tag / Category */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-accent opacity-80">
            {category}
          </span>

          {/* Subtle Rating */}
          <div className="flex items-center">
            {[...Array(5)].map((_, idx) => (
              <FaStar
                key={idx}
                size={8}
                color={idx < Math.round(actualRating) ? "#D4AF37" : "#E4E5E9"}
                className="mr-0.5"
              />
            ))}
            <span className="text-gray-300 text-[8px] ml-1 font-sans">({actualCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
