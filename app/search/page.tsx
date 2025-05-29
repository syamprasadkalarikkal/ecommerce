'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductType } from '@/types';
import { fetchAllProducts } from '@/services/api';
import ProductCard from '@/componenets/ProductCard';
import ProductModal from '@/componenets/ProductModel';

export default function SearchPage() {
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

        // Filter by exact category match OR partial name match (case-insensitive)
        const filtered = allProducts.filter((item: ProductType) => {
          const lowerQuery = query.toLowerCase();
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 text-black">
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
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
      )}

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
