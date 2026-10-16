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
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
        {/* Brand / Logo: Garagem 29 Rock Bar Emblem */}
        <div className="flex items-center gap-3">
          {/* Logo Oficial Garagem 29 */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img
              src="/android-chrome-192x192.png"
              alt="Logo Garagem 29"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-transform hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-oswald text-xl sm:text-2xl font-bold tracking-widest text-white uppercase leading-none">
                GARAGEM 29
              </h1>
              {/* Database Status Badge */}
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                  isOffline
                    ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                }`}
                title={isOffline ? 'Operando com LocalStorage local' : 'Conectado à nuvem Supabase'}
              >
                {isOffline ? <CloudOff className="w-2.5 h-2.5" /> : <Database className="w-2.5 h-2.5 text-emerald-400" />}
                <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Supabase Conectado'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] tracking-[0.2em] text-red-500 uppercase font-semibold leading-none">
                STAFF BACKSTAGE • BAR & COZINHA
              </span>
              <span className="text-zinc-600 text-[10px] hidden sm:inline">•</span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                {totalFichas} fichas
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: WakeLock + Switch Tabs + Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Screen Wake Lock Button (Critical for Bar/Kitchen staff hands) */}
          <button
            type="button"
            id="wake-lock-toggle-btn"
            onClick={onToggleWakeLock}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isWakeLocked
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

          {/* Navigation Switch Tabs */}
          <div className="flex bg-[#121215] p-1 rounded-xl border border-zinc-800/80">
            <button
              id="tab-staff-button"
              type="button"
              onClick={() => onTabChange('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-oswald uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'staff'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-oswald uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Admin</span>
              <Lock className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </button>
          </div>

          {/* Reload / Sync data button */}
          <button
            type="button"
            title="Recarregar e sincronizar com Supabase"
            onClick={onResetData}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer"
            aria-label="Recarregar fichas do Supabase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
