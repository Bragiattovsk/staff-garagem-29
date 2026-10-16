import { supabase, isSupabaseConfigured } from './supabaseClient';

const DEFAULT_PIN = '2929';
const LOCAL_PIN_KEY = 'admin_security_pin';

export const configService = {
  /**
   * Busca o PIN administrativo na tabela app_config do Supabase
   * com fallback para o cache local ou para o padrão '2929'
   */
  async getAdminPin(): Promise<string> {
    if (!isSupabaseConfigured() || !supabase) {
      return localStorage.getItem(LOCAL_PIN_KEY) || DEFAULT_PIN;
    }

    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'admin_pin')
        .single();

      if (error || !data?.value) {
        console.warn('[configService] Falha ao buscar admin_pin no Supabase, usando fallback:', error?.message);
        return localStorage.getItem(LOCAL_PIN_KEY) || DEFAULT_PIN;
      }

      // Atualiza cache local
      localStorage.setItem(LOCAL_PIN_KEY, data.value);
      return data.value;
    } catch (err) {
      console.warn('[configService] Exceção ao consultar app_config:', err);
      return localStorage.getItem(LOCAL_PIN_KEY) || DEFAULT_PIN;
    }
  },

  /**
   * Atualiza o PIN administrativo na tabela app_config do Supabase e no cache local
   */
  async updateAdminPin(newPin: string): Promise<void> {
    const trimmed = newPin.trim();
    if (!trimmed || trimmed.length !== 4 || !/^\d{4}$/.test(trimmed)) {
      throw new Error('O PIN deve conter exatamente 4 dígitos numéricos.');
    }

    // Salva no cache local
    localStorage.setItem(LOCAL_PIN_KEY, trimmed);

    // Se o Supabase estiver configurado, atualiza na nuvem
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('app_config')
        .upsert(
          {
            key: 'admin_pin',
            value: trimmed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('[configService] Erro ao salvar novo PIN no Supabase:', error.message);
        throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }
    }
  },
};
