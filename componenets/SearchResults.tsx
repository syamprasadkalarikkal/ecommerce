// app/search/SearchResults.tsx (or move into the same file if preferred)
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductType } from '@/types';
import { fetchAllProducts } from '@/services/api';
import ProductCard from '@/componenets/ProductCard';
import ProductModal from '@/componenets/ProductModel';

export default function SearchResults() {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [results, setResults] = useState<ProductType[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const allProducts = await fetchAllProducts();

        const lowerQuery = query.toLowerCase();
        const filtered = allProducts.filter((item: ProductType) => {
          const categoryMatch = item.category?.toLowerCase() === lowerQuery;
          const nameMatch = item.name.toLowerCase().includes(lowerQuery);
          return categoryMatch || nameMatch;
        });

        setResults(filtered);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleReviewSubmit = (id: number, newRating: number, newCount: number) => {
    setResults(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, rating: { rate: newRating, count: newCount } }
          : p
      )
    );
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (results.length === 0) return <p className="text-center text-gray-500">No products found.</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((p) => (
          <ProductCard
            key={p.id}
            {...p}
            name={p.name}
            rating={p.rating?.rate}
            reviewCount={p.rating?.count}
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
