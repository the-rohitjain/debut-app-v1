// File: src/AppComponents.js

import React from 'react';
import { MapPin, Star, Heart, Coffee, UtensilsCrossed, Beer, ShoppingCart, Bread } from 'lucide-react';
import { getOpenStatus, formatTime } from './utils'; // Use correct path as needed

// CATEGORY ICONS (gym removed, bakery added)
export const categoryIcons = {
  Cafe: <Coffee size={36} className="text-amber-600" />,
  Bakery: <Bread size={36} className="text-orange-400" />,
  Restaurant: <UtensilsCrossed size={36} className="text-red-600" />,
  Bar: <Beer size={36} className="text-yellow-500" />,
  Store: <ShoppingCart size={36} className="text-blue-600" />,
  Mall: <ShoppingCart size={36} className="text-indigo-600" />
};

// CATEGORY CARD (generic for landing screen grid)
export const CategoryCard = ({ category, icon, onSelect }) => (
  <button
    onClick={() => onSelect(category)}
    className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center w-full aspect-square"
  >
    {icon}
    <p className="mt-3 text-base font-bold text-slate-800 tracking-tight">{category}</p>
  </button>
);

// FILTER CHIP (used for category selection)
export const FilterChip = ({ category, isActive, onSelect }) => (
  <button
    onClick={() => onSelect(category)}
    className={`px-4 py-2 rounded-full mr-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${
      isActive
        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
    }`}
  >
    {category}
  </button>
);

// PLACE CARD (card for each place, uses open status, time, etc)
export const PlaceCard = ({ place, onSelect, isWishlisted, onWishlistToggle }) => {
  const status = getOpenStatus(place.openingTime, place.closingTime);
  return (
    <div className="w-full text-left flex items-start bg-white p-4 rounded-2xl mb-4 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100">
      <img
        src={place.images?.[0] || 'https://placehold.co/400x400/e2e8f0/64748b?text=Image'}
        alt={place.name}
        className="w-28 h-28 rounded-xl object-cover"
      />
      <div className="flex-1 ml-5">
        <button onClick={() => onSelect(place)} className="w-full text-left">
          <p className="text-xl font-bold text-slate-800 tracking-tight">{place.name}</p>
        </button>
        <p className="text-sm text-slate-500 mt-1.5">{place.category}</p>
        <div className="flex items-center mt-2 text-sm text-slate-600">
          <span className={`font-bold ${status.color}`}>{status.text}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{formatTime(place.openingTime)} - {formatTime(place.closingTime)}</span>
        </div>
        <div className="flex items-center mt-1">
          <MapPin size={14} className="text-slate-400" />
          <p className="ml-1.5 text-sm text-slate-600">
            {place.distance ? `${place.distance.toFixed(1)} km away` : ""}
          </p>
        </div>
      </div>
      <button
        onClick={() => onWishlistToggle(place.id, isWishlisted)}
        className={`p-2 rounded-full transition-colors ${isWishlisted ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}
      >
        <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
};