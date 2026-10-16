import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  ChefHat,
  AlertCircle,
  CheckCircle2,
  Edit,
  Copy,
  Check,
  ZoomIn,
  Camera,
} from 'lucide-react';
import type { FichaTecnica, Ingrediente } from '../types/ficha';

interface FichaDetailModalProps {
  ficha: FichaTecnica | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (ficha: FichaTecnica) => void;
  onOpenPhoto?: (photoUrl: string, name: string, subtitle?: string) => void;
}

export const FichaDetailModal: React.FC<FichaDetailModalProps> = ({
  ficha,
  isOpen,
  onClose,
  onEdit,
  onOpenPhoto,
}) => {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !ficha) return null;

  const multipliers = [1, 2, 3, 4];

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const resetSteps = () => {
    setCompletedSteps({});
  };

  const getMultiplierQuantity = (originalQty: number): string => {
    const total = originalQty * multiplier;
    if (Number.isInteger(total)) {
      return total.toString();
    }
    return total.toFixed(1).replace('.0', '');
  };

  const getPluralUnit = (unit: string, qty: number): string => {
    if (qty > 1 && unit === 'dash') return 'dashes';
    if (qty > 1 && unit === 'colher de bar') return 'colheres de bar';
    return unit;
  };

  const getIngredientCategoryBadge = (categoria: Ingrediente['categoriaIngrediente']) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      destilado: { label: 'Destilado', bg: 'bg-indigo-500/15', text: 'text-indigo-400 border-indigo-500/30' },
      alcoolico: { label: 'Alcoólico / Bitter', bg: 'bg-rose-500/15', text: 'text-rose-400 border-rose-500/30' },
      citrico: { label: 'Cítrico', bg: 'bg-yellow-500/15', text: 'text-yellow-400 border-yellow-500/30' },
      xarope: { label: 'Xarope / Doçura', bg: 'bg-amber-500/15', text: 'text-amber-400 border-amber-500/30' },
      proteina: { label: 'Proteína', bg: 'bg-red-500/15', text: 'text-red-400 border-red-500/30' },
      hortifruti: { label: 'Hortifruti', bg: 'bg-emerald-500/15', text: 'text-emerald-400 border-emerald-500/30' },
      laticinio: { label: 'Laticínio', bg: 'bg-blue-500/15', text: 'text-blue-400 border-blue-500/30' },
      tempero: { label: 'Tempero', bg: 'bg-teal-500/15', text: 'text-teal-400 border-teal-500/30' },
      outro: { label: 'Geral', bg: 'bg-zinc-800', text: 'text-zinc-400 border-zinc-700' },
    };

    const config = map[categoria] || map.outro;
    return (
      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleCopyRecipe = () => {
    const textLines = [
      `=== FICHA TÉCNICA: ${ficha.nome.toUpperCase()} (${multiplier}x) ===`,
      `Setor: ${ficha.setor} | Categoria: ${ficha.categoria}`,
      `Método: ${ficha.metodo} | Copo: ${ficha.recipiente} | Gelo: ${ficha.gelo}`,
      `Guarnição: ${ficha.guarnicao}`,
      '',
      '--- INGREDIENTES ---',
      ...ficha.ingredientes.map(
        (i) =>
          `• ${getMultiplierQuantity(i.quantidade)} ${getPluralUnit(i.unidade, i.quantidade * multiplier)} - ${i.nome}`
      ),
      '',
      '--- PREPARO ---',
      ...ficha.preparo.map((p, idx) => `${idx + 1}. ${p}`),
      '',
      `Montagem: ${ficha.montagem}`,
      ficha.dicaOperacional ? `Dica do Chef/Bar: ${ficha.dicaOperacional}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl max-h-[94vh] sm:max-h-[90vh] bg-[#121215] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header with sticky close button */}
        <div className="sticky top-0 z-10 bg-[#09090b]/95 border-b border-red-900/40 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span
              className={`px-2.5 py-1 rounded text-xs font-oswald uppercase tracking-wider font-bold ${
                ficha.setor === 'Bar'
                  ? 'bg-red-950/80 text-red-400 border border-red-600/50'
                  : ficha.setor === 'Cozinha'
                  ? 'bg-orange-950/80 text-orange-400 border border-orange-600/50'
                  : 'bg-purple-950/80 text-purple-400 border border-purple-600/50'
              }`}
            >
              {ficha.setor}
            </span>
            <h2 className="font-oswald text-lg sm:text-2xl font-bold uppercase tracking-wider text-white truncate">
              {ficha.nome}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyRecipe}
              title="Copiar texto da receita"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
              aria-label="Copiar receita"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onEdit(ficha)}
              title="Editar esta ficha"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
              aria-label="Editar ficha"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 space-y-4 pb-safe">
          {/* TAGS DE COPO, GELO E MÉTODO (Pílulas escuras com borda metálica) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
              ⚙️ Método: {ficha.metodo}
            </span>
            <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
              🥃 Copo: {ficha.recipiente}
            </span>
            {ficha.gelo && ficha.gelo !== 'N/A' && (
              <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
                🧊 Gelo: {ficha.gelo}
              </span>
            )}
            {ficha.guarnicao && ficha.guarnicao !== 'N/A' && (
              <span className="bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs uppercase tracking-wider px-2.5 py-1 rounded">
                🍒 Guarnição: {ficha.guarnicao}
              </span>
            )}
          </div>

          {/* FOTO DO DRINK/PRATO (Moldura escura com selo PADRÃO DE ENTREGA) */}
          {ficha.foto_url && (
            <div
              onClick={() => onOpenPhoto && onOpenPhoto(ficha.foto_url!, ficha.nome, `${ficha.recipiente} • ${ficha.guarnicao}`)}
              className="relative w-full h-48 sm:h-60 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 group cursor-zoom-in shadow-xl"
            >
              <img
                src={ficha.foto_url}
                alt={ficha.nome}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="font-oswald uppercase tracking-widest text-red-400 flex items-center gap-1.5 bg-zinc-950/90 px-2.5 py-1 rounded border border-red-500/40 shadow">
                  <Camera className="w-3.5 h-3.5 text-red-500" />
                  PADRÃO DE ENTREGA
                </span>
                <span className="font-oswald uppercase tracking-wider text-zinc-200 flex items-center gap-1 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-700">
                  <ZoomIn className="w-3.5 h-3.5 text-red-400" />
                  Toque p/ Zoom
                </span>
              </div>
            </div>
          )}

          {/* MULTIPLICADOR DE RECEITA (Estilo Painel Industrial) */}
          <div className="bg-[#09090b] border border-zinc-800/90 rounded-2xl p-3 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="font-oswald uppercase tracking-wider text-xs font-bold text-red-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Multiplicador de Receita • Painel Industrial
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {multiplier === 1 ? '1 dose / pedido' : `${multiplier} doses / pedidos`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {multipliers.map((m) => (
                <button
                  key={m}
                  id={`multiplier-btn-${m}x`}
                  type="button"
                  onClick={() => setMultiplier(m)}
                  className={`py-3 rounded-xl font-mono text-base sm:text-lg font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    multiplier === m
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)] scale-[1.02]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/80'
                  }`}
                >
                  <span className="font-extrabold">{m}x</span>
                  <span className="text-[9px] font-sans font-medium opacity-80">
                    {m === 1 ? 'Individual' : `${m} pedidos`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION: FOCO TOTAL NAS MEDIDAS - INGREDIENTES */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-oswald text-sm sm:text-base font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-500" />
                Ingredientes & Medidas em ML / Gramas
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                {ficha.ingredientes.length} itens listados
              </span>
            </div>

            <div className="space-y-2">
              {ficha.ingredientes.map((ing, idx) => {
                const calculatedQty = getMultiplierQuantity(ing.quantidade);
                const displayUnit = getPluralUnit(ing.unidade, ing.quantidade * multiplier);

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    {/* BADGE GRANDE DE MEDIDA EM ML/GRAMAS COM CONTRASTE MÁXIMO */}
                    <div className="flex-shrink-0 bg-red-950/70 border border-red-500/60 text-red-400 font-mono text-lg font-extrabold px-3 py-1.5 rounded-md min-w-[85px] text-center shadow-inner flex flex-col items-center justify-center">
                      <span className="leading-none text-xl sm:text-2xl">
                        {calculatedQty}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-400/90 mt-0.5">
                        {displayUnit}
                      </span>
                    </div>

                    {/* Nome do Ingrediente em text-zinc-100 font-semibold text-base */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-zinc-100 font-semibold text-base leading-snug">
                          {ing.nome}
                        </span>
                        {getIngredientCategoryBadge(ing.categoriaIngrediente)}
                      </div>
                      {ing.observacao && (
                        <p className="text-xs text-zinc-400 italic">
                          {ing.observacao}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: PASSO A PASSO DO PREPARO (Fonte Inter para texto corrido) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-oswald text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-red-500" />
                Passo a Passo de Preparo (Staff)
              </h3>
              <button
                type="button"
                onClick={resetSteps}
                className="text-[11px] font-mono text-zinc-400 hover:text-red-400 cursor-pointer"
              >
                Resetar passos
              </button>
            </div>

            <div className="space-y-2 font-sans">
              {ficha.preparo.map((passo, idx) => {
                const isCompleted = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-[#09090b]/40 border-zinc-800/50 opacity-60'
                        : 'bg-[#09090b] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded font-mono font-bold text-xs flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : 'bg-zinc-900 text-red-400 border border-zinc-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'
                      }`}
                    >
                      {passo}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: MONTAGEM E SERVIÇO */}
          <div className="bg-[#09090b] border border-red-900/40 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider text-red-500">
              <Sparkles className="w-3.5 h-3.5" />
              Montagem, Finalização & Serviço no Salão
            </div>
            <p className="font-sans text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
              {ficha.montagem}
            </p>
          </div>

          {/* Operational tip & allergens */}
          {ficha.dicaOperacional && (
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-oswald uppercase tracking-wider font-bold text-red-400 block mb-0.5">Dica Operacional:</span>
                <span className="font-sans text-zinc-300 leading-relaxed">{ficha.dicaOperacional}</span>
              </div>
            </div>
          )}
        </div>

        {/* Big Bottom Action Buttons for One-Hand Mobile Operation */}
        <div className="sticky bottom-0 bg-[#09090b] border-t border-red-900/40 p-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-oswald uppercase tracking-wider text-sm sm:text-base font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Concluir / Voltar à Bancada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
