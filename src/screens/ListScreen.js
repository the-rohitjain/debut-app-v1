import React from 'react';
import PlaceCard from '../components/PlaceCard';
import FilterBar from '../components/FilterBar';
import SortDropdown from '../components/SortDropdown';
import SkeletonCard from '../components/SkeletonCard';

export default function ListScreen({
  isInitialLoading,
  isPaginating,
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
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <button onClick={onBack} className="text-blue-600">&larr; Back</button>
        <h2 className="text-xl font-semibold">Nearby Places</h2>
        <button onClick={onShowWishlist} className="text-blue-600">Wishlist</button>
      </div>

      <FilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />

      <div className="overflow-y-auto px-4 py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
        {isInitialLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : places.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={() => onSelectPlace(place)}
                isWishlisted={wishlistIds.has(place.id)}
                onWishlistToggle={onWishlistToggle}
              />
            ))
        }

        {!isInitialLoading && places.length === 0 && (
          <div className="col-span-full py-10 flex flex-col items-center text-gray-500">
            <span className="text-4xl mb-2">📍</span>
            <p className="text-lg font-medium">No places found nearby</p>
            <p className="text-sm mt-1">Try changing filters or location</p>
          </div>
        )}

        {error && (
          <div className="col-span-full text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>

      {hasMore && !isInitialLoading && (
        <div className="text-center p-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
            onClick={onLoadMore}
            disabled={isPaginating}
          >
            {isPaginating ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
