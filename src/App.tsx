import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchAndFilters } from './components/SearchAndFilters';
import { FichaCard } from './components/FichaCard';
import { FichaDetailModal } from './components/FichaDetailModal';
import { FichaFormModal } from './components/FichaFormModal';
import { AdminView } from './components/AdminView';
import { EmptyState } from './components/EmptyState';
import { PinModal } from './components/PinModal';
import { LightboxModal } from './components/LightboxModal';
import { InstallPWA } from './components/InstallPWA';
import { fichaService } from './services/fichaService';
import { useWakeLock } from './hooks/useWakeLock';
import type { FichaTecnica, FiltroSetor } from './types/ficha';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [fichas, setFichas] = useState<FichaTecnica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<'staff' | 'admin'>('staff');

  // Screen Wake Lock API
  const { isLocked: isWakeLocked, toggleLock: toggleWakeLock } = useWakeLock();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FiltroSetor>('Todos');

  // Modals state
  const [selectedFicha, setSelectedFicha] = useState<FichaTecnica | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [fichaToEdit, setFichaToEdit] = useState<FichaTecnica | null>(null);

  // PIN Protection Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pendingPinAction, setPendingPinAction] = useState<(() => void) | null>(null);
  const [pinModalTitle, setPinModalTitle] = useState<string>('Acesso Administrativo');

  // Lightbox Zoom Modal State
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: null,
    title: '',
  });

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load all recipes
  const loadFichas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fichaService.getAll();
      setFichas(data);
    } catch (err) {
      console.error('Erro ao carregar fichas:', err);
      showToast('Erro ao carregar dados do armazenamento.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  // PIN security verification wrapper
  const executeWithPinProtection = (action: () => void, title = 'Acesso Administrativo') => {
    const isUnlockedInSession = sessionStorage.getItem('staff_admin_unlocked') === 'true';
    if (isUnlockedInSession) {
      action();
    } else {
      setPinModalTitle(title);
      setPendingPinAction(() => action);
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    if (pendingPinAction) {
      pendingPinAction();
      setPendingPinAction(null);
    }
  };

  // Filter recipes based on search query (name, category, method, AND ingredients) & sector
  const filteredFichas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return fichas.filter((ficha) => {
      // 1. Sector match
      let matchesSector = true;
      if (selectedFilter === 'Sub-receitas') {
        matchesSector = ficha.setor === 'Prep' || ficha.categoria.toLowerCase().includes('sub-receita');
      } else if (selectedFilter !== 'Todos') {
        matchesSector = ficha.setor === selectedFilter;
      }

      if (!matchesSector) return false;

      // 2. Query search
      if (!query) return true;

      // Match name
      if (ficha.nome.toLowerCase().includes(query)) return true;

      // Match category or method
      if (ficha.categoria.toLowerCase().includes(query)) return true;
      if (ficha.metodo.toLowerCase().includes(query)) return true;

      // Match glass/vessel
      if (ficha.recipiente.toLowerCase().includes(query)) return true;

      // CRITICAL: Search within all ingredients!
      const matchesIngredient = ficha.ingredientes.some(
        (ing) =>
          ing.nome.toLowerCase().includes(query) ||
          (ing.observacao && ing.observacao.toLowerCase().includes(query)) ||
          ing.categoriaIngrediente.toLowerCase().includes(query)
      );

      return matchesIngredient;
    });
  }, [fichas, searchTerm, selectedFilter]);

  // Handlers
  const handleOpenDetail = (ficha: FichaTecnica) => {
    setSelectedFicha(ficha);
    setIsDetailOpen(true);
  };

  const handleOpenCreateWithPin = () => {
    executeWithPinProtection(() => {
      setFichaToEdit(null);
      setIsFormOpen(true);
    }, 'Criar Nova Ficha');
  };

  const handleOpenEditWithPin = (ficha: FichaTecnica) => {
    executeWithPinProtection(() => {
      setFichaToEdit(ficha);
      setIsFormOpen(true);
    }, `Editar: ${ficha.nome}`);
  };

  const handleTabChange = (tab: 'staff' | 'admin') => {
    if (tab === 'admin') {
      executeWithPinProtection(() => {
        setCurrentTab('admin');
      }, 'Acesso ao Painel Admin');
    } else {
      setCurrentTab('staff');
    }
  };

  const handleDuplicateWithPin = (ficha: FichaTecnica) => {
    executeWithPinProtection(() => {
      const duplicated: FichaTecnica = {
        ...ficha,
        id: '',
        nome: `${ficha.nome} (Cópia / Variação)`,
      };
      setFichaToEdit(duplicated);
      setIsFormOpen(true);
    }, 'Duplicar Ficha');
  };

  const handleSaveFicha = async (ficha: FichaTecnica) => {
    try {
      const saved = await fichaService.save(ficha);
      await loadFichas();
      if (selectedFicha && selectedFicha.id === saved.id) {
        setSelectedFicha(saved);
      }
      showToast(`Ficha "${saved.nome}" salva com sucesso!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar ficha técnica.', 'error');
      throw err;
    }
  };

  const handleDeleteFichaWithPin = async (id: string) => {
    executeWithPinProtection(async () => {
      try {
        await fichaService.delete(id);
        await loadFichas();
        if (selectedFicha && selectedFicha.id === id) {
          setIsDetailOpen(false);
          setSelectedFicha(null);
        }
        showToast('Ficha técnica excluída.', 'info');
      } catch (err: any) {
        showToast(err.message || 'Erro ao excluir ficha.', 'error');
      }
    }, 'Excluir Ficha Técnica');
  };

  const handleResetSeedData = async () => {
    try {
      await fichaService.resetToDefaults();
      await loadFichas();
      showToast('Cache local limpo e dados sincronizados com o Supabase!', 'success');
    } catch (err: any) {
      showToast('Erro ao recarregar dados do Supabase.', 'error');
    }
  };

  // Lightbox handlers
  const handleOpenPhoto = (photoUrl: string, name: string, subtitle?: string) => {
    setLightboxData({
      isOpen: true,
      imageUrl: photoUrl,
      title: name,
      subtitle,
    });
  };

  const handleClosePhoto = () => {
    setLightboxData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/25 via-[#09090b] to-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-oswald uppercase tracking-wider font-bold border transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'error'
              ? 'bg-red-950/95 text-red-200 border-red-800'
              : 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        totalFichas={fichas.length}
        onResetData={handleResetSeedData}
        isWakeLocked={isWakeLocked}
        onToggleWakeLock={toggleWakeLock}
        isOffline={fichaService.isOffline()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-4 py-4 space-y-4">
        {/* PWA Install Banner */}
        <InstallPWA />

        {currentTab === 'staff' ? (
          /* ============================================================== */
          /* STAFF OPERATIONAL VIEW: Search, Quick Filters, Cards List     */
          /* ============================================================== */
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Search and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              resultCount={filteredFichas.length}
            />

            {/* Quick stats / Shift notification */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
              <span className="font-sans text-zinc-400">
                Toque em uma ficha para abrir multiplicador e foto padrão
              </span>
              <span className="font-bold text-red-400">
                {filteredFichas.length} de {fichas.length} fichas
              </span>
            </div>

            {/* Recipes Cards Grid */}
            {loading && fichas.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-oswald uppercase tracking-wider font-semibold">Carregando fichas da Garagem 29...</p>
              </div>
            ) : filteredFichas.length === 0 ? (
              <EmptyState
                searchTerm={searchTerm}
                onClearSearch={() => {
                  setSearchTerm('');
                  setSelectedFilter('Todos');
                }}
                onCreateNew={handleOpenCreateWithPin}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredFichas.map((ficha) => (
                  <FichaCard
                    key={ficha.id}
                    ficha={ficha}
                    onClick={() => handleOpenDetail(ficha)}
                    onOpenPhoto={(_e, url, name) => handleOpenPhoto(url, name, `${ficha.recipiente} • ${ficha.guarnicao}`)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* ADMIN VIEW: Management, CRUD, Backups, Schema Details          */
          /* ============================================================== */
          <div className="animate-in fade-in duration-150">
            <AdminView
              fichas={fichas}
              onOpenCreate={handleOpenCreateWithPin}
              onOpenEdit={handleOpenEditWithPin}
              onDuplicate={handleDuplicateWithPin}
              onDelete={handleDeleteFichaWithPin}
              onResetSeed={handleResetSeedData}
              onRefreshData={loadFichas}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) protected by PIN */}
      <button
        type="button"
        onClick={handleOpenCreateWithPin}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/40 active:scale-95 transition-all cursor-pointer border border-red-400"
        title="Cadastrar Nova Ficha Técnica (Requer PIN)"
        aria-label="Cadastrar Nova Ficha Técnica"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Ficha Detail Modal (Multiplier, Giant Measures, Step Checklist, Photo) */}
      <FichaDetailModal
        ficha={selectedFicha}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(f) => {
          setIsDetailOpen(false);
          handleOpenEditWithPin(f);
        }}
        onOpenPhoto={handleOpenPhoto}
      />

      {/* Ficha Form Modal (Create / Edit) */}
      <FichaFormModal
        fichaToEdit={fichaToEdit}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFichaToEdit(null);
        }}
        onSave={handleSaveFicha}
        onDelete={handleDeleteFichaWithPin}
      />

      {/* PIN Security Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingPinAction(null);
        }}
        onSuccess={handlePinSuccess}
        title={pinModalTitle}
      />

      {/* Fullscreen Lightbox Image Zoom */}
      <LightboxModal
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.imageUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        onClose={handleClosePhoto}
      />
    </div>
  );
}

export default App;
