import type { FichaTecnica, FiltroSetor, SupabaseRecipeRow } from '../types/ficha';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { resizeAndCompressImage } from '../utils/imageOptimizer';

const STORAGE_KEY = 'garagem29_fichas_v1';

export interface IFichaService {
  getAll(): Promise<FichaTecnica[]>;
  getById(id: string): Promise<FichaTecnica | null>;
  save(ficha: FichaTecnica): Promise<FichaTecnica>;
  delete(id: string): Promise<void>;
  resetToDefaults(): Promise<FichaTecnica[]>;
  search(query: string, setor?: FiltroSetor): Promise<FichaTecnica[]>;
  uploadPhoto(file: File): Promise<string>;
  isOffline(): boolean;
  syncLocalToSupabase(): Promise<{ count: number; error?: string }>;
}

/**
 * Converte linha do Supabase (recipes) para FichaTecnica
 */
function mapRowToFicha(row: SupabaseRecipeRow): FichaTecnica {
  return {
    id: row.id,
    nome: row.nome,
    setor: row.setor,
    categoria: row.categoria,
    metodo: row.metodo,
    recipiente: row.recipiente,
    gelo: row.gelo,
    guarnicao: row.guarnicao,
    foto_url: row.foto_url || undefined,
    ingredientes: Array.isArray(row.ingredientes) ? row.ingredientes : [],
    preparo: Array.isArray(row.preparo) ? row.preparo : [],
    montagem: row.montagem || '',
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

const knownMissingColumns = new Set<string>();

/**
 * Converte FichaTecnica para formato da tabela "recipes"
 */
function mapFichaToRow(ficha: FichaTecnica): Partial<SupabaseRecipeRow> {
  const row: Record<string, any> = {
    id: ficha.id || undefined,
    nome: ficha.nome,
    setor: ficha.setor,
    categoria: ficha.categoria,
    metodo: ficha.metodo,
    recipiente: ficha.recipiente,
    gelo: ficha.gelo,
    guarnicao: ficha.guarnicao,
    foto_url: ficha.foto_url || null,
    ingredientes: ficha.ingredientes,
    preparo: ficha.preparo,
    montagem: ficha.montagem,
  };

  // Exclui previamente colunas detectadas como ausentes no banco
  for (const col of knownMissingColumns) {
    delete row[col];
  }

  return row as Partial<SupabaseRecipeRow>;
}

/**
 * Salva com resiliência de schema: se uma coluna opcional não existir no Supabase,
 * remove automaticamente a coluna do payload, memoriza a ausência e reenvia sem travar a operação do usuário.
 */
async function saveWithSchemaFallback(
  client: any,
  isNew: boolean,
  initialRowData: Record<string, any>,
  id?: string
): Promise<any> {
  let rowData = { ...initialRowData };

  // Remove previamente colunas que já sabemos não existir
  for (const col of knownMissingColumns) {
    delete rowData[col];
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const query = isNew
      ? client.from('recipes').insert([rowData]).select().single()
      : client.from('recipes').update(rowData).eq('id', id).select().single();

    const { data, error } = await query;

    if (!error) {
      return data;
    }

    // Detectar coluna ausente no cache de schema do PostgREST / Postgres
    const colMatch =
      error.message.match(/Could not find the '([^']+)' column/i) ||
      error.message.match(/column recipes\.([^\s]+) does not exist/i) ||
      error.message.match(/column "([^"]+)" of relation "recipes" does not exist/i);

    if (colMatch && colMatch[1]) {
      const missingCol = colMatch[1];
      console.warn(`[FichaService] Coluna opcional '${missingCol}' ausente no Supabase. Memorizando e reenviando sem esta coluna.`);
      knownMissingColumns.add(missingCol);
      delete rowData[missingCol];
      continue;
    }

    throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
  }

  throw new Error('Falha ao salvar no Supabase após tentativas de adaptação de schema.');
}

class HybridFichaService implements IFichaService {
  isOffline(): boolean {
    return !isSupabaseConfigured();
  }

  // --- MÉTODOS LOCALSTORAGE (OFFLINE FALLBACK & CACHE) ---
  private getLocalData(): FichaTecnica[] {
    try {
      if (typeof window !== 'undefined') {
        // Limpa chaves legadas contendo mocks das versões anteriores
        localStorage.removeItem('fichas_operacionais_db_v2');
        localStorage.removeItem('fichas_operacionais_db_v1');
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('[FichaService] Erro ao ler LocalStorage:', e);
      return [];
    }
  }

  private saveLocalData(fichas: FichaTecnica[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
    } catch (e) {
      console.error('[FichaService] Erro ao salvar no LocalStorage:', e);
    }
  }

  // --- IMPLEMENTAÇÃO DA INTERFACE ---

  async getAll(): Promise<FichaTecnica[]> {
    if (this.isOffline() || !supabase) {
      return this.getLocalData();
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.warn('[FichaService] Erro Supabase getAll, usando fallback local:', error.message);
        return this.getLocalData();
      }

      if (!data) {
        return [];
      }

      const fichas = data.map((row: any) => mapRowToFicha(row));
      this.saveLocalData(fichas); // Mantém cache offline atualizado
      return fichas;
    } catch (err) {
      console.warn('[FichaService] Exceção ao consultar Supabase, usando fallback local:', err);
      return this.getLocalData();
    }
  }

  async getById(id: string): Promise<FichaTecnica | null> {
    if (this.isOffline() || !supabase) {
      const local = this.getLocalData();
      return local.find((f) => f.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        const local = this.getLocalData();
        return local.find((f) => f.id === id) || null;
      }

      return mapRowToFicha(data);
    } catch {
      const local = this.getLocalData();
      return local.find((f) => f.id === id) || null;
    }
  }

