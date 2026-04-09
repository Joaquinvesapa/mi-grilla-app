import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Profile } from "@/lib/profile-types";
import type { DemoFriendship } from "@/lib/demo/demo-types";

// ── Mocks ────────────────────────────────────────────────────

vi.mock("@/app/demo/social/_components/demo-search-input", () => ({
  DemoSearchInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="demo-search-input"
      aria-label="Buscar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/app/demo/social/_components/demo-user-card", () => ({
  DemoUserCard: ({ profile }: { profile: Profile }) => (
    <div data-testid="demo-user-card" data-username={profile.username} />
  ),
}));

const mockSendFriendRequest = vi.fn();
vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: vi.fn(() => ({
    demoUser: { id: "demo-user-001", username: "joaquin_demo" } as Profile,
    allProfiles: [] as Profile[],
    friendships: [] as DemoFriendship[],
    sendFriendRequest: mockSendFriendRequest,
  })),
}));

import { useDemoContext } from "@/lib/demo/demo-context";
const mockUseDemoContext = vi.mocked(useDemoContext);

import DemoSocialPage from "@/app/demo/social/page";

// ── Helpers ───────────────────────────────────────────────

function makeProfile(id: string, username: string, instagram?: string | null): Profile {
  return {
    id,
    username,
    instagram: instagram ?? null,
    is_public: true,
    is_admin: false,
    community_onboarding_completed: true,
    avatar: "#FF006E",
    avatar_url: null,
    created_at: "2026-01-01T00:00:00Z",
  };
}

const DEMO_USER = makeProfile("demo-user-001", "joaquin_demo");
const SOFI = makeProfile("sofi-002", "sofi_music", "@sofimusic");
const NICO = makeProfile("nico-003", "nico_lolla");
const VALE = makeProfile("vale-004", "vale_dance", "@valedance");

// ── Tests ────────────────────────────────────────────────────

describe("DemoSocialPage — renders search input", () => {
  it("renders DemoSearchInput component", () => {
    render(<DemoSocialPage />);
    expect(screen.getByTestId("demo-search-input")).toBeInTheDocument();
  });
});

describe("DemoSocialPage — excludes demo user", () => {
  it("does NOT render a card for the demo user", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: DEMO_USER,
      allProfiles: [DEMO_USER, SOFI],
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoSocialPage />);
    const cards = screen.getAllByTestId("demo-user-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute("data-username", "sofi_music");
  });

  it("renders cards for all profiles except demo user", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: DEMO_USER,
      allProfiles: [DEMO_USER, SOFI, NICO, VALE],
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoSocialPage />);
    const cards = screen.getAllByTestId("demo-user-card");
    expect(cards).toHaveLength(3);
  });
});

describe("DemoSocialPage — search filtering", () => {
  beforeEach(() => {
    mockUseDemoContext.mockReturnValue({
      demoUser: DEMO_USER,
      allProfiles: [DEMO_USER, SOFI, NICO, VALE],
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
  });

  it("filters profiles by username (case-insensitive)", () => {
    render(<DemoSocialPage />);
    fireEvent.change(screen.getByTestId("demo-search-input"), { target: { value: "SOFI" } });
    const cards = screen.getAllByTestId("demo-user-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute("data-username", "sofi_music");
  });

  it("shows all non-demo profiles when search is cleared", () => {
    render(<DemoSocialPage />);
    fireEvent.change(screen.getByTestId("demo-search-input"), { target: { value: "sofi" } });
    fireEvent.change(screen.getByTestId("demo-search-input"), { target: { value: "" } });
    const cards = screen.getAllByTestId("demo-user-card");
    expect(cards).toHaveLength(3);
  });

  it("filters by instagram handle", () => {
    const profileWithIg = makeProfile("prof-x", "anon_user", "@valedance");
    mockUseDemoContext.mockReturnValue({
      demoUser: DEMO_USER,
      allProfiles: [DEMO_USER, SOFI, profileWithIg],
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoSocialPage />);
    fireEvent.change(screen.getByTestId("demo-search-input"), { target: { value: "valedance" } });
    const cards = screen.getAllByTestId("demo-user-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute("data-username", "anon_user");
  });

  it("shows empty state when no profiles match search", () => {
    render(<DemoSocialPage />);
    fireEvent.change(screen.getByTestId("demo-search-input"), { target: { value: "zzznomatch" } });
    expect(screen.queryAllByTestId("demo-user-card")).toHaveLength(0);
    expect(screen.getByText(/no se encontraron/i)).toBeInTheDocument();
  });
});
