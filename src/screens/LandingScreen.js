import React from 'react';
import { Coffee, UtensilsCrossed, Beer, ShoppingCart, Dumbbell } from 'lucide-react';
import { CATEGORIES } from '../config';

export function CategoryCard({ category, icon, onSelect }) {
  return (
    <button
      onClick={() => onSelect(category)}
      className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center w-full aspect-square"
      aria-label={category}
    >
      {icon}
      <p className="mt-3 text-base font-bold text-slate-800 tracking-tight">{category}</p>
    </button>
  );
}

export default function LandingScreen({ onSelectCategory }) {
  // keep this inside so hot reload works as expected
  const categoryIcons = {
    Cafe: <Coffee size={36} className="text-amber-600" />,
    Restaurant: <UtensilsCrossed size={36} className="text-red-600" />,
    Bar: <Beer size={36} className="text-yellow-500" />,
    Store: <ShoppingCart size={36} className="text-blue-600" />,
    Mall: <ShoppingCart size={36} className="text-indigo-600" />,
    Gym: <Dumbbell size={36} className="text-slate-600" />
  };

  return (
    <div className="bg-slate-100 p-6 h-full flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-6xl font-bold text-slate-900 tracking-tighter">Debut</h1>
        <p className="text-xl text-slate-500 mt-2">Be the first to know.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat}
            category={cat}
            icon={categoryIcons[cat] || <span role="img" aria-label="New">✨</span>}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
}