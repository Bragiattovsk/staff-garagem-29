import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se já está rodando em modo PWA standalone
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isInStandaloneMode);

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capturar o evento do Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  // Não exibir se já for PWA standalone ou se o usuário dispensou na sessão
  if (isStandalone || dismissed) {
    return null;
  }

  // Não exibir se não há prompt no Android e não é iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Discreet floating or top banner */}
      <aside
        aria-label="Instalação do Aplicativo"
        className="bg-[#121215] border border-zinc-800/80 border-l-4 border-l-red-600 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-2 rounded-xl bg-red-600 text-white flex-shrink-0 shadow-[0_0_10px_rgba(220,38,38,0.4)]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-100 truncate">
              Instalar App na Bancada • Garagem 29
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              {isIOS ? 'Adicione ao iPhone para acesso rápido sem barra do Safari' : 'Instale como PWA direto na tela inicial'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-oswald uppercase tracking-wider font-bold transition-all shadow-[0_0_12px_rgba(220,38,38,0.3)] active:scale-95 cursor-pointer flex items-center gap-1.5 border border-red-500"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Instalar</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dispensar aviso de instalação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Modal com Passo a Passo Visual para iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121215] border-2 border-dashed border-red-600 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500 font-oswald uppercase tracking-wider font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>Instalar no Safari (iPhone)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Para usar o app em tela cheia com acesso instantâneo na bancada do bar ou cozinha:
            </p>

            <div className="space-y-3 bg-[#09090b] p-3.5 rounded-2xl border border-zinc-800 text-xs font-sans">
              <div className="flex items-start gap-2.5 text-zinc-200">
                <div className="w-6 h-6 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 flex items-center justify-center font-mono font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  Toque no botão <strong className="text-red-400 inline-flex items-center gap-1">Compartilhar <Share2 className="w-3.5 h-3.5" /></strong> na barra inferior do Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-zinc-200">
                <div className="w-6 h-6 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 flex items-center justify-center font-mono font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  Role para baixo e selecione <strong className="text-red-400 inline-flex items-center gap-1">Adicionar à Tela de Início <PlusSquare className="w-3.5 h-3.5" /></strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-zinc-200">
                <div className="w-6 h-6 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 flex items-center justify-center font-mono font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  Toque em <strong className="text-red-400">Adicionar</strong> no canto superior direito. Pronto!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-oswald uppercase tracking-wider font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-colors cursor-pointer border border-red-500"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
