import React from 'react';
import { ArrowLeft, ChevronDown, Heart, AlertTriangle } from 'lucide-react';
import PlaceCard from '../components/PlaceCard';
import FilterChip from '../components/FilterChip';
import { CATEGORIES, SORT_OPTIONS } from '../config';

export default function ListScreen({
  isLoading,
  places,
  onSelectPlace,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  error,
  wishlistIds,
  onWishlistToggle,
  onShowWishlist,
  onBack,
  onLoadMore,
  hasMore
}) {
  return (
    <div className="bg-slate-100 p-4 h-full flex flex-col">
      {/* Top bar */}
      <div className="flex justify-between items-center pt-6 pb-4">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-900" aria-label="Back">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Debut</h1>
        </div>
        <div className="flex-grow mx-4 overflow-hidden">
          <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex flex-nowrap justify-center">
              {["All", ...CATEGORIES].map(cat => (
                <FilterChip key={cat} category={cat} isActive={activeFilter === cat} onSelect={onFilterChange} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white py-2.5 pl-5 pr-10 rounded-full text-sm font-semibold text-slate-700 shadow-md border border-slate-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
              aria-label="Sort by"
            >
              {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          <button onClick={onShowWishlist} className="text-slate-400 hover:text-rose-500 transition-colors p-1" aria-label="Show Wishlist">
            <Heart size={28} />
          </button>
        </div>
      </div>
      <p className="text-center text-lg text-slate-500 mb-6">Be the first to know.</p>
      <div className="flex-grow overflow-y-auto -mx-4 px-4 pt-2">
        {isLoading ? (
          <p className="text-center text-slate-500 mt-16">Loading new places...</p>
        ) : error ? (
          <div className="text-center text-red-500 mt-16 p-4 bg-red-100/50 rounded-lg">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold">Could not load places.</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : places.length > 0 ? (
          <>
            {places.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={onSelectPlace}
                isWishlisted={wishlistIds.has(place.id)}
                onWishlistToggle={onWishlistToggle}
              />
            ))}
            {hasMore && (
              <div className="text-center mt-4">
                <button
                  onClick={onLoadMore}
                  className="px-6 py-2 text-slate-700 border border-slate-300 rounded-full hover:bg-slate-200 transition"
                  aria-label="Load more places"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-slate-500 mt-16">
            <p className="font-semibold">No new places found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}