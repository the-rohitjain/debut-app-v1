// File: src/components/FilterChip.js
import React from 'react';

export default function FilterChip({ category, isActive, onSelect }) {
  return (
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
}