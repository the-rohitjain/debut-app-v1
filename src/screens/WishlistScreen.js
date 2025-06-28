import React from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import PlaceCard from '../components/PlaceCard';
import { getDistance } from '../utils';

export default function WishlistScreen({
  isLoading,
  places,
  onSelectPlace,
  onBack,
  wishlistIds,
  onWishlistToggle,
  userLocation
}) {
  const wishlistPlaces = places
    .filter(place => wishlistIds.has(place.id))
    .map(place => ({
      ...place,
      distance: getDistance(
        userLocation.lat,
        userLocation.lng,
        place.coords.lat,
        place.coords.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="bg-slate-100 p-4 h-full flex flex-col">
      <div className="flex items-center space-x-2 pt-6 pb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-900" aria-label="Back">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Wishlist</h1>
      </div>
      <p className="text-center text-lg text-slate-500 mb-4">Places you've saved</p>
      <div className="flex-grow overflow-y-auto -mx-4 px-4">
        {isLoading ? (
          <p className="text-center text-slate-500 mt-16">Loading your wishlist...</p>
        ) : wishlistPlaces.length > 0 ? (
          wishlistPlaces.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onSelect={onSelectPlace}
              isWishlisted={true}
              onWishlistToggle={onWishlistToggle}
            />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-16">
            <AlertTriangle className="w-10 h-10 mx-auto mb-4" />
            <p className="font-semibold">No places saved yet</p>
            <p className="text-sm">Tap the heart icon to add favorites.</p>
          </div>
        )}
      </div>
    </div>
  );
}