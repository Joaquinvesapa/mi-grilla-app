-- ============================================================
-- MiGrilla — Seed: 10 Test Users with Profiles, Friendships & Attendance
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- NOTA: Este script asume que los usuarios ya existen en auth.users.
-- Si necesitas crear usuarios de auth también, usa el script TypeScript.

-- ── 1. Insert Test Profiles ────────────────────────────────
-- Los IDs son UUIDs válidos generados para este seed

INSERT INTO public.profiles (id, username, instagram, is_public, avatar, avatar_url, community_onboarding_completed, created_at)
VALUES
  -- User 1
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'juan_test', '@juan_ig', true, '#8ac926', null, true, now()),
  -- User 2
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'maria_test', null, true, '#FB5607', null, true, now()),
  -- User 3
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'carlos_test', '@carlos_ig', true, '#FF006E', null, true, now()),
  -- User 4
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'sofia_test', null, true, '#8338EC', null, true, now()),
  -- User 5
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'diego_test', '@diego_ig', true, '#3A86FF', null, true, now()),
  -- User 6
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'lucia_test', null, true, '#8ac926', null, true, now()),
  -- User 7
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'pablo_test', '@pablo_ig', true, '#FB5607', null, true, now()),
  -- User 8
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'emma_test', null, true, '#FF006E', null, true, now()),
  -- User 9
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'martin_test', '@martin_ig', true, '#8338EC', null, true, now()),
  -- User 10
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'ana_test', null, true, '#3A86FF', null, true, now());

-- ── 2. Insert Friendships ──────────────────────────────────
-- Creamos conexiones entre usuarios (accepted + pending)

INSERT INTO public.friendships (requester_id, addressee_id, status, created_at)
VALUES
  -- juan_test (1) tiene amigos
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'accepted', now()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'accepted', now()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'pending', now()),

  -- maria_test (2) tiene amigos
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, 'accepted', now()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, 'accepted', now()),

  -- carlos_test (3) tiene amigos
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440007'::uuid, 'accepted', now()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid, 'pending', now()),

  -- sofia_test (4) tiene amigos
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440009'::uuid, 'accepted', now()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, 'accepted', now()),

  -- diego_test (5) tiene amigos
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, 'accepted', now()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid, 'accepted', now()),

  -- lucia_test (6) tiene amigos
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440009'::uuid, 'pending', now());

-- ── 3. Insert Attendance (Artist Selection) ─────────────────

INSERT INTO public.attendance (user_id, artist_id, created_at)
VALUES
  -- juan_test (1) asiste a estos artistas
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'viernes-main-stage-olivia-rodrigo', now()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'sabado-main-stage-coldplay', now()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'domingo-main-stage-the-weeknd', now()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'viernes-main-stage-taylor-swift', now()),

  -- maria_test (2)
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'viernes-secondary-stage-bad-bunny', now()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'sabado-main-stage-coldplay', now()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'domingo-main-stage-the-weeknd', now()),

  -- carlos_test (3)
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'sabado-secondary-stage-dua-lipa', now()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'viernes-main-stage-taylor-swift', now()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'sabado-main-stage-billie-eilish', now()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'domingo-secondary-stage-drake', now()),

  -- sofia_test (4)
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'viernes-main-stage-olivia-rodrigo', now()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'sabado-main-stage-billie-eilish', now()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'viernes-secondary-stage-ariana-grande', now()),

  -- diego_test (5)
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'viernes-secondary-stage-bad-bunny', now()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'sabado-secondary-stage-dua-lipa', now()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'domingo-main-stage-the-weeknd', now()),

  -- lucia_test (6)
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'viernes-main-stage-taylor-swift', now()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'sabado-main-stage-coldplay', now()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'domingo-secondary-stage-drake', now()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'sabado-main-stage-billie-eilish', now()),

  -- pablo_test (7)
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'viernes-main-stage-olivia-rodrigo', now()),
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'viernes-secondary-stage-ariana-grande', now()),
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'sabado-secondary-stage-dua-lipa', now()),

  -- emma_test (8)
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'sabado-main-stage-coldplay', now()),
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'viernes-secondary-stage-ariana-grande', now()),
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'domingo-main-stage-the-weeknd', now()),

  -- martin_test (9)
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'viernes-main-stage-taylor-swift', now()),
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'sabado-main-stage-billie-eilish', now()),
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'sabado-secondary-stage-dua-lipa', now()),

  -- ana_test (10)
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'viernes-secondary-stage-bad-bunny', now()),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'sabado-main-stage-coldplay', now()),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'domingo-secondary-stage-drake', now()),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'viernes-main-stage-olivia-rodrigo', now());

-- ── Verificación ────────────────────────────────────────────

-- Ver perfiles creados
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Ver amistades creadas
SELECT COUNT(*) as total_friendships FROM public.friendships;

-- Ver attendance creado
SELECT COUNT(*) as total_attendance FROM public.attendance;
