
import React from 'react';

export default function SortDropdown({ sortBy, onSortChange }) {
  return (
    <div className="px-4 py-2 bg-gray-50 border-b flex justify-end">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="distance">Distance</option>
        <option value="rating">Rating</option>
        <option value="added">Recently Added</option>
      </select>
    </div>
  );
}
