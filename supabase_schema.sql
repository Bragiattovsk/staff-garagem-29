-- ==============================================================================
-- SCHEMA SUPABASE: FICHAS TÉCNICAS OPERACIONAIS (BAR & COZINHA)
-- ==============================================================================
-- Cole este script no SQL Editor do seu projeto Supabase para criar a estrutura completa.

-- 1. Criação da Tabela de Receitas / Fichas Técnicas
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


-- Índices para buscas ultrarrápidas por nome e setor
CREATE INDEX IF NOT EXISTS idx_recipes_nome ON public.recipes(nome);
CREATE INDEX IF NOT EXISTS idx_recipes_setor ON public.recipes(setor);

-- 2. Habilitação de Row Level Security (RLS)
-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas permissivas
DROP POLICY IF EXISTS "Inserção e edição para a equipe" ON public.recipes;
DROP POLICY IF EXISTS "Permitir leitura pública das fichas para o staff" ON public.recipes;
DROP POLICY IF EXISTS "Permitir inserção e edição das fichas" ON public.recipes;
DROP POLICY IF EXISTS "Permitir leitura das fichas" ON public.recipes;
DROP POLICY IF EXISTS "Permitir inserção de fichas válidas" ON public.recipes;
DROP POLICY IF EXISTS "Permitir atualização de fichas válidas" ON public.recipes;
DROP POLICY IF EXISTS "Permitir exclusão de fichas existentes" ON public.recipes;

-- Políticas de acesso granulares (sem 'USING (true)' em escritas)
CREATE POLICY "Permitir leitura das fichas"
  ON public.recipes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserção de fichas válidas"
  ON public.recipes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    nome IS NOT NULL AND length(trim(nome)) > 0 AND
    setor IN ('Bar', 'Cozinha', 'Prep')
  );

CREATE POLICY "Permitir atualização de fichas válidas"
  ON public.recipes FOR UPDATE
  TO anon, authenticated
  USING (id IS NOT NULL)
  WITH CHECK (
    nome IS NOT NULL AND length(trim(nome)) > 0 AND
    setor IN ('Bar', 'Cozinha', 'Prep')
  );

CREATE POLICY "Permitir exclusão de fichas existentes"
  ON public.recipes FOR DELETE
  TO anon, authenticated
  USING (id IS NOT NULL);

-- 3. Criação do Bucket de Armazenamento para Fotos (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-photos', 'recipe-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas antigas de storage
DROP POLICY IF EXISTS "Visualizar fotos dos pratos e drinks" ON storage.objects;
DROP POLICY IF EXISTS "Fotos publicamente visíveis" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos pelo staff" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão e atualização de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete de fotos" ON storage.objects;

-- Políticas de Storage para o Bucket 'recipe-photos'
-- NOTA: Como o bucket é 'public = true', as fotos já são publicamente visíveis via URL
-- Sem precisar de política SELECT ampla (o que causava o alerta de listagem do bucket).
CREATE POLICY "Permitir upload de fotos pelo staff"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'recipe-photos');

CREATE POLICY "Permitir exclusão e atualização de fotos"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "Permitir delete de fotos"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'recipe-photos');

-- 4. Tabela de Configurações Operacionais (PIN Administrativo do Staff)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Habilitar RLS na tabela app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas permissivas que expunham o PIN
DROP POLICY IF EXISTS "Permitir atualização do PIN" ON public.app_config;
DROP POLICY IF EXISTS "Permitir leitura de configurações para staff" ON public.app_config;
DROP POLICY IF EXISTS "Permitir atualização de configurações para staff" ON public.app_config;
DROP POLICY IF EXISTS "Bloquear acesso direto à app_config" ON public.app_config;

-- Bloquear leitura e escrita direta da tabela app_config para anon/authenticated
-- O PIN e dados sensíveis NUNCA devem ser acessíveis via SELECT direto na API REST
CREATE POLICY "Bloquear acesso direto à app_config"
  ON public.app_config
  FOR ALL
  TO anon, authenticated
  USING (false);

-- Inserir PINs de fábrica do Garagem 29:
-- 1) staff_pin ('2929'): Para a equipe destravar o terminal de consulta no bar/cozinha
-- 2) admin_pin ('2900'): Exclusivo para gerentes/chefs criarem, editarem e excluírem receitas
INSERT INTO public.app_config (key, value)
VALUES 
  ('staff_pin', '2929'),
  ('admin_pin', '2900')
ON CONFLICT (key) DO NOTHING;

-- 5. Funções RPC Seguras (Executadas no servidor via SECURITY DEFINER)

-- Função RPC: Valida o PIN de Staff (equipe operacional) ou Admin na tela de entrada
CREATE OR REPLACE FUNCTION public.verify_staff_pin(candidate_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  stored_staff_pin TEXT;
  stored_admin_pin TEXT;
BEGIN
  SELECT value INTO stored_staff_pin FROM public.app_config WHERE key = 'staff_pin' LIMIT 1;
  SELECT value INTO stored_admin_pin FROM public.app_config WHERE key = 'admin_pin' LIMIT 1;

  IF stored_staff_pin IS NULL THEN stored_staff_pin := '2929'; END IF;
  IF stored_admin_pin IS NULL THEN stored_admin_pin := '2900'; END IF;

  -- Tanto o PIN da equipe quanto o PIN do gerente destravam o terminal de consulta
  RETURN candidate_pin = stored_staff_pin OR candidate_pin = stored_admin_pin;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO anon, authenticated;

-- Função RPC: Valida exclusivamente o PIN de Gerente / Admin (criar, editar, excluir)
CREATE OR REPLACE FUNCTION public.verify_admin_pin(candidate_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  stored_admin_pin TEXT;
BEGIN
  SELECT value INTO stored_admin_pin FROM public.app_config WHERE key = 'admin_pin' LIMIT 1;

  IF stored_admin_pin IS NULL THEN stored_admin_pin := '2900'; END IF;

  RETURN candidate_pin = stored_admin_pin;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_pin(TEXT) TO anon, authenticated;

-- Função RPC: Atualiza com segurança o PIN desejado ('staff_pin' ou 'admin_pin')
CREATE OR REPLACE FUNCTION public.update_app_pin(pin_type TEXT, new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF pin_type NOT IN ('staff_pin', 'admin_pin') THEN
    RAISE EXCEPTION 'Tipo de PIN inválido. Use staff_pin ou admin_pin.';
  END IF;

  IF new_pin IS NULL OR new_pin !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'O PIN deve conter exatamente 4 dígitos numéricos.';
  END IF;

  INSERT INTO public.app_config (key, value)
  VALUES (pin_type, new_pin)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_app_pin(TEXT, TEXT) TO anon, authenticated;

-- Compatibilidade retroativa para update_admin_pin
CREATE OR REPLACE FUNCTION public.update_admin_pin(new_pin TEXT, current_pin TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.update_app_pin('admin_pin', new_pin);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_admin_pin(TEXT, TEXT) TO anon, authenticated;


