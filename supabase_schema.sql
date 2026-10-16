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
  tempo_preparo_segundos INT,
  dica_operacional TEXT,
  alergicos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para buscas ultrarrápidas por nome e setor
CREATE INDEX IF NOT EXISTS idx_recipes_nome ON public.recipes(nome);
CREATE INDEX IF NOT EXISTS idx_recipes_setor ON public.recipes(setor);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para staff interno (leitura e escrita aberta para anon/autenticados)
CREATE POLICY "Permitir leitura pública das fichas para o staff"
  ON public.recipes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção e edição das fichas"
  ON public.recipes FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Criação do Bucket de Armazenamento para Fotos (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-photos', 'recipe-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o Bucket 'recipe-photos'
CREATE POLICY "Fotos publicamente visíveis"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "Permitir upload de fotos pelo staff"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipe-photos');

CREATE POLICY "Permitir exclusão e atualização de fotos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "Permitir delete de fotos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recipe-photos');

-- 4. Tabela de Configurações Operacionais (PIN Administrativo do Staff)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para app_config
CREATE POLICY "Permitir leitura de configurações para staff"
  ON public.app_config FOR SELECT
  USING (true);

CREATE POLICY "Permitir atualização de configurações para staff"
  ON public.app_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- Inserir PIN padrão de fábrica do Garagem 29 ('2929')
INSERT INTO public.app_config (key, value)
VALUES ('admin_pin', '2929')
ON CONFLICT (key) DO NOTHING;
