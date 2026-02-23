#!/usr/bin/env tsx
/**
 * Seed 10 test users with complete profiles, friendships, and attendance.
 *
 * Usage:
 *   tsx scripts/seed-test-users.ts
 *
 * Requirements:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────
interface TestUser {
  username: string;
  email: string;
  password: string;
  instagram: string | null;
  avatar: string;
}

interface UserWithId extends TestUser {
  id: string;
}

// ── Constants ──────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#8ac926",
  "#FB5607",
  "#FF006E",
  "#8338EC",
  "#3A86FF",
];

// Artists from Lollapalooza for attendance records
const SAMPLE_ARTISTS = [
  "viernes-main-stage-olivia-rodrigo",
  "viernes-secondary-stage-bad-bunny",
  "sabado-main-stage-coldplay",
  "sabado-secondary-stage-dua-lipa",
  "domingo-main-stage-the-weeknd",
  "viernes-main-stage-taylor-swift",
  "sabado-main-stage-billie-eilish",
  "domingo-secondary-stage-drake",
  "viernes-secondary-stage-ariana-grande",
  "sabado-secondary-stage-the-weeknd",
];

// ── Setup ──────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Helpers ────────────────────────────────────────────────────

function randomAvatar(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function getTestUsers(): TestUser[] {
  const names = [
    "juan", "maria", "carlos", "sofia", "diego", "lucia", "pablo", "emma",
    "martin", "ana", "lucas", "carolina", "fernando", "isabella", "jorge",
    "valentina", "andres", "matilda", "sergio", "gabriela",
  ];

  return names.map((name, idx) => ({
    username: `${name}_test`,
    email: `${name}+test${idx}@example.com`,
    password: "Test@12345",
    instagram: idx % 3 === 0 ? `@${name}_ig` : null,
    avatar: randomAvatar(),
  }));
}

// ── Main ───────────────────────────────────────────────────────

async function seedTestUsers() {
  try {
    console.log("🌱 Starting seed...\n");

    const testUsers = getTestUsers();
    const createdUsers: UserWithId[] = [];

    // 1. Create auth users and profiles
    console.log("📝 Creating 20 test users...");
    for (const testUser of testUsers) {
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
      });

      if (authError) {
        console.warn(`  ⚠️  Failed to create ${testUser.username}: ${authError.message}`);
        continue;
      }

      if (!authData.user?.id) {
        console.warn(`  ⚠️  No user ID returned for ${testUser.username}`);
        continue;
      }

      const userId = authData.user.id;

      // Insert profile
      const { error: profileError } = await admin
        .from("profiles")
        .insert({
          id: userId,
          username: testUser.username,
          instagram: testUser.instagram,
          is_public: true,
          avatar: testUser.avatar,
          avatar_url: null,
          community_onboarding_completed: true,
        });

      if (profileError) {
        console.warn(`  ⚠️  Failed to create profile for ${testUser.username}: ${profileError.message}`);
        continue;
      }

      createdUsers.push({ ...testUser, id: userId });
      console.log(`  ✅ ${testUser.username} (${userId.slice(0, 8)}...)`);
    }

    console.log(`\n✨ Created ${createdUsers.length} users\n`);

    // 2. Create friendships (some random connections + some chains)
    console.log("🤝 Creating friendships...");
    let friendshipCount = 0;

    // Connect each user to 2-4 others
    for (let i = 0; i < createdUsers.length; i++) {
      const requester = createdUsers[i];
      const friendCount = Math.floor(Math.random() * 3) + 2; // 2-4 friends per user

      for (let j = 0; j < friendCount; j++) {
        // Random addressee different from requester
        let addresseeIdx = Math.floor(Math.random() * createdUsers.length);
        while (addresseeIdx === i) {
          addresseeIdx = Math.floor(Math.random() * createdUsers.length);
        }

        const addressee = createdUsers[addresseeIdx];

        // Skip if relationship already exists (either direction)
        const existingFriendship = createdUsers.some(
          (u, idx) =>
            (idx < i && u.id === addressee.id) ||
            (idx === i && addresseeIdx < i),
        );

        if (existingFriendship) continue;

        const status = Math.random() > 0.3 ? "accepted" : "pending";

        const { error } = await admin
          .from("friendships")
          .insert({
            requester_id: requester.id,
            addressee_id: addressee.id,
            status,
          });

        if (!error) {
          friendshipCount++;
        }
      }
    }

    console.log(`  ✅ Created ${friendshipCount} friendship connections\n`);

    // 3. Create attendance records (each user attends 3-6 artists)
    console.log("📅 Creating attendance records...");
    let attendanceCount = 0;

    for (const user of createdUsers) {
      const artistCount = Math.floor(Math.random() * 4) + 3; // 3-6 artists per user
      const artistIndices = new Set<number>();

      while (artistIndices.size < artistCount) {
        artistIndices.add(Math.floor(Math.random() * SAMPLE_ARTISTS.length));
      }

      for (const idx of artistIndices) {
        const { error } = await admin
          .from("attendance")
          .insert({
            user_id: user.id,
            artist_id: SAMPLE_ARTISTS[idx],
          });

        if (!error) {
          attendanceCount++;
        }
      }
    }

    console.log(`  ✅ Created ${attendanceCount} attendance records\n`);

    // 4. Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Seed completed successfully!");
    console.log(`   📊 ${createdUsers.length} users created`);
    console.log(`   🤝 ${friendshipCount} friendships`);
    console.log(`   📅 ${attendanceCount} attendance records`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("Test user credentials:");
    createdUsers.slice(0, 5).forEach((user) => {
      console.log(`  • ${user.username} / ${user.email} / password: Test@12345`);
    });
    console.log(`  ... and ${createdUsers.length - 5} more\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedTestUsers();
