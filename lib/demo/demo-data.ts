// ── Demo Data ──────────────────────────────────────────────
// Static mock data for the interactive demo mode.
// Zero Supabase dependency — all data is computed at module load time.

import type { Profile } from "@/lib/profile-types"
import type { GridDay } from "@/lib/schedule-types"
import type {
  DemoFriendship,
  DemoGroupWithMeta,
  DemoGroupDetail,
  DemoGroupMemberWithProfile,
} from "@/lib/demo/demo-types"
import { parseSchedule } from "@/lib/schedule-utils"
import scheduleJson from "@/lollapalooza-schedule.json"
import type { RawSchedule } from "@/lib/schedule-types"

// ── Schedule ───────────────────────────────────────────────

const rawSchedule = scheduleJson as RawSchedule

/** Full parsed schedule — same data the real app uses */
export const DEMO_DAYS: GridDay[] = parseSchedule(rawSchedule)

/** Festival name from the JSON */
export const DEMO_EVENT_NAME: string = rawSchedule.evento

// ── Time Constants ─────────────────────────────────────────

/** Simulated current time: Viernes 18:30 Buenos Aires */
export const DEMO_CURRENT_MIN = 1110 // 18 * 60 + 30

/** Demo active day label */
export const DEMO_DAY_LABEL = "Viernes"

// ── Demo User ──────────────────────────────────────────────

export const DEMO_USER: Profile = {
  id: "demo-user-001",
  username: "joaquin_demo",
  instagram: "@joaquinvesapa",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#3A86FF",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00Z",
}

// ── Friend Profiles ────────────────────────────────────────

const SOFI: Profile = {
  id: "sofi-music-002",
  username: "sofi_music",
  instagram: "@sofimusic",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#FF006E",
  avatar_url: null,
  created_at: "2026-01-02T00:00:00Z",
}

const NICO: Profile = {
  id: "nico-lolla-003",
  username: "nico_lolla",
  instagram: null,
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#8ac926",
  avatar_url: null,
  created_at: "2026-01-03T00:00:00Z",
}

const CAMI: Profile = {
  id: "cami-fest-004",
  username: "cami_fest",
  instagram: "@camifest",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#FB5607",
  avatar_url: null,
  created_at: "2026-01-04T00:00:00Z",
}

const MATI: Profile = {
  id: "mati-rock-005",
  username: "mati_rock",
  instagram: null,
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#8338EC",
  avatar_url: null,
  created_at: "2026-01-05T00:00:00Z",
}

const LU: Profile = {
  id: "lu-beats-006",
  username: "lu_beats",
  instagram: "@lubeats",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#3A86FF",
  avatar_url: null,
  created_at: "2026-01-06T00:00:00Z",
}

const TOMI: Profile = {
  id: "tomi-live-007",
  username: "tomi_live",
  instagram: null,
  is_public: false,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#8ac926",
  avatar_url: null,
  created_at: "2026-01-07T00:00:00Z",
}

// ── Community-only Profiles ────────────────────────────────

const VALE: Profile = {
  id: "vale-dance-008",
  username: "vale_dance",
  instagram: "@valedance",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#FB5607",
  avatar_url: null,
  created_at: "2026-01-08T00:00:00Z",
}

const FEDE: Profile = {
  id: "fede-bass-009",
  username: "fede_bass",
  instagram: null,
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#FF006E",
  avatar_url: null,
  created_at: "2026-01-09T00:00:00Z",
}

const MAR: Profile = {
  id: "mar-vibes-010",
  username: "mar_vibes",
  instagram: "@marvibes",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#8338EC",
  avatar_url: null,
  created_at: "2026-01-10T00:00:00Z",
}

// ── All Profiles ───────────────────────────────────────────

/** All 10 demo profiles: demo user + 6 friends + 3 community-only */
export const DEMO_PROFILES: Profile[] = [
  DEMO_USER,
  SOFI,
  NICO,
  CAMI,
  MATI,
  LU,
  TOMI,
  VALE,
  FEDE,
  MAR,
]

// ── Friendships ────────────────────────────────────────────
// 6 accepted (demo user ↔ each friend) + 2 pending received (from vale_dance and fede_bass)

export const DEMO_FRIENDSHIPS: DemoFriendship[] = [
  {
    id: "fs-001",
    requester_id: "demo-user-001",
    addressee_id: "sofi-music-002",
    status: "accepted",
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "fs-002",
    requester_id: "nico-lolla-003",
    addressee_id: "demo-user-001",
    status: "accepted",
    created_at: "2026-01-16T00:00:00Z",
  },
  {
    id: "fs-003",
    requester_id: "demo-user-001",
    addressee_id: "cami-fest-004",
    status: "accepted",
    created_at: "2026-01-17T00:00:00Z",
  },
  {
    id: "fs-004",
    requester_id: "mati-rock-005",
    addressee_id: "demo-user-001",
    status: "accepted",
    created_at: "2026-01-18T00:00:00Z",
  },
  {
    id: "fs-005",
    requester_id: "demo-user-001",
    addressee_id: "lu-beats-006",
    status: "accepted",
    created_at: "2026-01-19T00:00:00Z",
  },
  {
    id: "fs-006",
    requester_id: "tomi-live-007",
    addressee_id: "demo-user-001",
    status: "accepted",
    created_at: "2026-01-20T00:00:00Z",
  },
  // Pending received (community users requesting to friend demo user)
  {
    id: "fs-007",
    requester_id: "vale-dance-008",
    addressee_id: "demo-user-001",
    status: "pending",
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "fs-008",
    requester_id: "fede-bass-009",
    addressee_id: "demo-user-001",
    status: "pending",
    created_at: "2026-02-02T00:00:00Z",
  },
]

