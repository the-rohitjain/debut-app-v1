
import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white shadow rounded-md p-4 h-32 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
