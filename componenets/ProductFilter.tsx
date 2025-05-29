'use client';
import React, { useState } from 'react';
import { ProductType } from '@/types';

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFiltersProps {
  products: ProductType[];
  currentCategory: string | null;
  priceRange: PriceRange;
  onCategoryChange: (category: string | null) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  onClearAllFilters: () => void;
}

export default function ProductFilters({
  products,
  currentCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  onClearAllFilters
}: ProductFiltersProps) {
  const [customMinPrice, setCustomMinPrice] = useState<string>('');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate categories and their counts
  const categories = Array.from(
    new Set(products.map(p => p.category).filter((c): c is string => !!c))
  );

  // Calculate price statistics
  const prices = products.map(p => p.price).filter(price => typeof price === 'number');
  const priceStats = {
    min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
    max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000,
    average: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
  };

  // Predefined price ranges
  const priceRanges = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: 'Over $200', min: 200, max: priceStats.max }
  ];

  const handlePriceRangeSelect = (min: number, max: number) => {
    onPriceRangeChange({ min, max });
    setCustomMinPrice('');
    setCustomMaxPrice('');
  };

  const handleCustomPriceApply = () => {
    const min = parseFloat(customMinPrice) || priceStats.min;
    const max = parseFloat(customMaxPrice) || priceStats.max;
    
    if (min <= max) {
      onPriceRangeChange({ min, max });
    }
  };

  // Calculate active filters count
  const activeFiltersCount = (currentCategory ? 1 : 0) + 
    (priceRange.min !== priceStats.min || priceRange.max !== priceStats.max ? 1 : 0);

  return (
    <>
      {/* Filter Toggle Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <span>🔍</span>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAllFilters}
            className="text-sm text-gray-600 hover:text-black underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    checked={currentCategory === null}
                    onChange={() => onCategoryChange(null)}
                    className="text-black"
                  />
                  <span>All Categories ({products.length})</span>
                </label>
                {categories.map(category => {
                  const count = products.filter(p => p.category === category).length;
                  return (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={currentCategory === category}
                        onChange={() => onCategoryChange(category)}
                        className="text-black"
                      />
                      <span className="capitalize">{category} ({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Price Range (${priceRange.min} - ${priceRange.max})
              </h3>
              
              {/* Predefined Price Ranges */}
              <div className="space-y-2 mb-4">
                {priceRanges.map((range, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange.min === range.min && priceRange.max === range.max}
                      onChange={() => handlePriceRangeSelect(range.min, range.max)}
                      className="text-black"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>

              {/* Custom Price Range */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Custom Range</h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder={`Min (${priceStats.min})`}
                    value={customMinPrice}
                    onChange={(e) => setCustomMinPrice(e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min={priceStats.min}
                    max={priceStats.max}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder={`Max (${priceStats.max})`}
                    value={customMaxPrice}
                    onChange={(e) => setCustomMaxPrice(e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min={priceStats.min}
                    max={priceStats.max}
                  />
                  <button
                    onClick={handleCustomPriceApply}
                    className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Price Statistics */}
              <div className="mt-4 text-sm text-gray-600">
                <p>Price range: ${priceStats.min} - ${priceStats.max}</p>
                <p>Average price: ${priceStats.average}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Buttons (Quick Filter) */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full border transition ${
            currentCategory === null
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          All ({products.length})
        </button>
        {categories.map(category => {
          const count = products.filter(p => p.category === category).length;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full border transition ${
                currentCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <span className="capitalize">{category}</span> ({count})
            </button>
          );
        })}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full">
              <span className="capitalize">{currentCategory}</span>
              <button
                onClick={() => onCategoryChange(null)}
                className="ml-1 hover:bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          )}
          {(priceRange.min !== priceStats.min || priceRange.max !== priceStats.max) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full">
              <span>${priceRange.min} - ${priceRange.max}</span>
              <button
                onClick={() => onPriceRangeChange({ min: priceStats.min, max: priceStats.max })}
                className="ml-1 hover:bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
}