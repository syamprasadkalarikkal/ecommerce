// app/search/SearchResults.tsx (or move into the same file if preferred)
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductType } from '@/types';
import { fetchAllProducts } from '@/services/api';
import ProductCard from '@/componenets/ProductCard';
import ProductModal from '@/componenets/ProductModel';

export default function SearchResults() {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products once
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await fetchAllProducts();
        setAllProducts(products);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredResults = useMemo(() => {
    if (!query.trim() || allProducts.length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    
    return allProducts.filter((product: ProductType) => {
      // Check if category matches exactly
      const categoryMatch = product.category?.toLowerCase() === lowerQuery;
      
      // Check if product name contains the query
      const nameMatch = product.name.toLowerCase().includes(lowerQuery);
      
      // Check if product description contains the query (if available)
      const descriptionMatch = product.description?.toLowerCase().includes(lowerQuery);
      
      return categoryMatch || nameMatch || descriptionMatch;
    });
  }, [query, allProducts]);

  const handleReviewSubmit = (id: number, newRating: number, newCount: number) => {
    setAllProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, rating: { rate: newRating, count: newCount } }
          : p
      )
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No query state
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Start typing to search for products</p>
        <p className="text-gray-400 text-sm">Try searching by product name or category</p>
      </div>
    );
  }

  // No results state
  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">
          No products found for "{query}"
        </p>
        <p className="text-gray-400 text-sm mb-4">
          Try adjusting your search terms or browse our categories
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
          <a 
            href="/products" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  // Results display
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          Found {filteredResults.length} product{filteredResults.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResults.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            name={product.name}
            rating={product.rating?.rate}
            reviewCount={product.rating?.count}
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
    </>
  );
}