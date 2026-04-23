// app/search/SearchResults.tsx (or move into the same file if preferred)
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchAllProducts } from "@/services/api";
import ProductCard from "@/componenets/ProductCard";
import { useRouter } from "next/navigation";

const CATEGORY_TITLES = {
  dresses: { title: "Silhouettes of Eve", subtitle: "The Gown Gallery" },
  tops: { title: "The Atelier Edit", subtitle: "Precision Suiting" },
  bags: { title: "Celestial Objects", subtitle: "The Accessories Vault" },
  shoes: { title: "Sole & Spirit", subtitle: "Luxury Footwear" },
};

export default function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const category = params.get("category") || "";
  const [allProducts, setAllProducts] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products once
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await fetchAllProducts();
        setAllProducts(products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query OR category
  const filteredResults = useMemo(() => {
    if (allProducts.length === 0) return [];

    // Category-based filtering (from nav links)
    if (category.trim()) {
      const lowerCat = category.toLowerCase().trim();
      return allProducts.filter(
        (product) => product.category?.toLowerCase() === lowerCat
      );
    }

    // Text search filtering
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      return allProducts.filter((product) => {
        const categoryMatch = product.category?.toLowerCase() === lowerQuery;
        const nameMatch = product.name.toLowerCase().includes(lowerQuery);
        const descriptionMatch = product.description
          ?.toLowerCase()
          .includes(lowerQuery);
        return categoryMatch || nameMatch || descriptionMatch;
      });
    }

    return [];
  }, [query, category, allProducts]);

  // Determine display context
  const isCategory = !!category.trim();
  const categoryInfo = CATEGORY_TITLES[category.toLowerCase()] || null;
  const displayTitle = isCategory
    ? categoryInfo?.title || category.charAt(0).toUpperCase() + category.slice(1)
    : `"${query}"`;
  const displaySubtitle = isCategory
    ? categoryInfo?.subtitle || "Curated Collection"
    : "Discovery Results";

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-6"></div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Curating your selection...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-accent mb-6 font-serif text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#800000] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No query and no category
  if (!query.trim() && !category.trim()) {
    return (
      <div className="text-center py-24">
        <h2 className="text-4xl font-serif mb-4">Discover Our World</h2>
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">
          Search by name, or explore our curated categories above
        </p>
      </div>
    );
  }

  // No results state
  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-4xl font-serif mb-4">No Pieces Found</h2>
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold mb-8">
          {isCategory ? `The "${category}" collection is currently empty` : `No results for "${query}"`}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 border border-foreground/10 text-[10px] uppercase tracking-[0.4em] font-bold hover:border-foreground/40 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/collections")}
            className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#800000] transition-colors"
          >
            Browse Collections
          </button>
        </div>
      </div>
    );
  }

  // Results display
  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent">{displaySubtitle}</span>
            <div className="h-px w-8 bg-accent/30"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none">
            {displayTitle}
          </h1>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">
          {filteredResults.length} {filteredResults.length === 1 ? "Piece" : "Pieces"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20">
        {filteredResults.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onClick={(id) => router.push(`/products/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}