// ── Groups ─────────────────────────────────────────────────

/** 2 demo groups — demo user is admin in group-001, member in group-002 */
export const DEMO_GROUPS: DemoGroupWithMeta[] = [
  {
    id: "group-001",
    name: "Los Pibes del Lolla",
    invite_code: "LOLLA2025",
    created_by: "demo-user-001",
    created_at: "2026-02-10T00:00:00Z",
    member_count: 4,
    my_role: "admin",
  },
  {
    id: "group-002",
    name: "After Tyler",
    invite_code: "TYLER25",
    created_by: "mati-rock-005",
    created_at: "2026-02-11T00:00:00Z",
    member_count: 3,
    my_role: "member",
  },
]

// ── Group Details ──────────────────────────────────────────

const group001Members: DemoGroupMemberWithProfile[] = [
  { group_id: "group-001", user_id: "demo-user-001", role: "admin", profile: DEMO_USER },
  { group_id: "group-001", user_id: "sofi-music-002", role: "member", profile: SOFI },
  { group_id: "group-001", user_id: "nico-lolla-003", role: "member", profile: NICO },
  { group_id: "group-001", user_id: "cami-fest-004", role: "member", profile: CAMI },
]

const group002Members: DemoGroupMemberWithProfile[] = [
  { group_id: "group-002", user_id: "mati-rock-005", role: "admin", profile: MATI },
  { group_id: "group-002", user_id: "demo-user-001", role: "member", profile: DEMO_USER },
  { group_id: "group-002", user_id: "lu-beats-006", role: "member", profile: LU },
]

/** Full group details keyed by group ID */
export const DEMO_GROUP_DETAILS: Record<string, DemoGroupDetail> = {
  "group-001": {
    id: "group-001",
    name: "Los Pibes del Lolla",
    invite_code: "LOLLA2025",
    created_by: "demo-user-001",
    created_at: "2026-02-10T00:00:00Z",
    members: group001Members,
    my_role: "admin",
  },
  "group-002": {
    id: "group-002",
    name: "After Tyler",
    invite_code: "TYLER25",
    created_by: "mati-rock-005",
    created_at: "2026-02-11T00:00:00Z",
    members: group002Members,
    my_role: "member",
  },
}

// ── Demo User Attendance ───────────────────────────────────
// 8 shows distributed across Viernes, Sábado, and Domingo.
// IDs are generated by parseSchedule: `${day.dia}-${artist.nombre}`.replace(/\s+/g, "-")

export const DEMO_USER_ATTENDANCE: string[] = [
  // Viernes (3 shows)
  "Viernes-DJO",                    // Flow Stage 18:00-19:00
  "Viernes-Lorde",                   // Samsung Stage 21:00-22:15
  "Viernes-Tyler,-The-Creator",      // Flow Stage 22:15-23:30
  // Sábado (3 shows)
  "Sábado-Marina",                   // Flow Stage 18:00-19:00
  "Sábado-Lewis-Capaldi",            // Samsung Stage 21:15-22:15
  "Sábado-Chappell-Roan",            // Flow Stage 22:15-23:45
  // Domingo (2 shows)
  "Domingo-Deftones",                // Samsung Stage 20:45-22:00
  "Domingo-Sabrina-Carpenter",       // Flow Stage 22:00-23:20
]

// ── Friend Attendance ──────────────────────────────────────
// Attendance per accepted friend ID.
// sofi = high overlap, mati = low overlap, others in between.

export const DEMO_FRIEND_ATTENDANCE: Record<string, string[]> = {
  // sofi_music — high overlap with demo (attends many of the same shows)
  [SOFI.id]: [
    "Viernes-DJO",
    "Viernes-Lorde",
    "Viernes-Tyler,-The-Creator",
    "Sábado-Marina",
    "Sábado-Chappell-Roan",
    "Domingo-Sabrina-Carpenter",
    "Domingo-Deftones",
    "Sábado-Skrillex",
  ],
  // nico_lolla — medium overlap
  [NICO.id]: [
    "Viernes-Lorde",
    "Viernes-Tyler,-The-Creator",
    "Sábado-Chappell-Roan",
    "Sábado-Skrillex",
    "Domingo-Deftones",
    "Domingo-Ratones-Paranoicos",
  ],
  // cami_fest — medium overlap
  [CAMI.id]: [
    "Viernes-DJO",
    "Viernes-Turnstile",
    "Sábado-Marina",
    "Sábado-Lewis-Capaldi",
    "Domingo-Sabrina-Carpenter",
    "Domingo-Doechii",
  ],
  // mati_rock — low overlap
  [MATI.id]: [
    "Viernes-Turnstile",
    "Sábado-Tv-Girl",
    "Sábado-Riize",
    "Domingo-Interpol",
    "Domingo-Ratones-Paranoicos",
  ],
  // lu_beats — medium overlap
  [LU.id]: [
    "Viernes-Tyler,-The-Creator",
    "Viernes-Peggy-Gou",
    "Sábado-Chappell-Roan",
    "Sábado-Skrillex",
    "Domingo-Kygo",
    "Domingo-Sabrina-Carpenter",
  ],
  // tomi_live — low/medium overlap
  [TOMI.id]: [
    "Viernes-Lorde",
    "Viernes-Royel-Otis",
    "Sábado-Angela-Torres",
    "Sábado-Paulo-Londra",
    "Domingo-Blood-Orange",
    "Domingo-Doechii",
  ],
}