  async save(ficha: FichaTecnica): Promise<FichaTecnica> {
    const now = new Date().toISOString();
    const isNew = !ficha.id;
    const resolvedId = ficha.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

    let fichaToSave: FichaTecnica = {
      ...ficha,
      id: resolvedId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `f_${Date.now()}`),
      atualizadoEm: now,
      criadoEm: ficha.criadoEm || now,
    };

    // Se o Supabase estiver configurado, salva diretamente na nuvem
    if (!this.isOffline() && supabase) {
      try {
        const rowData = mapFichaToRow(fichaToSave);
        const savedData = await saveWithSchemaFallback(supabase, isNew, rowData, fichaToSave.id);
        if (savedData) {
          fichaToSave = mapRowToFicha(savedData);
        }
      } catch (err: any) {
        console.warn('[FichaService] Erro ao sincronizar com Supabase:', err);
        throw err;
      }
    }

    // Salva no LocalStorage para cache offline
    const local = this.getLocalData();
    const index = local.findIndex((f) => f.id === fichaToSave.id);
    if (index >= 0) {
      local[index] = fichaToSave;
    } else {
      local.unshift(fichaToSave);
    }
    this.saveLocalData(local);

    return fichaToSave;
  }

  async delete(id: string): Promise<void> {
    // Exclui no Supabase se configurado
    if (!this.isOffline() && supabase) {
      try {
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) {
          console.error('[Supabase Delete Error]:', error.message);
          throw new Error(`Erro ao excluir no Supabase: ${error.message}`);
        }
      } catch (err: any) {
        console.warn('[FichaService] Erro ao deletar no Supabase:', err);
        throw err;
      }
    }

    // Exclui do cache local
    const local = this.getLocalData();
    this.saveLocalData(local.filter((f) => f.id !== id));
  }

  async resetToDefaults(): Promise<FichaTecnica[]> {
    localStorage.removeItem(STORAGE_KEY);
    this.saveLocalData([]);
    return [];
  }

  async search(query: string, setor: FiltroSetor = 'Todos'): Promise<FichaTecnica[]> {
    const all = await this.getAll();
    const q = query.trim().toLowerCase();

    return all.filter((ficha) => {
      let matchesSetor = true;
      if (setor === 'Sub-receitas') {
        matchesSetor = ficha.setor === 'Prep' || ficha.categoria.toLowerCase().includes('sub-receita');
      } else if (setor !== 'Todos') {
        matchesSetor = ficha.setor === setor;
      }
      if (!matchesSetor) return false;

      if (!q) return true;

      if (ficha.nome.toLowerCase().includes(q)) return true;
      if (ficha.categoria.toLowerCase().includes(q)) return true;
      if (ficha.metodo.toLowerCase().includes(q)) return true;
      if (ficha.recipiente.toLowerCase().includes(q)) return true;

      // Busca abrangente nos ingredientes
      return ficha.ingredientes.some(
        (i) =>
          i.nome.toLowerCase().includes(q) ||
          (i.observacao && i.observacao.toLowerCase().includes(q)) ||
          i.categoriaIngrediente.toLowerCase().includes(q)
      );
    });
  }

  /**
   * Processamento e Upload de Foto com Redimensionamento e Compressão WebP via Canvas
   */
  async uploadPhoto(file: File): Promise<string> {
    // 1. Otimização no client-side com HTML5 Canvas
    const { blob, dataUrl } = await resizeAndCompressImage(file, 1000, 0.8);

    // 2. Se estiver em Modo Offline ou sem Supabase: retorna dataUrl base64 comprimida
    if (this.isOffline() || !supabase) {
      return dataUrl;
    }

    // 3. Upload no bucket 'recipe-photos' do Supabase Storage
    try {
      const fileName = `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('[Storage Error] Falha ao enviar para recipe-photos, usando fallback:', uploadError.message);
        return dataUrl;
      }

      const { data } = supabase.storage.from('recipe-photos').getPublicUrl(filePath);
      return data.publicUrl || dataUrl;
    } catch (err) {
      console.warn('[FichaService] Exceção no upload de foto, usando fallback dataUrl:', err);
      return dataUrl;
    }
  }

  /**
   * Sincroniza fichas locais com a tabela Supabase
   */
  async syncLocalToSupabase(): Promise<{ count: number; error?: string }> {
    if (this.isOffline() || !supabase) {
      return { count: 0, error: 'Supabase não configurado.' };
    }

    try {
      const local = this.getLocalData();
      if (local.length === 0) {
        return { count: 0 };
      }
      let rows = local.map((f) => mapFichaToRow(f));

      for (let attempt = 0; attempt < 4; attempt++) {
        const { data, error } = await supabase.from('recipes').upsert(rows, { onConflict: 'id' }).select();

        if (!error) {
          return { count: data?.length || rows.length };
        }

        const colMatch =
          error.message.match(/Could not find the '([^']+)' column/i) ||
          error.message.match(/column recipes\.([^\s]+) does not exist/i) ||
          error.message.match(/column "([^"]+)" of relation "recipes" does not exist/i);

        if (colMatch && colMatch[1]) {
          const missingCol = colMatch[1];
          console.warn(`[FichaService] Sincronização: Coluna '${missingCol}' ausente no banco. Removendo do envio.`);
          knownMissingColumns.add(missingCol);
          rows = rows.map((r) => {
            const copy = { ...r };
            delete (copy as any)[missingCol];
            return copy;
          });
          continue;
        }

        return { count: 0, error: error.message };
      }

      return { count: 0, error: 'Falha ao sincronizar após adaptação de schema.' };
    } catch (err: any) {
      return { count: 0, error: err.message || 'Erro ao sincronizar.' };
    }
  }
}

export const fichaService: IFichaService = new HybridFichaService();
