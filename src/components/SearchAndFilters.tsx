import React from 'react';
import { Search, X, Wine, Utensils, FlaskConical, Layers } from 'lucide-react';
import type { FiltroSetor } from '../types/ficha';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFilter: FiltroSetor;
  onFilterChange: (filter: FiltroSetor) => void;
  resultCount: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  resultCount,
}) => {
  const filterOptions: { label: string; value: FiltroSetor; icon: React.ReactNode; color: string }[] = [
    { label: 'Todos', value: 'Todos', icon: <Layers className="w-3.5 h-3.5" />, color: 'hover:border-slate-500' },
    { label: 'Bar', value: 'Bar', icon: <Wine className="w-3.5 h-3.5 text-sky-400" />, color: 'hover:border-sky-500' },
    { label: 'Cozinha', value: 'Cozinha', icon: <Utensils className="w-3.5 h-3.5 text-orange-400" />, color: 'hover:border-orange-500' },
    { label: 'Sub-receitas', value: 'Sub-receitas', icon: <FlaskConical className="w-3.5 h-3.5 text-purple-400" />, color: 'hover:border-purple-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
          <Search className="w-5 h-5 text-red-500" />
        </div>
        <input
          id="search-input-field"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar drink, prato ou ingrediente (ex: campari, gin, batata, limão)..."
          className="w-full pl-11 pr-11 py-3.5 bg-[#121215] border border-zinc-800 rounded-2xl text-zinc-100 placeholder-zinc-500 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition-all shadow-inner"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-100 cursor-pointer"
            aria-label="Limpar busca"
          >
            <div className="bg-zinc-800 p-1 rounded-full hover:bg-zinc-700">
              <X className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

      {/* Quick Filter Pills in Oswald Uppercase */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterOptions.map((opt) => {
          const isActive = selectedFilter === opt.value;
          return (
            <button
              key={opt.value}
              id={`filter-pill-${opt.value.toLowerCase()}`}
              type="button"
              onClick={() => onFilterChange(opt.value)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-oswald uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] font-bold scale-[1.02]'
                  : `bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200`
                }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {isActive && (
                <span className="ml-1 bg-black/30 text-white font-mono font-bold px-1.5 py-0.2 rounded text-[10px]">
                  {resultCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Helpful hint for staff during rush hour */}
      {searchTerm && (
        <div className="text-xs text-red-400 font-medium flex items-center justify-between px-1">
          <span>Filtrando por: &quot;{searchTerm}&quot;</span>
          <span className="text-zinc-400 font-mono font-normal">{resultCount} resultado(s)</span>
        </div>
      )}
    </div>
  );
};
