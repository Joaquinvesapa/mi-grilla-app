import { describe, it, expect } from "vitest"
import {
  DEMO_CURRENT_MIN,
  DEMO_DAY_LABEL,
  DEMO_EVENT_NAME,
  DEMO_USER,
  DEMO_PROFILES,
  DEMO_FRIENDSHIPS,
  DEMO_GROUPS,
  DEMO_GROUP_DETAILS,
  DEMO_USER_ATTENDANCE,
  DEMO_FRIEND_ATTENDANCE,
  DEMO_DAYS,
} from "@/lib/demo/demo-data"

// ── Constants ──────────────────────────────────────────────

describe("DEMO_CURRENT_MIN", () => {
  it("equals 1110 (18h30 in minutes)", () => {
    expect(DEMO_CURRENT_MIN).toBe(1110)
  })
})

describe("DEMO_DAY_LABEL", () => {
  it("equals 'Viernes'", () => {
    expect(DEMO_DAY_LABEL).toBe("Viernes")
  })
})

describe("DEMO_EVENT_NAME", () => {
  it("is a non-empty string from the schedule JSON", () => {
    expect(typeof DEMO_EVENT_NAME).toBe("string")
    expect(DEMO_EVENT_NAME.length).toBeGreaterThan(0)
  })

  it("contains 'Lollapalooza'", () => {
    expect(DEMO_EVENT_NAME).toContain("Lollapalooza")
  })
})

// ── DEMO_DAYS ──────────────────────────────────────────────

describe("DEMO_DAYS", () => {
  it("has exactly 3 days", () => {
    expect(DEMO_DAYS).toHaveLength(3)
  })

  it("first day is Viernes", () => {
    expect(DEMO_DAYS[0].label).toBe("Viernes")
  })

  it("second day is Sábado", () => {
    expect(DEMO_DAYS[1].label).toBe("Sábado")
  })

  it("third day is Domingo", () => {
    expect(DEMO_DAYS[2].label).toBe("Domingo")
  })

  it("each day has artists and stages", () => {
    for (const day of DEMO_DAYS) {
      expect(day.artists.length).toBeGreaterThan(0)
      expect(day.stages.length).toBeGreaterThan(0)
    }
  })

  it("artist IDs follow the {day}-{name} format with spaces as hyphens", () => {
    const viernesDay = DEMO_DAYS[0]
    const tyler = viernesDay.artists.find((a) => a.name === "Tyler, The Creator")
    expect(tyler).toBeDefined()
    // "Viernes" + "-" + "Tyler, The Creator" with spaces→hyphens
    expect(tyler!.id).toBe("Viernes-Tyler,-The-Creator")
  })

  it("DJO on Viernes has ID 'Viernes-DJO'", () => {
    const viernesDay = DEMO_DAYS[0]
    const djo = viernesDay.artists.find((a) => a.name === "DJO")
    expect(djo).toBeDefined()
    expect(djo!.id).toBe("Viernes-DJO")
  })
})

// ── DEMO_USER ──────────────────────────────────────────────

describe("DEMO_USER", () => {
  it("has id 'demo-user-001'", () => {
    expect(DEMO_USER.id).toBe("demo-user-001")
  })

  it("has username 'joaquin_demo'", () => {
    expect(DEMO_USER.username).toBe("joaquin_demo")
  })

  it("has instagram '@joaquinvesapa'", () => {
    expect(DEMO_USER.instagram).toBe("@joaquinvesapa")
  })

  it("is public", () => {
    expect(DEMO_USER.is_public).toBe(true)
  })

  it("has avatar '#3A86FF'", () => {
    expect(DEMO_USER.avatar).toBe("#3A86FF")
  })

  it("is not admin", () => {
    expect(DEMO_USER.is_admin).toBe(false)
  })

  it("has community_onboarding_completed true", () => {
    expect(DEMO_USER.community_onboarding_completed).toBe(true)
  })

  it("has avatar_url null", () => {
    expect(DEMO_USER.avatar_url).toBeNull()
  })

  it("has a valid ISO created_at string", () => {
    expect(typeof DEMO_USER.created_at).toBe("string")
    expect(DEMO_USER.created_at.length).toBeGreaterThan(0)
    // Should be parseable as a date
    expect(isNaN(Date.parse(DEMO_USER.created_at))).toBe(false)
  })
})

// ── DEMO_PROFILES ──────────────────────────────────────────

