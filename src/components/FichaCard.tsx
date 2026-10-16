import React from 'react';
import { Wine, Utensils, FlaskConical, Clock, ChevronRight, Layers, Eye } from 'lucide-react';
import type { FichaTecnica } from '../types/ficha';

interface FichaCardProps {
  ficha: FichaTecnica;
  onClick: () => void;
  onOpenPhoto?: (e: React.MouseEvent, photoUrl: string, name: string) => void;
}

export const FichaCard: React.FC<FichaCardProps> = ({ ficha, onClick, onOpenPhoto }) => {
  const getSectorBadge = (setor: FichaTecnica['setor']) => {
    switch (setor) {
      case 'Bar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Wine className="w-3.5 h-3.5" />
            BAR
          </span>
        );
      case 'Cozinha':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Utensils className="w-3.5 h-3.5" />
            COZINHA
          </span>
        );
      case 'Prep':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <FlaskConical className="w-3.5 h-3.5" />
            PREP
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#121215] hover:bg-[#18181c] active:scale-[0.985] transition-all duration-200 border border-zinc-800/80 border-l-4 border-l-red-600 rounded-2xl p-4 shadow-xl hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_0_15px_rgba(220,38,38,0.15)] hover:border-zinc-700/80 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Foto em Destaque (se houver) com botão de Zoom Rápido e Selo Padrão de Entrega */}
        {ficha.foto_url && (
          <div className="relative w-full h-36 mb-3 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
            <img
              src={ficha.foto_url}
              alt={ficha.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Quick zoom button */}
            {onOpenPhoto && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPhoto(e, ficha.foto_url!, ficha.nome);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950/85 hover:bg-red-600 hover:text-white text-zinc-300 backdrop-blur-sm border border-zinc-700 transition-colors cursor-pointer"
                title="Ampliar foto em tela cheia"
                aria-label="Ampliar foto"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="absolute bottom-2 left-2 text-[9px] font-oswald uppercase tracking-widest text-red-400 bg-zinc-950/90 px-2 py-0.5 rounded border border-red-500/30">
              PADRÃO DE ENTREGA
            </div>
          </div>
        )}

        {/* Top row: Sector, Category, and Time */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {getSectorBadge(ficha.setor)}
            <span className="px-2 py-0.5 rounded text-[11px] font-oswald uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800">
              {ficha.categoria}
            </span>
          </div>

          {ficha.tempoPreparoSegundos && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono font-medium">
              <Clock className="w-3 h-3 text-red-500" />
              <span>
                {ficha.tempoPreparoSegundos >= 60
                  ? `${Math.round(ficha.tempoPreparoSegundos / 60)} min`
                  : `${ficha.tempoPreparoSegundos}s`}
              </span>
            </div>
          )}
        </div>

        {/* Title in Oswald uppercase rock poster style */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-oswald text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-100 group-hover:text-red-500 transition-colors leading-tight">
            {ficha.nome}
          </h3>
          <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-white group-hover:bg-red-600 transition-all flex-shrink-0 border border-zinc-800">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Operational specifications: Tags de Copo, Gelo e Método (Pílulas escuras com borda metálica) */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
          <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
            ⚙️ {ficha.metodo}
          </span>
          <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
            🥃 {ficha.recipiente}
          </span>
          {ficha.gelo && ficha.gelo !== 'N/A' && (
            <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
              🧊 {ficha.gelo}
            </span>
          )}
        </div>
      </div>

      {/* Ingredients preview with high-contrast measure chips */}
      <div className="bg-[#09090b] rounded-xl p-2.5 border border-zinc-800/80 space-y-1.5 mt-auto">
        <div className="flex items-center justify-between text-[10px] font-oswald uppercase tracking-widest text-zinc-400 mb-1">
          <span className="flex items-center gap-1 text-red-500 font-bold">
            <Layers className="w-3 h-3" />
            Ingredientes Principais
          </span>
          <span className="font-mono text-zinc-500">{ficha.ingredientes.length} itens</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {ficha.ingredientes.slice(0, 3).map((ing, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-zinc-200 truncate font-medium">{ing.nome}</span>
              <span className="font-mono font-bold text-red-400 bg-red-950/70 px-2 py-0.5 rounded text-[11px] border border-red-500/40 whitespace-nowrap">
                {ing.quantidade} {ing.unidade}
              </span>
            </div>
          ))}
          {ficha.ingredientes.length > 3 && (
            <p className="text-[10px] text-zinc-500 font-mono text-right pt-0.5">
              +{ficha.ingredientes.length - 3} outro(s)...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
