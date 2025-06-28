// File: src/screens/DetailScreen.js
import React from 'react';
import { ArrowLeft, Heart, Clock, MapPin, Compass, ExternalLink, Star } from 'lucide-react';
import { getOpenStatus, formatTime } from '../utils';

export default function DetailScreen({ place, onBack, isWishlisted, onWishlistToggle }) {
  const status = getOpenStatus(place.openingTime, place.closingTime);
  const formattedTimings =
    place.openingTime && place.closingTime
      ? `${formatTime(place.openingTime)} – ${formatTime(place.closingTime)}`
      : 'Timings N/A';
console.log("Reviews:", place.reviews);
  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Back button */}
      <div className="absolute top-6 left-4 z-20">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition"
        >
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
      </div>
      {/* Wishlist button */}
      <div className="absolute top-6 right-4 z-20 flex space-x-2">
        <button
          onClick={() => onWishlistToggle(place.id, isWishlisted)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg transition-colors ${
            isWishlisted ? 'text-rose-500' : 'text-slate-700'
          }`}
        >
          <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {/* Images (lazy loaded) */}
        <div className="w-full h-80 overflow-x-auto">
          <div className="flex h-full">
            {place.images && place.images.length > 0 ? (
              place.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  width={480}
                  height={320}
                  alt={`${place.name} view ${index + 1}`}
                  className="w-full h-full object-cover flex-shrink-0 rounded-xl"
                  style={{ minWidth: 320, minHeight: 160 }}
                />
              ))
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-xl">
                <p className="text-slate-500">No images available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-100 p-6 rounded-t-2xl -mt-5 relative z-10">
          {/* Category & Name */}
          <p className="text-lg font-semibold text-slate-500">{place.category}</p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mt-1">{place.name}</h1>

          {/* Timing & Status */}
          <div className="flex items-center mt-6 border-t border-slate-200 pt-5 text-base text-slate-700">
            <Clock size={20} className="text-slate-500 flex-shrink-0" />
            <div className="ml-4">
              <span className={`font-bold ${status.color}`}>{status.text}</span>
              <span className="ml-2.5">{formattedTimings}</span>
            </div>
          </div>
          {/* Address */}
          <div className="flex items-start mt-4 pt-4 border-t border-slate-200">
            <MapPin size={20} className="text-slate-500 mt-1 flex-shrink-0" />
            <p className="text-base text-slate-700 ml-4">{place.address}</p>
          </div>
          {/* About */}
          <div className="mt-8 border-t border-slate-200 pt-5">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">About</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">{place.about}</p>
          </div>
          {/* Reviews */}
          <div className="mt-8 border-t border-slate-200 pt-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Reviews ({place.reviews ? place.reviews.length : 0})
              </h2>
              <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                <Star size={14} className="text-amber-500" />
                <p className="text-sm font-bold ml-1.5">{place.rating}</p>
              </div>
            </div>
            <div className="space-y-4 mt-4">
              {place.reviews && place.reviews.length > 0 ? (
                place.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center">
                      <span className="font-bold text-slate-700">{review.name}</span>
                      <div className="flex ml-auto" aria-label={`Rating: ${review.rating} out of 5`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-amber-400' : 'text-slate-300'}
                            fill="currentColor"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 mt-2">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
        <div className="flex space-x-3">
          <a
            href={`https://maps.google.com/?q=${place.coords.lat},${place.coords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center py-3 rounded-2xl transition-colors"
            aria-label="Get directions"
          >
            <Compass size={20} />
            <span className="text-lg font-bold ml-3">Directions</span>
          </a>
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center py-3 rounded-2xl transition-colors"
              aria-label="Visit website"
            >
              <ExternalLink size={20} />
              <span className="text-lg font-bold ml-3">Reserve</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}