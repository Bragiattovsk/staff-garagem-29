import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Permite também configuração dinâmica via localStorage para testes rápidos
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_anon_key') : null;

export const supabaseUrl = envUrl || localUrl || '';
export const supabaseAnonKey = envKey || localKey || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('sua-url')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabase) {
    return {
      ok: false,
      message: 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.',
    };
  }

  try {
    const { error } = await supabase.from('recipes').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Erro ao conectar com a tabela 'recipes': ${error.message}` };
    }
    return { ok: true, message: 'Conexão com Supabase e tabela "recipes" estabelecida com sucesso!' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Falha desconhecida ao conectar ao Supabase.' };
  }
}
