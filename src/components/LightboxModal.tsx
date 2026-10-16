import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

interface LightboxModalProps {
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  imageUrl,
  title,
  subtitle,
  isOpen,
  onClose,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Top Bar: Title and Close button */}
      <div className="flex items-center justify-between gap-3 text-zinc-100 z-10">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-red-500 font-oswald font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Padrão de Apresentação • Garagem 29</span>
          </div>
          <h3 className="font-oswald text-base sm:text-xl font-bold uppercase tracking-wider text-white">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleZoom}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-red-400 hover:border-red-600 transition-colors cursor-pointer"
            title={isZoomed ? 'Diminuir Zoom' : 'Aumentar Zoom'}
            aria-label={isZoomed ? 'Diminuir Zoom' : 'Aumentar Zoom'}
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-950/60 transition-colors cursor-pointer"
            title="Fechar Visualização"
            aria-label="Fechar Visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden my-auto cursor-zoom-in relative"
        onClick={toggleZoom}
      >
        <img
          src={imageUrl}
          alt={title}
          className={`max-w-full max-h-[75vh] object-contain rounded-2xl transition-transform duration-300 ease-out shadow-2xl ${
            isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out' : 'scale-100'
          }`}
        />
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-slate-400 z-10 py-2">
        <span>Toque na imagem para alternar zoom e inspecionar detalhes do corte e guarnição</span>
      </div>
    </div>
  );
};
