-- ── Add community onboarding flag ──────────────────────────
-- Tracks whether a user has been shown the community opt-in modal.
-- Existing users are marked as completed so they don't see it.
-- New users default to false → modal shows on first visit.

ALTER TABLE public.profiles
ADD COLUMN community_onboarding_completed boolean NOT NULL DEFAULT false;

-- Mark all existing users as having completed the onboarding
UPDATE public.profiles SET community_onboarding_completed = true;
