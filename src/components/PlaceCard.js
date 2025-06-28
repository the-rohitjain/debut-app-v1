// File: src/components/PlaceCard.js
import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { getTodayTiming, getOpenStatus, formatTime } from '../utils';

export default function PlaceCard({ place, onSelect, isWishlisted, onWishlistToggle }) {
  const { openingTime, closingTime } = getTodayTiming(place.openingHours);
  const status = getOpenStatus(openingTime, closingTime);

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
          <span>
            {openingTime && closingTime
              ? `${formatTime(openingTime)} - ${formatTime(closingTime)}`
              : 'Timings N/A'}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <MapPin size={14} className="text-slate-400" />
          <p className="ml-1.5 text-sm text-slate-600">
            {place.distance !== undefined ? `${place.distance.toFixed(1)} km away` : '...'}
          </p>
        </div>
      </div>
      <button
        onClick={() => onWishlistToggle(place.id, isWishlisted)}
        className={`p-2 rounded-full transition-colors ${
          isWishlisted ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
        }`}
      >
        <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}