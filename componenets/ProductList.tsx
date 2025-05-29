'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllProducts } from '@/services/api';
import ProductCard from './ProductCard';
import ProductModal from './ProductModel';
import ProductFilters from './ProductFilter';
import { ProductType } from '@/types';

interface PriceRange {
  min: number;
  max: number;
}

export default function ProductsList() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });

  useEffect(() => {
    fetchAllProducts()
      .then(data => {
        setProducts(data);
        // Set initial price range based on actual product prices
        if (data.length > 0) {
          const prices = data.map((p: ProductType) => p.price).filter((price: number) => true);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange({ min: minPrice, max: maxPrice });
        }
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
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

  const handleCategoryChange = (category: string | null) => {
    setCurrentCategory(category);
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    setPriceRange(range);
  };

  const handleClearAllFilters = () => {
    setCurrentCategory(null);
    const prices = products.map(p => p.price).filter(price => typeof price === 'number');
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
    setPriceRange({ min: minPrice, max: maxPrice });
  };

  // Filtered products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (currentCategory) {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Apply price filter
    filtered = filtered.filter(p => {
      const price = p.price;
      if (typeof price !== 'number') return true;
      return price >= priceRange.min && price <= priceRange.max;
    });

    return filtered;
  }, [products, currentCategory, priceRange]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Filters Component */}
      <ProductFilters
        products={products}
        currentCategory={currentCategory}
        priceRange={priceRange}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold capitalize">
          {currentCategory ? currentCategory : 'All Products'}
        </h2>
        <div className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => (
            <ProductCard
              key={p.id}
              {...p}
              rating={p.rating?.rate}
              reviewCount={p.rating?.count}
              onClick={setSelectedId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products found matching your filters</p>
          <button
            onClick={handleClearAllFilters}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Product Modal */}
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