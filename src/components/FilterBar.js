
import React from 'react';

const categories = ['All', 'Cafe', 'Bakery', 'Restaurant', 'Bar', 'Store', 'Mall'];

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="flex overflow-x-auto gap-2 p-2 bg-white border-b">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={`px-3 py-1 rounded-full text-sm border ${activeFilter === cat ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
