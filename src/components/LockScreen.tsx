import React, { useState, useEffect, useCallback } from 'react';
import { Delete, ShieldAlert, Cloud, Loader2, CheckSquare, Square, ShieldCheck } from 'lucide-react';
import { configService } from '../services/configService';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [isCloudChecked, setIsCloudChecked] = useState<boolean>(false);

  useEffect(() => {
    setIsCloudChecked(configService.isCloudConnected());
  }, []);

  const verifyPin = useCallback(async (candidatePin: string) => {
    setIsValidating(true);
    setError(false);

    try {
      // 1. Verifica se é o PIN de Gerente / Admin
      const isAdmin = await configService.verifyAdminPin(candidatePin);

      // 2. Se for Admin, libera imediatamente; se não, valida se é o PIN de Staff
      const isAuthorized = isAdmin || (await configService.verifyStaffPin(candidatePin));

      if (isAuthorized) {
        if (rememberDevice) {
          localStorage.setItem('staff_device_authorized', 'true');
        }
        sessionStorage.setItem('staff_session_authorized', 'true');

        // Se o gerente digitou seu PIN de gerência, libera o modo Admin sem redundância!
        if (isAdmin) {
          sessionStorage.setItem('staff_admin_unlocked', 'true');
        }

        setPin('');
        setError(false);
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
        }, 600);
      }
    } catch {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 600);
    } finally {
      setIsValidating(false);
    }
  }, [rememberDevice, onUnlock]);

  const handleKeyPress = useCallback((digit: string) => {
    if (isValidating) return;

    setPin((prev) => {
      if (prev.length < 4) {
        const next = prev + digit;
        setError(false);
        if (next.length === 4) {
          // Dispara validação com o PIN completo
          setTimeout(() => verifyPin(next), 50);
        }
        return next;
      }
      return prev;
    });
  }, [isValidating, verifyPin]);

  const handleDelete = useCallback(() => {
    if (isValidating) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, [isValidating]);

  const handleClear = useCallback(() => {
    if (isValidating) return;
    setPin('');
    setError(false);
  }, [isValidating]);

  // Suporte à digitação física via teclado (Desktop/Laptop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, handleClear]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b] overflow-y-auto selection:bg-red-600">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/25 via-[#09090b] to-[#09090b] pointer-events-none" />

      <div className="relative w-full max-w-sm bg-[#121215] border-2 border-dashed border-red-600/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] flex flex-col items-center my-auto animate-in fade-in duration-300">
        {/* Backstage Pass Lanyard Slot Cutout */}
        <div className="w-16 h-2 rounded-full bg-[#09090b] border border-red-900/60 mb-3" />

        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="relative mb-2">
            <img
              src="/android-chrome-192x192.png"
              alt="Garagem 29 Asylum"
              className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            />
          </div>
          <h1 className="font-oswald text-2xl sm:text-3xl font-bold tracking-widest text-white uppercase leading-none">
            GARAGEM 29 ASYLUM
          </h1>
          <div className="mt-1.5">
            <span className="inline-block font-mono text-[9px] tracking-widest font-extrabold text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-600/60 uppercase shadow-inner">
              TERMINAL OPERACIONAL • ACESSO RESTRITO
            </span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-zinc-400 text-center mb-2 leading-relaxed">
          Digite o PIN de 4 dígitos do Staff ou Gerente para desbloquear as fichas técnicas e receitas da casa.
        </p>

        {/* Cloud Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <Cloud className={`w-3.5 h-3.5 ${isCloudChecked ? 'text-emerald-400' : 'text-amber-400'}`} />
            {isCloudChecked ? 'Supabase RPC Seguro' : 'Modo Operacional'}
          </span>
        </div>

        {/* Loading Indicator */}
        {isValidating && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mb-2 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Validando no servidor...</span>
          </div>
        )}

        {/* PIN Indicators (4 Dots) */}
        <div className={`flex items-center gap-4 mb-4 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-red-700 ring-4 ring-red-700/40'
                    : isFilled
                      ? 'bg-red-600 ring-4 ring-red-600/30 shadow-[0_0_12px_rgba(220,38,38,0.8)] scale-110'
                      : 'bg-zinc-900 border border-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs font-bold text-red-400 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            PIN incorreto! Tente novamente.
          </p>
        )}

        {/* Ergonomic Touch Keypad for Kitchen/Bar Staff */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
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

        {/* "Lembrar este dispositivo" checkbox */}
        <button
          type="button"
          onClick={() => setRememberDevice(!rememberDevice)}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-left transition-colors cursor-pointer group"
        >
          {rememberDevice ? (
            <CheckSquare className="w-4 h-4 text-red-500 flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 flex-shrink-0" />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-200">
              Lembrar este aparelho (Bar / Cozinha)
            </span>
            <span className="text-[10px] text-zinc-400">
              Evita pedir o PIN a todo momento durante o turno
            </span>
          </div>
        </button>

        {/* Security badge note */}
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Proteção ativa contra cópia e acesso não autorizado</span>
        </div>
      </div>
    </div>
  );
};
