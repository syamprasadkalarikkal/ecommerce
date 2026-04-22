"use client";
import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function ProductFilters({
  products,
  currentCategory,
  priceRange,
  selectedSize,
  selectedColor,
  onCategoryChange,
  onPriceRangeChange,
  onSizeChange,
  onColorChange,
  onClearAllFilters,
}) {
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);

  // Extract unique categories, sizes, and colors from products
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes || []).filter(Boolean))).sort();
  const allColors = Array.from(new Set(products.flatMap((p) => p.colors || []).filter(Boolean)));

  const priceRanges = [
    { label: "All Prices", min: 0, max: 2000 },
    { label: "Under $200", min: 0, max: 200 },
    { label: "$200 - $500", min: 200, max: 500 },
    { label: "$500 - $1000", min: 500, max: 1000 },
    { label: "High Couture ($1000+)", min: 1000, max: 5000 },
  ];

  return (
    <div className="mb-12 border-b border-foreground/5 pb-8">
      {/* Primary Category Nav */}
      <div className="overflow-x-auto mb-10">
        <div className="flex items-center space-x-12 whitespace-nowrap min-w-max pb-4">
          <button
            onClick={() => onCategoryChange(null)}
            className={`text-[10px] font-bold uppercase tracking-[0.4em] transition-all pb-3 border-b-2 ${currentCategory === null
                ? "text-[#800000] border-[#800000]"
                : "text-foreground/30 border-transparent hover:text-foreground hover:border-foreground/20"
              }`}
          >
            All Pieces
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`text-[10px] font-bold uppercase tracking-[0.4em] transition-all pb-3 border-b-2 ${currentCategory === category
                  ? "text-[#800000] border-[#800000]"
                  : "text-foreground/30 border-transparent hover:text-foreground hover:border-foreground/20"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters Bar */}
      <div className="flex flex-wrap items-center gap-6">

        {/* Price Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
            className="flex items-center gap-4 py-2.5 px-6 border border-foreground/5 hover:border-foreground/20 transition-all text-[9px] font-bold uppercase tracking-[0.2em] bg-stone-50/50"
          >
            Price Range {priceRange.min !== 0 || priceRange.max !== 2000 ? `($${priceRange.min}+)` : ""}
            <ChevronDown size={12} className={`transition-transform ${priceDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {priceDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white shadow-2xl border border-foreground/5 py-3 z-50">
              {priceRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onPriceRangeChange({ min: range.min, max: range.max });
                    setPriceDropdownOpen(false);
                  }}
                  className={`w-full text-left px-6 py-3 text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-stone-50 transition-colors ${priceRange.min === range.min && priceRange.max === range.max ? "text-[#800000]" : "text-foreground/60"
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
            className="flex items-center gap-4 py-2.5 px-6 border border-foreground/5 hover:border-foreground/20 transition-all text-[9px] font-bold uppercase tracking-[0.2em] bg-stone-50/50"
          >
            Size {selectedSize ? `: ${selectedSize}` : ""}
            <ChevronDown size={12} className={`transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {sizeDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white shadow-2xl border border-foreground/5 py-2 z-50 max-h-60 overflow-y-auto">
              <button
                onClick={() => { onSizeChange(null); setSizeDropdownOpen(false); }}
                className="w-full text-left px-6 py-3 text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-stone-50 border-b border-foreground/5"
              >
                All Sizes
              </button>
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => { onSizeChange(size); setSizeDropdownOpen(false); }}
                  className={`w-full text-left px-6 py-3 text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-stone-50 ${selectedSize === size ? "text-[#800000]" : "text-foreground/60"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Dropdown */}
        <div className="relative">
          <button
            onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
            className="flex items-center gap-4 py-2.5 px-6 border border-foreground/5 hover:border-foreground/20 transition-all text-[9px] font-bold uppercase tracking-[0.2em] bg-stone-50/50"
          >
            Color {selectedColor ? `: ${selectedColor}` : ""}
            <ChevronDown size={12} className={`transition-transform ${colorDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {colorDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white shadow-2xl border border-foreground/5 py-4 z-50 grid grid-cols-2 gap-2 px-4">
              <button
                onClick={() => { onColorChange(null); setColorDropdownOpen(false); }}
                className="col-span-2 text-left px-2 py-2 text-[8px] font-bold uppercase border-b border-foreground/5 mb-2"
              >
                Clear Color
              </button>
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() => { onColorChange(color); setColorDropdownOpen(false); }}
                  className={`flex items-center gap-3 px-2 py-2 hover:bg-stone-50 transition-colors ${selectedColor === color ? "bg-stone-50" : ""
                    }`}
                >
                  <div className={`w-3 h-3 rounded-full border border-foreground/10 ${color === "Black" ? "bg-black" :
                      color === "White" ? "bg-white" :
                        color === "Maroon" ? "bg-[#800000]" :
                          "bg-[#E8E2D9]"
                    }`}></div>
                  <span className="text-[8px] font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis">{color}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear All Shortcut */}
        {(currentCategory || selectedSize || selectedColor || priceRange.min !== 0 || priceRange.max !== 2000) && (
          <button
            onClick={onClearAllFilters}
            className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity ml-4 underline"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(selectedSize || selectedColor) && (
        <div className="flex flex-wrap gap-2 mt-8">
          {selectedSize && (
            <Tag label={`Size: ${selectedSize}`} onRemove={() => onSizeChange(null)} />
          )}
          {selectedColor && (
            <Tag label={`Color: ${selectedColor}`} onRemove={() => onColorChange(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function Tag({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-2 px-4 py-1.5 bg-foreground/5 hover:bg-[#800000] hover:text-white transition-all text-[8px] font-bold uppercase tracking-widest group"
    >
      {label} <X size={10} className="opacity-40 group-hover:opacity-100" />
    </button>
  );
}
