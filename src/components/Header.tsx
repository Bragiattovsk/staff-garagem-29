import React from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  RotateCcw,
  SunMedium,
  Sun,
  Database,
  CloudOff,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'staff' | 'admin';
  onTabChange: (tab: 'staff' | 'admin') => void;
  totalFichas: number;
  onResetData: () => void;
  isWakeLocked: boolean;
  onToggleWakeLock: () => void;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  totalFichas,
  onResetData,
  isWakeLocked,
  onToggleWakeLock,
  isOffline,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-red-900/40 px-3.5 sm:px-4 py-2.5 shadow-lg shadow-black/60">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        {/* Top Tier (Mobile) / Left Side (Desktop): Brand & Status */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Logo Oficial Garagem 29 */}
            <div className="flex items-center justify-center flex-shrink-0">
              <img
                src="/android-chrome-192x192.png"
                alt="Logo Garagem 29"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-transform hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-oswald text-xl sm:text-2xl font-bold tracking-widest text-white uppercase leading-none whitespace-nowrap">
                  GARAGEM 29
                </h1>
                {/* Database Status Badge (Desktop) */}
                <span
                  className={`hidden sm:flex text-[9px] font-mono font-bold px-1.5 py-0.5 rounded items-center gap-1 border ${isOffline
                      ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    }`}
                  title={isOffline ? 'Operando com LocalStorage local' : 'Conectado à nuvem Supabase'}
                >
                  {isOffline ? <CloudOff className="w-2.5 h-2.5" /> : <Database className="w-2.5 h-2.5 text-emerald-400" />}
                  <span>{isOffline ? 'Offline' : 'Supabase Conectado'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] tracking-[0.16em] text-red-500 uppercase font-semibold leading-none whitespace-nowrap">
                  STAFF • BAR & COZINHA
                </span>
                <span className="text-zinc-600 text-[10px]">•</span>
                <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                  {totalFichas} {totalFichas === 1 ? 'ficha' : 'fichas'}
                </span>
              </div>
            </div>
          </div>

          {/* Database Status Badge (Mobile Top Right) */}
          <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0">
            <span
              className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg flex items-center gap-1 border ${isOffline
                  ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                }`}
              title={isOffline ? 'Operando com LocalStorage local' : 'Conectado à nuvem Supabase'}
            >
              {isOffline ? <CloudOff className="w-2.5 h-2.5" /> : <Database className="w-2.5 h-2.5 text-emerald-400" />}
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </span>
          </div>
        </div>

        {/* Bottom Tier (Mobile) / Right Side (Desktop): Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t border-zinc-800/40 sm:border-t-0">
          {/* Navigation Switch Tabs */}
          <div className="flex bg-[#121215] p-1 rounded-xl border border-zinc-800/80 flex-1 sm:flex-initial">
            <button
              id="tab-staff-button"
              type="button"
              onClick={() => onTabChange('staff')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-oswald uppercase tracking-wider transition-all cursor-pointer ${currentTab === 'staff'
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consulta</span>
            </button>
            <button
              id="tab-admin-button"
              type="button"
              onClick={() => onTabChange('admin')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-oswald uppercase tracking-wider transition-all cursor-pointer ${currentTab === 'admin'
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Admin</span>
              <Lock className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </button>
          </div>

          {/* Screen Wake Lock Button */}
          <button
            type="button"
            id="wake-lock-toggle-btn"
            onClick={onToggleWakeLock}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 flex-shrink-0 ${isWakeLocked
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-zinc-700'
              }`}
            title={isWakeLocked ? 'Tela permanecerá sempre acesa durante o serviço (Wake Lock ativo)' : 'Clique para manter a tela sempre acesa durante o serviço'}
            aria-label="Alternar manter tela acesa"
          >
            {isWakeLocked ? (
              <Sun className="w-4 h-4 fill-current stroke-[2.5] animate-pulse" />
            ) : (
              <SunMedium className="w-4 h-4" />
            )}
            <span className="text-[11px] font-oswald uppercase tracking-wider hidden md:inline">
              {isWakeLocked ? 'Tela Acesa' : 'Manter Acesa'}
            </span>
          </button>

          {/* Reload / Sync data button */}
          <button
            type="button"
            title="Recarregar e sincronizar com Supabase"
            onClick={onResetData}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Recarregar fichas do Supabase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
