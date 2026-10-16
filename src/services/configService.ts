import { supabase, isSupabaseConfigured } from './supabaseClient';

const DEFAULT_STAFF_PIN = '2929';
const DEFAULT_ADMIN_PIN = '2900';
const LOCAL_STAFF_PIN_KEY = 'staff_security_pin';
const LOCAL_ADMIN_PIN_KEY = 'admin_security_pin';

export const configService = {
  /**
   * Valida o PIN de Staff (equipe operacional) ou Admin para destravar o terminal de consulta.
   * Utiliza a função RPC 'verify_staff_pin' no PostgreSQL/Supabase.
   */
  async verifyStaffPin(candidatePin: string): Promise<boolean> {
    const trimmed = candidatePin.trim();
    if (!trimmed || trimmed.length !== 4) return false;

    if (!isSupabaseConfigured() || !supabase) {
      const localStaff = localStorage.getItem(LOCAL_STAFF_PIN_KEY) || DEFAULT_STAFF_PIN;
      const localAdmin = localStorage.getItem(LOCAL_ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
      return trimmed === localStaff || trimmed === localAdmin;
    }

    try {
      const { data, error } = await supabase.rpc('verify_staff_pin', {
        candidate_pin: trimmed,
      });

      if (error) {
        // Fallback: se verify_staff_pin ainda não existir no Supabase, tenta verify_admin_pin
        const { data: adminData } = await supabase.rpc('verify_admin_pin', {
          candidate_pin: trimmed,
        });
        if (adminData === true) return true;

        const localStaff = localStorage.getItem(LOCAL_STAFF_PIN_KEY) || DEFAULT_STAFF_PIN;
        const localAdmin = localStorage.getItem(LOCAL_ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
        return trimmed === localStaff || trimmed === localAdmin;
      }

      return data === true;
    } catch {
      const localStaff = localStorage.getItem(LOCAL_STAFF_PIN_KEY) || DEFAULT_STAFF_PIN;
      const localAdmin = localStorage.getItem(LOCAL_ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
      return trimmed === localStaff || trimmed === localAdmin;
    }
  },

  /**
   * Valida exclusivamente o PIN de Gerente / Admin para ações restritas (criar, editar, excluir).
   * Utiliza a função RPC 'verify_admin_pin'.
   */
  async verifyAdminPin(candidatePin: string): Promise<boolean> {
    const trimmed = candidatePin.trim();
    if (!trimmed || trimmed.length !== 4) return false;

    if (!isSupabaseConfigured() || !supabase) {
      const localAdmin = localStorage.getItem(LOCAL_ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
      return trimmed === localAdmin;
    }

    try {
      const { data, error } = await supabase.rpc('verify_admin_pin', {
        candidate_pin: trimmed,
      });

      if (error) {
        const localAdmin = localStorage.getItem(LOCAL_ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
        return trimmed === localAdmin;
      }

      return data === true;
    } catch {
      const localAdmin = localStorage.getItem(LOCAL_ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
      return trimmed === localAdmin;
    }
  },

  /**
   * Alias de conveniência para validação padrão da tela inicial
   */
  async verifyPin(candidatePin: string): Promise<boolean> {
    return this.verifyStaffPin(candidatePin);
  },

  /**
   * Atualiza o PIN da Equipe (Staff) no Supabase e no cache local
   */
  async updateStaffPin(newPin: string): Promise<void> {
    const trimmed = newPin.trim();
    if (!trimmed || trimmed.length !== 4 || !/^\d{4}$/.test(trimmed)) {
      throw new Error('O PIN deve conter exatamente 4 dígitos numéricos.');
    }

    localStorage.setItem(LOCAL_STAFF_PIN_KEY, trimmed);

    if (isSupabaseConfigured() && supabase) {
      const { error: rpcError } = await supabase.rpc('update_app_pin', {
        pin_type: 'staff_pin',
        new_pin: trimmed,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('app_config')
          .upsert(
            { key: 'staff_pin', value: trimmed },
            { onConflict: 'key' }
          );
        if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }
    }
  },

  /**
   * Atualiza o PIN de Gerente / Admin no Supabase e no cache local
   */
  async updateAdminPin(newPin: string): Promise<void> {
    const trimmed = newPin.trim();
    if (!trimmed || trimmed.length !== 4 || !/^\d{4}$/.test(trimmed)) {
      throw new Error('O PIN deve conter exatamente 4 dígitos numéricos.');
    }

    localStorage.setItem(LOCAL_ADMIN_PIN_KEY, trimmed);

    if (isSupabaseConfigured() && supabase) {
      const { error: rpcError } = await supabase.rpc('update_app_pin', {
        pin_type: 'admin_pin',
        new_pin: trimmed,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('app_config')
          .upsert(
            { key: 'admin_pin', value: trimmed },
            { onConflict: 'key' }
          );
        if (error) throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
      }
    }
  },

  /**
   * Checa se o serviço de segurança está conectado à nuvem
   */
  isCloudConnected(): boolean {
    return isSupabaseConfigured() && !!supabase;
  },
};

