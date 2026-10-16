import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  RotateCcw,
  Wine,
  Utensils,
  FlaskConical,
  CheckCircle,
  CloudUpload,
  Camera,
  KeyRound,
  ShieldCheck,
  Shield,
  Users,
  AlertCircle,
} from 'lucide-react';
import type { FichaTecnica } from '../types/ficha';
import { isSupabaseConfigured, testSupabaseConnection } from '../services/supabaseClient';
import { fichaService } from '../services/fichaService';
import { configService } from '../services/configService';

interface AdminViewProps {
  fichas: FichaTecnica[];
  onOpenCreate: () => void;
  onOpenEdit: (ficha: FichaTecnica) => void;
  onDuplicate: (ficha: FichaTecnica) => void;
  onDelete: (id: string) => Promise<void>;
  onResetSeed: () => void;
  onRefreshData?: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  fichas,
  onOpenCreate,
  onOpenEdit,
  onDuplicate,
  onDelete,
  onResetSeed,
  onRefreshData,
}) => {
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connResult, setConnResult] = useState<string | null>(null);

  // Gestão de PINs no Supabase (Staff vs Gerência)
  const [newStaffPinInput, setNewStaffPinInput] = useState<string>('');
  const [newAdminPinInput, setNewAdminPinInput] = useState<string>('');
  const [isUpdatingPin, setIsUpdatingPin] = useState<boolean>(false);
  const [pinMessage, setPinMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleUpdateStaffPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newStaffPinInput.trim();
    if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      setPinMessage({ text: 'O PIN de Staff deve conter exatamente 4 dígitos numéricos.', isError: true });
      return;
    }

    setIsUpdatingPin(true);
    setPinMessage(null);
    try {
      await configService.updateStaffPin(cleanPin);
      setNewStaffPinInput('');
      setPinMessage({ text: 'PIN da Equipe (Staff) atualizado com sucesso no Supabase!' });
      showToast('PIN de Staff atualizado!');
    } catch (err: any) {
      setPinMessage({ text: err.message || 'Erro ao atualizar PIN de Staff.', isError: true });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleResetStaffPinDefault = async () => {
    setIsUpdatingPin(true);
    setPinMessage(null);
    try {
      await configService.updateStaffPin('2929');
      setNewStaffPinInput('');
      setPinMessage({ text: 'PIN da Equipe (Staff) restaurado para o padrão: 2929' });
      showToast('PIN de Staff restaurado para 2929!');
    } catch (err: any) {
      setPinMessage({ text: err.message || 'Erro ao restaurar PIN de Staff.', isError: true });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleUpdateAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newAdminPinInput.trim();
    if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      setPinMessage({ text: 'O PIN de Gerente deve conter exatamente 4 dígitos numéricos.', isError: true });
      return;
    }

    setIsUpdatingPin(true);
    setPinMessage(null);
    try {
      await configService.updateAdminPin(cleanPin);
      setNewAdminPinInput('');
      setPinMessage({ text: 'PIN de Gerente / Admin atualizado com sucesso no Supabase!' });
      showToast('PIN de Gerente atualizado!');
    } catch (err: any) {
      setPinMessage({ text: err.message || 'Erro ao atualizar PIN de Gerente.', isError: true });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleResetAdminPinDefault = async () => {
    setIsUpdatingPin(true);
    setPinMessage(null);
    try {
      await configService.updateAdminPin('2900');
      setNewAdminPinInput('');
      setPinMessage({ text: 'PIN de Gerente / Admin restaurado para o padrão: 2900' });
      showToast('PIN de Gerente restaurado para 2900!');
    } catch (err: any) {
      setPinMessage({ text: err.message || 'Erro ao restaurar PIN de Gerente.', isError: true });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fichas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fichas_tecnicas_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exportado com sucesso!');
  };

  const handleTestConnection = async () => {
    setConnResult('Testando conexão com Supabase...');
    const result = await testSupabaseConnection();
    setConnResult(result.message);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fichaService.syncLocalToSupabase();
      if (res.error) {
        showToast(`Erro na sincronização: ${res.error}`);
      } else {
        showToast(`${res.count} fichas sincronizadas com Supabase!`);
        if (onRefreshData) await onRefreshData();
      }
    } catch (err: any) {
      showToast(err.message || 'Falha ao sincronizar.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast feedback */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Action Header */}
      <div className="bg-[#121215] border border-zinc-800/80 border-l-4 border-l-red-600 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-red-500 font-oswald font-bold text-xs uppercase tracking-widest block mb-1">
            Gestão & Engenharia de Cardápio • Garagem 29
          </span>
          <h2 className="font-oswald text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
            Painel Administrativo Backstage
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cadastre fichas, faça upload de fotos e sincronize com Supabase
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="admin-new-recipe-btn"
            onClick={onOpenCreate}
            className="flex-1 sm:flex-none px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Ficha Técnica</span>
          </button>
        </div>
      </div>

      {/* Supabase Status & Sync Card */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-200">
              Supabase Backend: {isConfigured ? 'Conectado à Nuvem' : 'Modo Offline / LocalStorage'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
            >
              Testar Conexão
            </button>
            <button
              type="button"
              onClick={() => setShowDbInfo(!showDbInfo)}
              className="text-[11px] font-mono text-red-400 hover:underline cursor-pointer"
            >
              {showDbInfo ? 'Ocultar SQL' : 'Ver Esquema SQL & Storage'}
            </button>
          </div>
        </div>

        {connResult && (
          <p className="text-xs font-mono font-medium text-red-400 bg-black/60 p-2.5 rounded-xl border border-red-900/40">
            {connResult}
          </p>
        )}

        <p className="text-xs text-zinc-400 leading-relaxed">
          Tabela: <code className="text-red-400 font-mono">recipes</code> • Bucket de Fotos:{' '}
          <code className="text-red-400 font-mono">recipe-photos</code>. Caso as credenciais ainda não estejam no arquivo <code className="text-zinc-300">.env</code>, o app opera normalmente com dados salvos no navegador.
        </p>

        {showDbInfo && (
          <div className="pt-1 space-y-2">
            <pre className="bg-black p-3 rounded-xl border border-zinc-800 text-[11px] font-mono text-red-400 overflow-x-auto leading-relaxed">
{`-- 1. Tabela Principal de Fichas Técnicas
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  setor TEXT NOT NULL CHECK (setor IN ('Bar', 'Cozinha', 'Prep')),
  categoria TEXT NOT NULL,
  metodo TEXT NOT NULL,
  recipiente TEXT NOT NULL,
  gelo TEXT NOT NULL,
  guarnicao TEXT NOT NULL,
  foto_url TEXT,
  ingredientes JSONB NOT NULL DEFAULT '[]'::jsonb,
  preparo TEXT[] NOT NULL DEFAULT '{}',
  montagem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Configurações e Funções RPC Seguras (Staff & Gerência)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Bloquear acesso direto à app_config" ON public.app_config;
CREATE POLICY "Bloquear acesso direto à app_config" ON public.app_config FOR ALL TO anon, authenticated USING (false);

INSERT INTO public.app_config (key, value) VALUES ('staff_pin', '2929'), ('admin_pin', '2900') ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.verify_staff_pin(candidate_pin TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s_pin TEXT; a_pin TEXT;
BEGIN
  SELECT value INTO s_pin FROM public.app_config WHERE key = 'staff_pin' LIMIT 1;
  SELECT value INTO a_pin FROM public.app_config WHERE key = 'admin_pin' LIMIT 1;
  IF s_pin IS NULL THEN s_pin := '2929'; END IF;
  IF a_pin IS NULL THEN a_pin := '2900'; END IF;
  RETURN candidate_pin = s_pin OR candidate_pin = a_pin;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_admin_pin(candidate_pin TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stored_pin TEXT;
BEGIN
  SELECT value INTO stored_pin FROM public.app_config WHERE key = 'admin_pin' LIMIT 1;
  IF stored_pin IS NULL THEN stored_pin := '2900'; END IF;
  RETURN candidate_pin = stored_pin;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(TEXT) TO anon, authenticated;

-- 3. Bucket de Storage para Fotos dos Drinks/Pratos
-- Crie o bucket 'recipe-photos' como PUBLIC no painel do Supabase Storage`}
            </pre>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {isConfigured && (
            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-oswald uppercase tracking-wider text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Cache com Supabase'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-oswald uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-red-500" />
            <span>Exportar Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={onResetSeed}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-oswald uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recarregar do Supabase</span>
          </button>
        </div>
      </div>

      {/* PIN Security Configuration Card: Dual Access Levels */}
      <div className="bg-[#121215] border border-zinc-800/80 border-l-4 border-l-red-600 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-red-500" />
            <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-zinc-100">
              Controle de Acesso & PINs Operacionais
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Protegido no Servidor (Supabase RPC)
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          O Garagem 29 possui 2 níveis de acesso independentes: o <strong className="text-zinc-200">PIN de Staff</strong> para a equipe liberar a consulta no tablet, e o <strong className="text-red-400">PIN de Gerente</strong> para criar, editar ou excluir receitas.
        </p>

        {pinMessage && (
          <div
            className={`text-xs font-mono p-2.5 rounded-xl border flex items-center gap-2 animate-in fade-in ${
              pinMessage.isError
                ? 'bg-red-950/40 text-red-400 border-red-900/60'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
            }`}
          >
            {pinMessage.isError ? (
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{pinMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Card 1: PIN de Staff (Equipe / Consulta) */}
          <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-200">
              <Users className="w-4 h-4 text-amber-500" />
              <h4 className="font-oswald text-xs font-bold uppercase tracking-wider">
                1. PIN de Staff (Equipe / Consulta)
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Compartilhado com bartenders, garçons e cozinheiros para destravar o terminal de consulta. (Padrão: <span className="font-mono text-zinc-300">2929</span>)
            </p>
            <form onSubmit={handleUpdateStaffPin} className="space-y-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newStaffPinInput}
                onChange={(e) => setNewStaffPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Novo PIN de Staff (ex: 2929)"
                className="w-full bg-[#121215] border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-600 outline-none text-center tracking-widest"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={isUpdatingPin || newStaffPinInput.length !== 4}
                  className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Salvar PIN Staff
                </button>
                <button
                  type="button"
                  onClick={handleResetStaffPinDefault}
                  disabled={isUpdatingPin}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-oswald uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Restaurar 2929
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: PIN de Gerente / Admin (Edição & Gestão) */}
          <div className="bg-[#09090b] border border-red-950/60 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-200">
              <Shield className="w-4 h-4 text-red-500" />
              <h4 className="font-oswald text-xs font-bold uppercase tracking-wider">
                2. PIN de Gerente / Admin (Gestão)
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Exclusivo de chefs e gerentes para criar, editar ou excluir fichas técnicas. (Padrão: <span className="font-mono text-zinc-300">2900</span>)
            </p>
            <form onSubmit={handleUpdateAdminPin} className="space-y-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newAdminPinInput}
                onChange={(e) => setNewAdminPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Novo PIN de Gerente (ex: 2900)"
                className="w-full bg-[#121215] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-600 outline-none text-center tracking-widest"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={isUpdatingPin || newAdminPinInput.length !== 4}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-oswald text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Salvar PIN Gerente
                </button>
                <button
                  type="button"
                  onClick={handleResetAdminPinDefault}
                  disabled={isUpdatingPin}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-oswald uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Restaurar 2900
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* List of technical sheets in Admin mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-oswald uppercase tracking-wider text-zinc-400 px-1">
          <span>Todas as Fichas Cadastradas ({fichas.length})</span>
          <span>Ações</span>
        </div>

        <div className="space-y-2">
          {fichas.map((ficha) => (
            <div
              key={ficha.id}
              className="bg-[#121215] border border-zinc-800/80 border-l-4 border-l-red-600 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* Photo or Sector Icon */}
                {ficha.foto_url ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0">
                    <img src={ficha.foto_url} alt={ficha.nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      ficha.setor === 'Bar'
                        ? 'bg-red-950/40 text-red-400 border border-red-600/40'
                        : ficha.setor === 'Cozinha'
                        ? 'bg-orange-950/40 text-orange-400 border border-orange-600/40'
                        : 'bg-purple-950/40 text-purple-400 border border-purple-600/40'
                    }`}
                  >
                    {ficha.setor === 'Bar' ? (
                      <Wine className="w-5 h-5" />
                    ) : ficha.setor === 'Cozinha' ? (
                      <Utensils className="w-5 h-5" />
                    ) : (
                      <FlaskConical className="w-5 h-5" />
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-oswald text-base font-bold uppercase tracking-wider text-zinc-100">{ficha.nome}</h3>
                    <span className="text-[10px] font-oswald uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {ficha.categoria}
                    </span>
                    {ficha.foto_url && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono font-bold">
                        <Camera className="w-3 h-3" /> FOTO OK
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>{ficha.metodo}</span>
                    <span>•</span>
                    <span className="font-mono">{ficha.ingredientes.length} ingredientes</span>
                    <span>•</span>
                    <span>{ficha.recipiente}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onDuplicate(ficha)}
                  title="Duplicar para criar variação"
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 border border-zinc-800 text-xs font-oswald uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Duplicar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEdit(ficha)}
                  title="Editar ficha"
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-600 hover:text-white text-zinc-200 border border-zinc-800 hover:border-red-500 text-xs font-oswald uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(ficha.id)}
                  title="Excluir ficha"
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
