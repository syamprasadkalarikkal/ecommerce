'use client';
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { fetchAllProducts } from "@/services/api";
import { useRatings } from "@/context/RatingsContext";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModel";

export default function Featured() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart } = useCart();
  const { ratings } = useRatings();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const getFeaturedProducts = async () => {
      try {
        const allProducts = await fetchAllProducts();
        const randomProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, 4);
        setProducts(randomProducts);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    getFeaturedProducts();
  }, []);

  

  const handleReviewSubmit = (id: number, newRating: number, newCount: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, rating: { rate: newRating, count: newCount } }
          : p
      )
    );
  };

 
 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
      <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name || product.title}
            image={product.image}
            price={product.price}
            description={product.description}
            category={product.category}
            rating={ratings[product.id]?.rate ?? product.rating?.rate}
            reviewCount={ratings[product.id]?.count ?? product.rating?.count}
            onClick={setSelectedId}
          />
        ))}
      </div>

      {selectedId !== null && (
        <ProductModal
          productId={selectedId}
          onClose={() => setSelectedId(null)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
