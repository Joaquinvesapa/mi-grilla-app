-- ============================================================
-- MiGrilla — Migración: avatar_url + Storage bucket para avatars
-- ============================================================

-- 1. Agregar columna avatar_url a profiles
ALTER TABLE public.profiles
ADD COLUMN avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url
  IS 'URL de foto de perfil subida por el usuario (Supabase Storage)';

-- 2. Bucket de Storage para avatars (público para lectura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Storage

-- Lectura pública
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Cada usuario sube su propio avatar (carpeta = su user_id)
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Cada usuario puede actualizar su propio avatar
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Cada usuario puede borrar su propio avatar
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
