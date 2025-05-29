'use client';
import React, { useState, useEffect } from "react";
import { fetchAllProducts } from "@/services/api";
import { useRatings } from "@/context/RatingsContext";
import ProductCard from './ProductCard'; 
import ProductModal from "./ProductModel";

export default function NewArrival() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { ratings } = useRatings();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const getNewArrivals = async () => {
      try {
        const allProducts = await fetchAllProducts();
        const newArrivals = allProducts.slice(-4);
        setProducts(newArrivals);
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    getNewArrivals();
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
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">New Arrivals</h2>
        <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="w-full h-60 bg-gray-300 rounded-md"></div>
              <div className="mt-4 h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="mt-4 h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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