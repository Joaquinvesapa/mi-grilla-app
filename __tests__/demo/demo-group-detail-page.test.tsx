import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import type { DemoGroupDetail, DemoGroupWithMeta } from "@/lib/demo/demo-types";
import type { GridDay } from "@/lib/schedule-types";
import type { Profile } from "@/lib/profile-types";

// ── Mocks ─────────────────────────────────────────────────

const { mockUseDemoContext } = vi.hoisted(() => ({
  mockUseDemoContext: vi.fn(),
}));

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: mockUseDemoContext,
}));

vi.mock("@/app/demo/social/grupos/[groupId]/_components/demo-group-header", () => ({
  DemoGroupHeader: ({ group }: { group: DemoGroupDetail }) => (
    <div data-testid="demo-group-header" data-group-id={group.id} />
  ),
}));

vi.mock("@/app/(app)/social/grupos/[groupId]/_components/group-agenda", () => ({
  GroupAgenda: ({
    memberCount,
    groupAttendance,
  }: {
    days: GridDay[];
    groupAttendance: Record<string, Profile[]>;
    memberCount: number;
  }) => (
    <div
      data-testid="group-agenda"
      data-member-count={memberCount}
      data-attendance-keys={Object.keys(groupAttendance).join(",")}
    />
  ),
}));

vi.mock("@/components/avatar", () => ({
  Avatar: ({ username }: { username: string }) => (
    <div data-testid="avatar" data-username={username} />
  ),
  AVATAR_SIZE: { MD: "md" },
}));

import DemoGroupDetailPage from "@/app/demo/social/grupos/[groupId]/page";
import { computeGroupAttendance } from "@/lib/demo/demo-group-utils";

// ── Helpers ────────────────────────────────────────────────

function makeProfile(id: string, username: string): Profile {
  return {
    id,
    username,
    instagram: null,
    is_public: true,
    is_admin: false,
    community_onboarding_completed: true,
    avatar: "#FF006E",
    avatar_url: null,
    created_at: "2026-01-01T00:00:00Z",
  };
}

function makeGroupDetail(id: string, name: string, myRole: "admin" | "member" = "admin"): DemoGroupDetail {
  return {
    id,
    name,
    invite_code: "CODE123",
    created_by: "demo-user-001",
    created_at: "2026-01-01T00:00:00Z",
    members: [
      { group_id: id, user_id: "demo-user-001", role: "admin", profile: makeProfile("demo-user-001", "joaquin_demo") },
      { group_id: id, user_id: "sofi-002", role: "member", profile: makeProfile("sofi-002", "sofi_music") },
    ],
    my_role: myRole,
  };
}

function makeGroup(id: string, name: string): DemoGroupWithMeta {
  return {
    id,
    name,
    invite_code: "CODE123",
    created_by: "demo-user-001",
    created_at: "2026-01-01T00:00:00Z",
    member_count: 2,
    my_role: "admin",
  };
}

const GROUP_001 = makeGroupDetail("group-001", "Los Pibes del Lolla");
const GROUP_002 = makeGroupDetail("group-002", "After Tyler", "member");

function setupContext(groupDetails: Record<string, DemoGroupDetail> = {}) {
  mockUseDemoContext.mockReturnValue({
    days: [],
    groupDetails,
    groups: [makeGroup("group-001", "Los Pibes del Lolla"), makeGroup("group-002", "After Tyler")],
    attendance: new Set<string>(),
    friendAttendance: {} as Record<string, string[]>,
    demoUser: makeProfile("demo-user-001", "joaquin_demo"),
  });
}

// ── Pure function tests ────────────────────────────────────

describe("computeGroupAttendance — uses friendAttendance when available", () => {
  const admin = makeProfile("admin-001", "admin_user");
  const friend = makeProfile("friend-002", "friend_user");

  it("uses friendAttendance for members with an explicit entry", () => {
    const members = [
      { group_id: "g1", user_id: "friend-002", role: "member" as const, profile: friend },
    ];
    const result = computeGroupAttendance(
      members,
      new Set(["demo-artist-A"]),
      { "friend-002": ["artist-X", "artist-Y"] },
    );
    expect(result["artist-X"]).toHaveLength(1);
    expect(result["artist-X"][0].username).toBe("friend_user");
    expect(result["artist-Y"]).toHaveLength(1);
  });

  it("falls back to demo attendance Set for members NOT in friendAttendance", () => {
    const members = [
      { group_id: "g1", user_id: "admin-001", role: "admin" as const, profile: admin },
    ];
    const result = computeGroupAttendance(
      members,
      new Set(["demo-artist-A", "demo-artist-B"]),
      {}, // no friendAttendance entry for admin
    );
    expect(result["demo-artist-A"]).toHaveLength(1);
    expect(result["demo-artist-A"][0].username).toBe("admin_user");
    expect(result["demo-artist-B"]).toHaveLength(1);
  });

  it("merges attendance from multiple members on the same artist", () => {
    const members = [
      { group_id: "g1", user_id: "admin-001", role: "admin" as const, profile: admin },
      { group_id: "g1", user_id: "friend-002", role: "member" as const, profile: friend },
    ];
    const result = computeGroupAttendance(
      members,
      new Set(["shared-artist"]),
      { "friend-002": ["shared-artist"] },
    );
    expect(result["shared-artist"]).toHaveLength(2);
    expect(result["shared-artist"].map((p) => p.username)).toContain("admin_user");
    expect(result["shared-artist"].map((p) => p.username)).toContain("friend_user");
  });
});

// ── Render helper ─────────────────────────────────────────

function renderWithSuspense(groupId: string) {
  return act(() => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <DemoGroupDetailPage params={Promise.resolve({ groupId })} />
      </Suspense>
    );
  });
}

// ── Tests ─────────────────────────────────────────────────

describe("DemoGroupDetailPage — renders group header", () => {
  it("renders DemoGroupHeader for a known group", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    expect(screen.getByTestId("demo-group-header")).toBeInTheDocument();
  });

  it("renders DemoGroupHeader with the correct group id", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    expect(screen.getByTestId("demo-group-header")).toHaveAttribute("data-group-id", "group-001");
  });
});

describe("DemoGroupDetailPage — member list", () => {
  it("renders avatars for each member", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    const avatars = screen.getAllByTestId("avatar");
    expect(avatars).toHaveLength(2);
  });

  it("renders member usernames with @ prefix", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    expect(screen.getByText("@joaquin_demo")).toBeInTheDocument();
    expect(screen.getByText("@sofi_music")).toBeInTheDocument();
  });

  it("shows Admin badge for admin member", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});

describe("DemoGroupDetailPage — group agenda", () => {
  it("renders GroupAgenda component", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    expect(screen.getByTestId("group-agenda")).toBeInTheDocument();
  });

  it("passes member count to GroupAgenda", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-001");
    expect(screen.getByTestId("group-agenda")).toHaveAttribute("data-member-count", "2");
  });
});

describe("DemoGroupDetailPage — 404 state", () => {
  it("renders not-found message for unknown groupId", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-999");
    expect(screen.getByText(/no encontrado/i)).toBeInTheDocument();
  });

  it("does NOT render DemoGroupHeader for unknown groupId", async () => {
    setupContext({ "group-001": GROUP_001 });
    await renderWithSuspense("group-999");
    expect(screen.queryByTestId("demo-group-header")).not.toBeInTheDocument();
  });
});
