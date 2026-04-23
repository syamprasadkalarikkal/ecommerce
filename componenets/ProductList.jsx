"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchAllProducts } from "@/services/api";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";
import ProductFilters from "./ProductFilter";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const router = useRouter();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    fetchAllProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch(() => setError("Failed to load collection"))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
  };

  const handleClearAllFilters = () => {
    setCurrentCategory(null);
    setPriceRange({ min: 0, max: 2000 });
    setSelectedSize(null);
    setSelectedColor(null);
  };

  // Filtered products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (currentCategory) {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }

    // Apply price filter
    filtered = filtered.filter((p) => {
      return p.price >= priceRange.min && p.price <= priceRange.max;
    });

    // Apply size filter
    if (selectedSize) {
      filtered = filtered.filter((p) => p.sizes?.includes(selectedSize));
    }

    // Apply color filter
    if (selectedColor) {
      filtered = filtered.filter((p) => p.colors?.includes(selectedColor));
    }

    return filtered;
  }, [products, currentCategory, priceRange, selectedSize, selectedColor]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      {/* Filters Component */}
      <ProductFilters
        products={products}
        currentCategory={currentCategory}
        priceRange={priceRange}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
        onSizeChange={setSelectedSize}
        onColorChange={setSelectedColor}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Results Header - Editorial Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent">Kalika Archive</span>
            <div className="h-px w-8 bg-accent/30"></div>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none capitalize">
            {currentCategory ? currentCategory : "The Collection"}
          </h2>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">
          Showing {filteredProducts.length} curated pieces
        </div>
      </div>

      {/* Product Grid - Refined Spacing */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              onClick={(id) => router.push(`/products/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-t border-foreground/5 bg-stone-50/50">
          <p className="text-2xl font-serif italic opacity-40 mb-8">
            This collection is currently being curated.
          </p>
          <button
            onClick={handleClearAllFilters}
            className="text-[10px] font-bold uppercase tracking-[0.4em] underline hover:text-[#800000] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