describe("DEMO_PROFILES", () => {
  it("has exactly 10 profiles", () => {
    expect(DEMO_PROFILES).toHaveLength(10)
  })

  it("includes the demo user", () => {
    const found = DEMO_PROFILES.find((p) => p.id === "demo-user-001")
    expect(found).toBeDefined()
    expect(found!.username).toBe("joaquin_demo")
  })

  it("includes sofi_music as a friend", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "sofi_music")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#FF006E")
  })

  it("includes nico_lolla as a friend", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "nico_lolla")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#8ac926")
  })

  it("includes cami_fest as a friend", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "cami_fest")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#FB5607")
  })

  it("includes mati_rock as a friend", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "mati_rock")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#8338EC")
  })

  it("includes lu_beats as a friend", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "lu_beats")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#3A86FF")
  })

  it("includes tomi_live as a friend", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "tomi_live")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#8ac926")
  })

  it("includes vale_dance as community-only", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "vale_dance")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#FB5607")
  })

  it("includes fede_bass as community-only", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "fede_bass")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#FF006E")
  })

  it("includes mar_vibes as community-only", () => {
    const found = DEMO_PROFILES.find((p) => p.username === "mar_vibes")
    expect(found).toBeDefined()
    expect(found!.avatar).toBe("#8338EC")
  })

  it("all profiles have required Profile fields", () => {
    for (const profile of DEMO_PROFILES) {
      expect(typeof profile.id).toBe("string")
      expect(typeof profile.username).toBe("string")
      expect(typeof profile.is_public).toBe("boolean")
      expect(typeof profile.is_admin).toBe("boolean")
      expect(typeof profile.community_onboarding_completed).toBe("boolean")
      expect(typeof profile.avatar).toBe("string")
      expect(typeof profile.created_at).toBe("string")
    }
  })

  it("all profile IDs are unique", () => {
    const ids = DEMO_PROFILES.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(10)
  })
})

// ── DEMO_FRIENDSHIPS ───────────────────────────────────────

