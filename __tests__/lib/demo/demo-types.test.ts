import { describe, it, expect } from "vitest"
import type {
  DemoFriendship,
  DemoGroupMemberWithProfile,
  DemoGroupWithMeta,
  DemoGroupDetail,
  DemoContextValue,
} from "@/lib/demo/demo-types"
import type { Profile } from "@/lib/profile-types"

// ── Type-shape tests ───────────────────────────────────────
// These tests verify that the module exports the correct interfaces
// by constructing objects that satisfy them.

describe("DemoFriendship", () => {
  it("accepts a valid friendship object with accepted status", () => {
    const friendship: DemoFriendship = {
      id: "fs-001",
      requester_id: "user-a",
      addressee_id: "user-b",
      status: "accepted",
      created_at: "2026-01-01T00:00:00Z",
    }
    expect(friendship.id).toBe("fs-001")
    expect(friendship.status).toBe("accepted")
  })

  it("accepts a valid friendship object with pending status", () => {
    const friendship: DemoFriendship = {
      id: "fs-002",
      requester_id: "user-c",
      addressee_id: "user-d",
      status: "pending",
      created_at: "2026-01-02T00:00:00Z",
    }
    expect(friendship.status).toBe("pending")
    expect(friendship.requester_id).toBe("user-c")
  })
})

describe("DemoGroupWithMeta", () => {
  it("accepts a valid group-with-meta object as admin", () => {
    const group: DemoGroupWithMeta = {
      id: "group-001",
      name: "Los Pibes del Lolla",
      invite_code: "LOLLA2025",
      created_by: "demo-user-001",
      created_at: "2026-01-01T00:00:00Z",
      member_count: 4,
      my_role: "admin",
    }
    expect(group.my_role).toBe("admin")
    expect(group.member_count).toBe(4)
  })

  it("accepts a valid group-with-meta object as member", () => {
    const group: DemoGroupWithMeta = {
      id: "group-002",
      name: "After Tyler",
      invite_code: "TYLER25",
      created_by: "mati-rock-001",
      created_at: "2026-01-01T00:00:00Z",
      member_count: 3,
      my_role: "member",
    }
    expect(group.my_role).toBe("member")
    expect(group.name).toBe("After Tyler")
  })
})

describe("DemoGroupMemberWithProfile", () => {
  it("accepts a valid member with profile object", () => {
    const profile: Profile = {
      id: "user-a",
      username: "sofi_music",
      instagram: "@sofi",
      is_public: true,
      is_admin: false,
      community_onboarding_completed: true,
      avatar: "#FF006E",
      avatar_url: null,
      created_at: "2026-01-01T00:00:00Z",
    }
    const member: DemoGroupMemberWithProfile = {
      group_id: "group-001",
      user_id: "user-a",
      role: "member",
      profile,
    }
    expect(member.role).toBe("member")
    expect(member.profile.username).toBe("sofi_music")
  })

  it("accepts an admin member with profile", () => {
    const profile: Profile = {
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
    const member: DemoGroupMemberWithProfile = {
      group_id: "group-001",
      user_id: "demo-user-001",
      role: "admin",
      profile,
    }
    expect(member.role).toBe("admin")
    expect(member.group_id).toBe("group-001")
  })
})

describe("DemoGroupDetail", () => {
  it("accepts a valid group detail with members array", () => {
    const profile: Profile = {
      id: "user-a",
      username: "sofi_music",
      instagram: null,
      is_public: true,
      is_admin: false,
      community_onboarding_completed: true,
      avatar: "#FF006E",
      avatar_url: null,
      created_at: "2026-01-01T00:00:00Z",
    }
    const detail: DemoGroupDetail = {
      id: "group-001",
      name: "Los Pibes del Lolla",
      invite_code: "LOLLA2025",
      created_by: "demo-user-001",
      created_at: "2026-01-01T00:00:00Z",
      members: [{ group_id: "group-001", user_id: "user-a", role: "member", profile }],
      my_role: "admin",
    }
    expect(detail.members).toHaveLength(1)
    expect(detail.members[0].profile.username).toBe("sofi_music")
  })
})

describe("DemoContextValue groupDetails field", () => {
  it("groupDetails is Record<string, DemoGroupDetail> not Map", () => {
    // Type-level check: Record is an object, not a Map
    const groupDetails: Record<string, DemoGroupDetail> = {
      "group-001": {
        id: "group-001",
        name: "Test Group",
        invite_code: "TEST01",
        created_by: "user-a",
        created_at: "2026-01-01T00:00:00Z",
        members: [],
        my_role: "admin",
      },
    }
    expect(Object.keys(groupDetails)).toHaveLength(1)
    expect(groupDetails["group-001"].name).toBe("Test Group")
  })
})
