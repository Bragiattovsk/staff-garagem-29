export type Setor = 'Bar' | 'Cozinha' | 'Prep';

export type UnidadeMedida = 'ml' | 'g' | 'dash' | 'un' | 'colher de bar' | 'lances' | 'fatia' | 'a gosto';

export type CategoriaIngrediente = 
  | 'destilado' 
  | 'alcoolico' 
  | 'citrico' 
  | 'xarope' 
  | 'proteina'
  | 'hortifruti'
  | 'laticinio'
  | 'tempero'
  | 'outro';

export interface Ingrediente {
  id?: string;
  nome: string;
  quantidade: number;
  unidade: UnidadeMedida;
  categoriaIngrediente: CategoriaIngrediente;
  observacao?: string;
}

export interface FichaTecnica {
  id: string;
  nome: string;
  setor: Setor;
  categoria: string;
  metodo: string;
  recipiente: string;
  gelo: string;
  guarnicao: string;
  foto_url?: string;
  ingredientes: Ingrediente[];
  preparo: string[];
  montagem: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type FiltroSetor = 'Todos' | Setor | 'Sub-receitas';

/**
 * Mapeamento direto com as colunas da tabela "recipes" no Supabase / PostgreSQL
 */
export interface SupabaseRecipeRow {
  id: string;
  nome: string;
  setor: Setor;
  categoria: string;
  metodo: string;
  recipiente: string;
  gelo: string;
  guarnicao: string;
  foto_url?: string | null;
  ingredientes: Ingrediente[];
  preparo: string[];
  montagem: string;
  created_at?: string;
  updated_at?: string;
}