describe("DEMO_FRIENDSHIPS", () => {
  it("has exactly 8 friendships (6 accepted + 2 pending)", () => {
    expect(DEMO_FRIENDSHIPS).toHaveLength(8)
  })

  it("has 6 accepted friendships", () => {
    const accepted = DEMO_FRIENDSHIPS.filter((f) => f.status === "accepted")
    expect(accepted).toHaveLength(6)
  })

  it("has 2 pending friendships", () => {
    const pending = DEMO_FRIENDSHIPS.filter((f) => f.status === "pending")
    expect(pending).toHaveLength(2)
  })

  it("all accepted friendships involve demo-user-001", () => {
    const accepted = DEMO_FRIENDSHIPS.filter((f) => f.status === "accepted")
    for (const f of accepted) {
      const involvesDemo =
        f.requester_id === "demo-user-001" || f.addressee_id === "demo-user-001"
      expect(involvesDemo).toBe(true)
    }
  })

  it("pending friendships are received BY demo-user-001 (from vale_dance and fede_bass)", () => {
    const pending = DEMO_FRIENDSHIPS.filter((f) => f.status === "pending")
    // addressee is demo user (they are the recipient)
    for (const f of pending) {
      expect(f.addressee_id).toBe("demo-user-001")
    }
    // requesters are the community users
    const requesterIds = pending.map((f) => f.requester_id)
    const valeProfile = DEMO_PROFILES.find((p) => p.username === "vale_dance")
    const fedeProfile = DEMO_PROFILES.find((p) => p.username === "fede_bass")
    expect(requesterIds).toContain(valeProfile!.id)
    expect(requesterIds).toContain(fedeProfile!.id)
  })

  it("all friendships have unique IDs", () => {
    const ids = DEMO_FRIENDSHIPS.map((f) => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(8)
  })
})

// ── DEMO_GROUPS ────────────────────────────────────────────

describe("DEMO_GROUPS", () => {
  it("has exactly 2 groups", () => {
    expect(DEMO_GROUPS).toHaveLength(2)
  })

  it("includes 'Los Pibes del Lolla' where demo user is admin", () => {
    const group = DEMO_GROUPS.find((g) => g.name === "Los Pibes del Lolla")
    expect(group).toBeDefined()
    expect(group!.my_role).toBe("admin")
    expect(group!.invite_code).toBe("LOLLA2025")
    expect(group!.member_count).toBe(4)
  })

  it("includes 'After Tyler' where demo user is member", () => {
    const group = DEMO_GROUPS.find((g) => g.name === "After Tyler")
    expect(group).toBeDefined()
    expect(group!.my_role).toBe("member")
    expect(group!.invite_code).toBe("TYLER25")
    expect(group!.member_count).toBe(3)
  })
})

// ── DEMO_GROUP_DETAILS ─────────────────────────────────────

describe("DEMO_GROUP_DETAILS", () => {
  it("is a Record with 2 entries", () => {
    expect(Object.keys(DEMO_GROUP_DETAILS)).toHaveLength(2)
  })

  it("group-001 has 4 members", () => {
    const detail = DEMO_GROUP_DETAILS["group-001"]
    expect(detail).toBeDefined()
    expect(detail.members).toHaveLength(4)
  })

  it("group-001 demo user is admin", () => {
    const detail = DEMO_GROUP_DETAILS["group-001"]
    const demoMember = detail.members.find((m) => m.user_id === "demo-user-001")
    expect(demoMember).toBeDefined()
    expect(demoMember!.role).toBe("admin")
  })

  it("group-002 has 3 members", () => {
    const detail = DEMO_GROUP_DETAILS["group-002"]
    expect(detail).toBeDefined()
    expect(detail.members).toHaveLength(3)
  })

  it("group-002 demo user is member (not admin)", () => {
    const detail = DEMO_GROUP_DETAILS["group-002"]
    const demoMember = detail.members.find((m) => m.user_id === "demo-user-001")
    expect(demoMember).toBeDefined()
    expect(demoMember!.role).toBe("member")
  })

  it("all members have profile objects with id and username", () => {
    for (const detail of Object.values(DEMO_GROUP_DETAILS)) {
      for (const member of detail.members) {
        expect(typeof member.profile.id).toBe("string")
        expect(typeof member.profile.username).toBe("string")
      }
    }
  })
})

// ── DEMO_USER_ATTENDANCE ───────────────────────────────────

describe("DEMO_USER_ATTENDANCE", () => {
  it("has exactly 8 shows", () => {
    expect(DEMO_USER_ATTENDANCE).toHaveLength(8)
  })

  it("all IDs are non-empty strings", () => {
    for (const id of DEMO_USER_ATTENDANCE) {
      expect(typeof id).toBe("string")
      expect(id.length).toBeGreaterThan(0)
    }
  })

  it("all IDs reference real artists in DEMO_DAYS", () => {
    const allArtistIds = new Set(DEMO_DAYS.flatMap((d) => d.artists.map((a) => a.id)))
    for (const id of DEMO_USER_ATTENDANCE) {
      expect(allArtistIds.has(id)).toBe(true)
    }
  })

  it("has shows from at least 2 different days", () => {
    const days = new Set(DEMO_USER_ATTENDANCE.map((id) => id.split("-")[0]))
    expect(days.size).toBeGreaterThanOrEqual(2)
  })

  it("has Tyler on Viernes", () => {
    expect(DEMO_USER_ATTENDANCE).toContain("Viernes-Tyler,-The-Creator")
  })

  it("all IDs are unique", () => {
    const uniqueIds = new Set(DEMO_USER_ATTENDANCE)
    expect(uniqueIds.size).toBe(8)
  })
})

// ── DEMO_FRIEND_ATTENDANCE ─────────────────────────────────

describe("DEMO_FRIEND_ATTENDANCE", () => {
  it("has entries for 6 friends (not community-only)", () => {
    expect(Object.keys(DEMO_FRIEND_ATTENDANCE)).toHaveLength(6)
  })

  it("each friend has 4-8 shows", () => {
    for (const [, shows] of Object.entries(DEMO_FRIEND_ATTENDANCE)) {
      expect(shows.length).toBeGreaterThanOrEqual(4)
      expect(shows.length).toBeLessThanOrEqual(8)
    }
  })

  it("all friend show IDs reference real artists in DEMO_DAYS", () => {
    const allArtistIds = new Set(DEMO_DAYS.flatMap((d) => d.artists.map((a) => a.id)))
    for (const shows of Object.values(DEMO_FRIEND_ATTENDANCE)) {
      for (const id of shows) {
        expect(allArtistIds.has(id)).toBe(true)
      }
    }
  })

  it("sofi_music has high overlap with demo user (at least 2 shared shows)", () => {
    const sofi = DEMO_PROFILES.find((p) => p.username === "sofi_music")!
    const sofiShows = DEMO_FRIEND_ATTENDANCE[sofi.id] ?? []
    const demoSet = new Set(DEMO_USER_ATTENDANCE)
    const overlap = sofiShows.filter((id) => demoSet.has(id))
    expect(overlap.length).toBeGreaterThanOrEqual(2)
  })

  it("does NOT include community-only users (vale_dance, fede_bass, mar_vibes)", () => {
    const valeProfile = DEMO_PROFILES.find((p) => p.username === "vale_dance")!
    const fedeProfile = DEMO_PROFILES.find((p) => p.username === "fede_bass")!
    const marProfile = DEMO_PROFILES.find((p) => p.username === "mar_vibes")!
    expect(DEMO_FRIEND_ATTENDANCE[valeProfile.id]).toBeUndefined()
    expect(DEMO_FRIEND_ATTENDANCE[fedeProfile.id]).toBeUndefined()
    expect(DEMO_FRIEND_ATTENDANCE[marProfile.id]).toBeUndefined()
  })
})
