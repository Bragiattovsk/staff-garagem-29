import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Wine,
  Utensils,
  FlaskConical,
  Layers,
  ChefHat,
  Sparkles,
  AlertTriangle,
  Camera,
  Loader2,
} from 'lucide-react';
import type {
  FichaTecnica,
  Setor,
  UnidadeMedida,
  CategoriaIngrediente,
  Ingrediente,
} from '../types/ficha';
import { fichaService } from '../services/fichaService';

interface FichaFormModalProps {
  fichaToEdit?: FichaTecnica | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ficha: FichaTecnica) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const FichaFormModal: React.FC<FichaFormModalProps> = ({
  fichaToEdit,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = !!fichaToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [setor, setSetor] = useState<Setor>('Bar');
  const [categoria, setCategoria] = useState('');
  const [metodo, setMetodo] = useState('');
  const [recipiente, setRecipiente] = useState('');
  const [gelo, setGelo] = useState('');
  const [guarnicao, setGuarnicao] = useState('');
  const [montagem, setMontagem] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoInfo, setPhotoInfo] = useState<string | null>(null);

  // Dynamic lists
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nome: '', quantidade: 50, unidade: 'ml', categoriaIngrediente: 'destilado' },
  ]);
  const [preparo, setPreparo] = useState<string[]>(['']);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<'nome' | 'ingredientes' | 'preparo' | 'montagem' | null>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (fichaToEdit) {
      setNome(fichaToEdit.nome || '');
      setSetor(fichaToEdit.setor || 'Bar');
      setCategoria(fichaToEdit.categoria || '');
      setMetodo(fichaToEdit.metodo || '');
      setRecipiente(fichaToEdit.recipiente || '');
      setGelo(fichaToEdit.gelo || '');
      setGuarnicao(fichaToEdit.guarnicao || '');
      setMontagem(fichaToEdit.montagem || '');
      setFotoUrl(fichaToEdit.foto_url || '');
      setIngredientes(
        fichaToEdit.ingredientes.length > 0
          ? [...fichaToEdit.ingredientes]
          : [{ nome: '', quantidade: 50, unidade: 'ml', categoriaIngrediente: 'destilado' }]
      );
      setPreparo(
        fichaToEdit.preparo.length > 0 ? [...fichaToEdit.preparo] : ['']
      );
      setPhotoInfo(fichaToEdit.foto_url ? 'Foto cadastrada' : null);
    } else {
      setNome('');
      setSetor('Bar');
      setCategoria('Clássico');
      setMetodo('Batido (Shake)');
      setRecipiente('Taça Coupe');
      setGelo('Sem Gelo');
      setGuarnicao('Zest Cítrico');
      setMontagem('');
      setFotoUrl('');
      setPhotoInfo(null);
      setIngredientes([
        { nome: '', quantidade: 50, unidade: 'ml', categoriaIngrediente: 'destilado' },
      ]);
      setPreparo(['']);
    }
    setFormError(null);
    setErrorField(null);
  }, [fichaToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle Photo Upload with Client-Side Canvas Optimization
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setFormError(null);
      setPhotoInfo('Redimensionando no canvas (máx 1000px) e comprimindo WebP...');

      const optimizedUrl = await fichaService.uploadPhoto(file);
      setFotoUrl(optimizedUrl);
      setPhotoInfo('Foto otimizada e pronta para salvar!');
    } catch (err: any) {
      console.error(err);
      setFormError('Falha ao processar e otimizar foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFotoUrl('');
    setPhotoInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add / Remove Ingredients
  const handleAddIngredient = () => {
    setIngredientes((prev) => [
      ...prev,
      {
        nome: '',
        quantidade: setor === 'Bar' ? 30 : 100,
        unidade: setor === 'Bar' ? 'ml' : 'g',
        categoriaIngrediente: setor === 'Bar' ? 'destilado' : 'proteina',
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof Ingrediente, value: any) => {
    setIngredientes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredientes.length <= 1) return;
    setIngredientes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add / Remove Preparation steps
  const handleAddStep = () => {
    setPreparo((prev) => [...prev, '']);
  };

  const handleUpdateStep = (index: number, text: string) => {
    setPreparo((prev) => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleRemoveStep = (index: number) => {
    if (preparo.length <= 1) return;
    setPreparo((prev) => prev.filter((_, idx) => idx !== index));
  };

  const scrollToField = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus?.();
      }
    }, 60);
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrorField(null);

    if (!nome.trim()) {
      const msg = 'Informe o nome da ficha técnica (ex: Negroni Clássico).';
      setFormError(msg);
      setErrorField('nome');
      scrollToField('input-ficha-nome');
      return;
    }

    const validIngredients = ingredientes.filter((i) => i.nome.trim() !== '');
    if (validIngredients.length === 0) {
      const msg = 'Adicione pelo menos 1 ingrediente com nome e quantidade.';
      setFormError(msg);
      setErrorField('ingredientes');
      scrollToField('section-ficha-ingredientes');
      return;
    }

    const validSteps = preparo.filter((p) => p.trim() !== '');
    if (validSteps.length === 0) {
      const msg = 'Adicione pelo menos 1 passo no modo de preparo.';
      setFormError(msg);
      setErrorField('preparo');
      scrollToField('section-ficha-preparo');
      return;
    }

    if (!montagem.trim()) {
      const msg = 'Descreva a instrução de montagem e apresentação no salão.';
      setFormError(msg);
      setErrorField('montagem');
      scrollToField('textarea-ficha-montagem');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: FichaTecnica = {
        id: fichaToEdit?.id || '',
        nome: nome.trim(),
        setor,
        categoria: categoria.trim() || 'Geral',
        metodo: metodo.trim() || 'Padrão',
        recipiente: recipiente.trim() || 'Padrão',
        gelo: gelo.trim() || 'N/A',
        guarnicao: guarnicao.trim() || 'N/A',
        foto_url: fotoUrl.trim() || undefined,
        montagem: montagem.trim(),
        ingredientes: validIngredients,
        preparo: validSteps,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao salvar ficha técnica no Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!fichaToEdit?.id || !onDelete) return;
    if (confirm(`Tem certeza que deseja excluir a ficha técnica "${fichaToEdit.nome}"?`)) {
      setIsSubmitting(true);
      try {
        await onDelete(fichaToEdit.id);
        onClose();
      } catch (err: any) {
        setFormError(err.message || 'Erro ao excluir ficha.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const unidadesDisponiveis: UnidadeMedida[] = [
    'ml',
    'g',
    'dash',
    'un',
    'colher de bar',
    'lances',
    'fatia',
    'a gosto',
  ];

  const categoriasIngredienteDisponiveis: { value: CategoriaIngrediente; label: string }[] = [
    { value: 'destilado', label: 'Destilado' },
    { value: 'alcoolico', label: 'Alcoólico / Bitter' },
    { value: 'citrico', label: 'Cítrico' },
    { value: 'xarope', label: 'Xarope / Doçura' },
    { value: 'proteina', label: 'Proteína' },
    { value: 'hortifruti', label: 'Hortifruti' },
    { value: 'laticinio', label: 'Laticínio' },
    { value: 'tempero', label: 'Tempero' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-3xl max-h-[94vh] bg-[#121215] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-[#09090b]/95 border-b border-red-900/40 px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/80 border border-red-600/40 text-red-500">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-oswald text-base sm:text-xl font-bold uppercase tracking-wider text-white">
                {isEditing ? `Editar: ${fichaToEdit.nome}` : 'Nova Ficha Técnica • Garagem 29'}
              </h2>
              <p className="text-xs text-zinc-400">
                Parâmetros exatos e foto de montagem para a equipe da oficina/bar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-4 py-4 space-y-5 pb-safe">
          {formError && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* UPLOAD DE FOTO (CÂMERA OU GALERIA + CANVAS COMPRESSION) */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-500" />
                Foto do Drink / Prato Montado (Padrão de Entrega)
              </label>
              {fotoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] font-mono text-red-400 hover:underline cursor-pointer"
                >
                  Remover foto
                </button>
              )}
            </div>

            {/* Hidden Input File supporting Camera capture on Mobile */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoFileChange}
              className="hidden"
            />

            {fotoUrl ? (
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-700 flex-shrink-0 relative group">
                  <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="text-emerald-400 font-mono font-bold block flex items-center gap-1">
                    ✓ Imagem Otimizada (WebP máx 1000px)
                  </span>
                  <p className="text-zinc-400 text-[11px]">
                    Foto pronta para visualização em alta definição na bancada.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-red-400 text-xs font-oswald uppercase tracking-wider font-semibold hover:underline cursor-pointer pt-1"
                  >
                    Trocar foto
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-red-600/70 rounded-2xl p-4 text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900/70"
              >
                {isUploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                    <span className="text-xs font-mono font-bold text-red-400">{photoInfo}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-600/30 text-red-400 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-200">
                      Tirar foto agora ou escolher da galeria
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Otimização automática no Canvas: WebP, max 1000px, 80% qualidade
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Setor Selection (Big buttons) */}
          <div className="space-y-1.5">
            <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
              Setor Responsável *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSetor('Bar')}
                className={`py-3 px-3 rounded-xl font-oswald uppercase tracking-wider font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  setor === 'Bar'
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <Wine className="w-4 h-4" />
                <span>Bar</span>
              </button>

              <button
                type="button"
                onClick={() => setSetor('Cozinha')}
                className={`py-3 px-3 rounded-xl font-oswald uppercase tracking-wider font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  setor === 'Cozinha'
                    ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_12px_rgba(234,88,12,0.4)]'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Cozinha</span>
              </button>

              <button
                type="button"
                onClick={() => setSetor('Prep')}
                className={`py-3 px-3 rounded-xl font-oswald uppercase tracking-wider font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  setor === 'Prep'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Prep</span>
              </button>
            </div>
          </div>

          {/* Basic Info: Nome, Categoria, Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
                Nome da Ficha Técnica / Drink / Prato *
              </label>
              <input
                id="input-ficha-nome"
                type="text"
                required
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (errorField === 'nome') {
                    setErrorField(null);
                    setFormError(null);
                  }
                }}
                placeholder="Ex: Negroni Rock, Tartar Garagem 29..."
                className={`w-full bg-[#09090b] rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
                  errorField === 'nome'
                    ? 'border-2 border-red-500 ring-2 ring-red-500/40 bg-red-950/20'
                    : 'border border-zinc-800 focus:ring-2 focus:ring-red-600/40 focus:border-red-600'
                }`}
              />
              {errorField === 'nome' && (
                <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Nome da ficha é obrigatório
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
                Categoria *
              </label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Autoral, Clássico, Entrada..."
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600"
              />
            </div>
          </div>

          {/* Operational specs: Método, Recipiente, Gelo, Guarnição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
                Método de Preparo
              </label>
              <input
                type="text"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                placeholder="Ex: Batido (Shake), Mexido (Stir), Selado..."
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
                Copo / Recipiente / Louça
              </label>
              <input
                type="text"
                value={recipiente}
                onChange={(e) => setRecipiente(e.target.value)}
                placeholder="Ex: Taça Coupe, Rocks, Prato Fundo..."
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
                Gelo
              </label>
              <input
                type="text"
                value={gelo}
                onChange={(e) => setGelo(e.target.value)}
                placeholder="Ex: Cubo Grande Translúcido, Sem Gelo..."
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-oswald text-xs font-bold uppercase tracking-wider text-zinc-300">
                Guarnição / Decoração
              </label>
              <input
                type="text"
                value={guarnicao}
                onChange={(e) => setGuarnicao(e.target.value)}
                placeholder="Ex: Zest de Laranja Bahia, Brotos..."
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600"
              />
            </div>
          </div>

          {/* DYNAMIC INGREDIENTS SECTION */}
          <div
            id="section-ficha-ingredientes"
            className={`space-y-3 pt-2 rounded-2xl transition-all ${
              errorField === 'ingredientes' ? 'bg-red-950/20 border-2 border-red-500/80 ring-2 ring-red-500/20 p-2.5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <h3 className="font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider text-red-500">
                  Ingredientes & Medidas em ML / Gramas *
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddIngredient();
                  if (errorField === 'ingredientes') {
                    setErrorField(null);
                    setFormError(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-600/40 text-xs font-oswald uppercase tracking-wider font-bold hover:bg-red-900/50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Ingrediente</span>
              </button>
            </div>
            {errorField === 'ingredientes' && (
              <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <AlertTriangle className="w-3.5 h-3.5" />
                Adicione pelo menos um ingrediente com nome e quantidade
              </p>
            )}

            <div className="space-y-2">
              {ingredientes.map((ing, idx) => (
                <div
                  key={idx}
                  className="bg-[#09090b] p-3 rounded-xl border border-zinc-800 space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2">
                    {/* Qtd */}
                    <div className="col-span-3 sm:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Qtd</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={ing.quantidade}
                        onChange={(e) =>
                          handleUpdateIngredient(idx, 'quantidade', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm font-mono font-bold text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    {/* Unidade */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Unidade</label>
                      <select
                        value={ing.unidade}
                        onChange={(e) =>
                          handleUpdateIngredient(idx, 'unidade', e.target.value as UnidadeMedida)
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        {unidadesDisponiveis.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nome do Ingrediente */}
                    <div className="col-span-5 sm:col-span-5">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">
                        Nome do Ingrediente
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Gin London Dry..."
                        value={ing.nome}
                        onChange={(e) => handleUpdateIngredient(idx, 'nome', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    {/* Categoria do Ingrediente */}
                    <div className="col-span-10 sm:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Categoria</label>
                      <select
                        value={ing.categoriaIngrediente}
                        onChange={(e) =>
                          handleUpdateIngredient(
                            idx,
                            'categoriaIngrediente',
                            e.target.value as CategoriaIngrediente
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        {categoriasIngredienteDisponiveis.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delete button */}
                    <div className="col-span-2 sm:col-span-1 flex items-end justify-center pb-0.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        disabled={ingredientes.length <= 1}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Remover ingrediente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Observação rápida do ingrediente */}
                  <div>
                    <input
                      type="text"
                      placeholder="Observação operacional (opcional, ex: 'Tanqueray', 'Espremido no dia')..."
                      value={ing.observacao || ''}
                      onChange={(e) => handleUpdateIngredient(idx, 'observacao', e.target.value)}
                      className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC PREPARATION STEPS */}
          <div
            id="section-ficha-preparo"
            className={`space-y-3 pt-2 rounded-2xl transition-all ${
              errorField === 'preparo' ? 'bg-red-950/20 border-2 border-red-500/80 ring-2 ring-red-500/20 p-2.5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-red-500" />
                <h3 className="font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Passo a Passo de Preparo *
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddStep();
                  if (errorField === 'preparo') {
                    setErrorField(null);
                    setFormError(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs font-oswald uppercase tracking-wider font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Passo</span>
              </button>
            </div>
            {errorField === 'preparo' && (
              <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <AlertTriangle className="w-3.5 h-3.5" />
                Adicione pelo menos um passo de preparo
              </p>
            )}

            <div className="space-y-2">
              {preparo.map((passo, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-700 text-red-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-2">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    required
                    value={passo}
                    onChange={(e) => handleUpdateStep(idx, e.target.value)}
                    placeholder={`Descreva a ação do passo ${idx + 1} com objetividade...`}
                    className="flex-1 bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 font-sans resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    disabled={preparo.length <= 1}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 flex-shrink-0 mt-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MONTAGEM E FINALIZAÇÃO */}
          <div className="space-y-1 pt-2">
            <label className="font-oswald text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Montagem, Finalização e Apresentação no Salão *
            </label>
            <textarea
              id="textarea-ficha-montagem"
              rows={2}
              required
              value={montagem}
              onChange={(e) => {
                setMontagem(e.target.value);
                if (errorField === 'montagem') {
                  setErrorField(null);
                  setFormError(null);
                }
              }}
              placeholder="Ex: Expresse o óleo do zest de laranja na borda e insira delicadamente entre o gelo e o copo..."
              className={`w-full bg-[#09090b] rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none transition-all resize-none ${
                errorField === 'montagem'
                  ? 'border-2 border-red-500 ring-2 ring-red-500/40 bg-red-950/20'
                  : 'border border-zinc-800 focus:ring-2 focus:ring-red-600/40 focus:border-red-600 font-sans'
              }`}
            />
            {errorField === 'montagem' && (
              <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertTriangle className="w-3.5 h-3.5" />
                Instrução de montagem e finalização é obrigatória
              </p>
            )}
          </div>

        </form>

        {/* Sticky Error Toast/Bar right above the action buttons */}
        {formError && (
          <div className="bg-red-950 border-t border-red-600/80 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-red-100 shadow-[0_-6px_25px_rgba(220,38,38,0.4)] animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
              <div className="min-w-0">
                <p className="font-oswald uppercase tracking-wider text-red-400 font-bold text-xs leading-none">
                  Falta preencher informações:
                </p>
                <p className="text-zinc-100 text-xs font-sans mt-0.5 truncate font-medium">
                  {formError}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (errorField === 'nome') scrollToField('input-ficha-nome');
                  else if (errorField === 'ingredientes') scrollToField('section-ficha-ingredientes');
                  else if (errorField === 'preparo') scrollToField('section-ficha-preparo');
                  else if (errorField === 'montagem') scrollToField('textarea-ficha-montagem');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-oswald uppercase text-[11px] font-bold transition-all shadow-md active:scale-95 cursor-pointer border border-red-400"
              >
                Ir ao campo
              </button>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-red-900/50 transition-colors"
                aria-label="Dispensar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-[#09090b] border-t border-red-900/40 px-4 py-3 flex items-center justify-between gap-3">
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-3.5 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-oswald uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Excluir</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs sm:text-sm font-oswald uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploadingPhoto}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-oswald uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-red-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Ficha</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
