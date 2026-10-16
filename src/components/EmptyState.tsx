import React from 'react';
import { SearchX, Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onCreateNew?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  onClearSearch,
  onCreateNew,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-3xl bg-[#121215] border border-zinc-800/80 border-l-4 border-l-red-600 my-4 space-y-4 shadow-xl">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-red-500 shadow-md">
        <SearchX className="w-7 h-7" />
      </div>

      <div className="max-w-xs mx-auto space-y-1">
        <h3 className="font-oswald text-lg font-bold uppercase tracking-wider text-white">
          Nenhuma ficha encontrada
        </h3>
        <p className="text-xs text-zinc-400">
          {searchTerm
            ? `Nenhum drink, prato ou ingrediente corresponde ao termo "${searchTerm}".`
            : 'Nenhuma ficha técnica cadastrada nesta categoria da Garagem 29.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {searchTerm ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-oswald uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Limpar Busca</span>
          </button>
        ) : onCreateNew ? (
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-oswald uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-colors cursor-pointer border border-red-500"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Ficha</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
