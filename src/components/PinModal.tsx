import React, { useState, useEffect } from 'react';
import { Lock, X, Delete, ShieldAlert, Cloud, Loader2 } from 'lucide-react';
import { configService } from '../services/configService';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Acesso Administrativo',
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isCloudChecked, setIsCloudChecked] = useState<boolean>(false);

  // Busca o PIN atual na tabela app_config do Supabase assim que o modal abre
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setIsValidating(false);

      // Consulta SELECT value FROM app_config WHERE key = 'admin_pin'
      configService.getAdminPin()
        .then(() => {
          setIsCloudChecked(true);
        })
        .catch(() => {
          setIsCloudChecked(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4 && !isValidating) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (isValidating) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    if (isValidating) return;
    setPin('');
    setError(false);
  };

  const verifyPin = async (candidatePin: string) => {
    setIsValidating(true);
    try {
      const currentPin = await configService.getAdminPin();
      if (candidatePin === currentPin) {
        // Registrar sessão desbloqueada temporariamente
        sessionStorage.setItem('staff_admin_unlocked', 'true');
        setPin('');
        setError(false);
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
        }, 600);
      }
    } catch {
      // Fallback de emergência para '2929'
      if (candidatePin === '2929') {
        sessionStorage.setItem('staff_admin_unlocked', 'true');
        setPin('');
        setError(false);
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
        }, 600);
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xs bg-[#121215] border-2 border-dashed border-red-600 rounded-3xl p-5 shadow-[0_0_35px_rgba(220,38,38,0.25)] flex flex-col items-center">
        {/* Backstage Pass Lanyard Slot Cutout */}
        <div className="w-12 h-2 rounded-full bg-[#09090b] border border-red-900/60 mb-2" />

        {/* Header with Close */}
        <div className="w-full flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-red-500">
            <Lock className="w-4 h-4" />
            <span className="font-oswald text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title: GARAGEM 29 ASYLUM in Oswald */}
        <h2 className="font-oswald text-2xl font-bold tracking-widest text-white uppercase text-center mt-1">
          GARAGEM 29 ASYLUM
        </h2>

        {/* Selo: ACESSO TOTAL AUTORIZADO • STAFF ONLY */}
        <div className="mt-1 mb-3 text-center">
          <span className="inline-block font-mono text-[9px] tracking-widest font-extrabold text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-600/50 uppercase shadow-inner">
            ACESSO TOTAL AUTORIZADO • STAFF ONLY
          </span>
        </div>

        {/* Instructions & Cloud Sync Indicator */}
        <p className="text-xs text-zinc-400 text-center mb-1">
          Digite o PIN de 4 dígitos para gerenciar fichas
        </p>
        <div className="flex items-center justify-center gap-2 mb-4 text-[10px] font-mono text-zinc-400">
          {/*<span>Padrão: <strong className="text-red-400">2929</strong></span>*/}
          <span>•</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <Cloud className={`w-3 h-3 ${isCloudChecked ? 'text-emerald-400' : 'text-amber-400'}`} />
            {isCloudChecked ? 'Supabase app_config' : 'Checando nuvem...'}
          </span>
        </div>

        {isValidating && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mb-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Validando no Supabase...</span>
          </div>
        )}

        {/* PIN Indicators (4 Dots) */}
        <div className={`flex items-center gap-3.5 mb-5 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${error
                    ? 'bg-red-700 ring-4 ring-red-700/40'
                    : isFilled
                      ? 'bg-red-600 ring-4 ring-red-600/30 shadow-[0_0_10px_rgba(220,38,38,0.7)] scale-110'
                      : 'bg-zinc-900 border border-zinc-700'
                  }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-bold text-red-400 mb-3 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            PIN incorreto! Tente novamente.
          </p>
        )}

        {/* Big Ergonomic Keypad for Wet Kitchen/Bar Hands */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-red-600 active:text-white text-zinc-100 font-mono text-xl font-bold transition-all border border-zinc-800 shadow-sm flex items-center justify-center cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 rounded-2xl bg-[#09090b] hover:bg-zinc-900 text-zinc-400 font-oswald uppercase tracking-wider text-xs font-bold border border-zinc-800/80 transition-colors cursor-pointer select-none"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-red-600 active:text-white text-zinc-100 font-mono text-xl font-bold transition-all border border-zinc-800 shadow-sm flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3.5 rounded-2xl bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-800/80 transition-colors flex items-center justify-center cursor-pointer select-none"
            aria-label="Apagar dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
