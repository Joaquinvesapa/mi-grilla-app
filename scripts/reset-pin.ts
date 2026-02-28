#!/usr/bin/env tsx
/**
 * Reset a user's PIN by username.
 *
 * Usage:
 *   tsx scripts/reset-pin.ts <username> <new_pin>
 *
 * Example:
 *   tsx scripts/reset-pin.ts joaquin 123456
 *
 * Requirements:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

// ── Constants ──────────────────────────────────────────────────

const EMAIL_DOMAIN = "migrilla.app";
const PIN_REGEX = /^[0-9]{6}$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

// ── Setup ──────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Main ───────────────────────────────────────────────────────

async function resetPin() {
  const [username, newPin] = process.argv.slice(2);

  // ── Validate args ──
  if (!username || !newPin) {
    console.error("Uso: tsx scripts/reset-pin.ts <username> <new_pin>");
    console.error("Ejemplo: tsx scripts/reset-pin.ts joaquin 123456");
    process.exit(1);
  }

  const normalizedUsername = username.toLowerCase().trim();

  if (!USERNAME_REGEX.test(normalizedUsername)) {
    console.error("❌ Username inválido. Solo letras minúsculas, números y guiones bajos (3-20 caracteres).");
    process.exit(1);
  }

  if (!PIN_REGEX.test(newPin)) {
    console.error("❌ PIN inválido. Debe ser exactamente 6 dígitos.");
    process.exit(1);
  }

  // ── Find user by profile username ──
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, username")
    .eq("username", normalizedUsername)
    .single();

  if (profileError || !profile) {
    console.error(`❌ No se encontró el usuario "${normalizedUsername}".`);
    process.exit(1);
  }

  // ── Update password via admin API ──
  const { error: updateError } = await admin.auth.admin.updateUserById(
    profile.id,
    { password: newPin },
  );

  if (updateError) {
    console.error(`❌ Error al actualizar el PIN: ${updateError.message}`);
    process.exit(1);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ PIN actualizado para @${profile.username}`);
  console.log(`   Email interno: ${normalizedUsername}@${EMAIL_DOMAIN}`);
  console.log(`   Nuevo PIN: ${newPin}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  process.exit(0);
}

resetPin();
