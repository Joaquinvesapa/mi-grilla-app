import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Profile } from "@/lib/profile-types";
import type { DemoFriendship } from "@/lib/demo/demo-types";
import { FRIENDSHIP_RELATION } from "@/lib/friendship-types";

// ── Mocks ────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/components/avatar", () => ({
  Avatar: ({ username }: { username: string }) => (
    <div data-testid="avatar" data-username={username} />
  ),
  AVATAR_SIZE: { LG: "lg" },
}));

const mockSendFriendRequest = vi.fn();
vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: vi.fn(() => ({
    demoUser: { id: "demo-user-001", username: "joaquin_demo" },
    friendships: [] as DemoFriendship[],
    sendFriendRequest: mockSendFriendRequest,
  })),
}));

import { useDemoContext } from "@/lib/demo/demo-context";
const mockUseDemoContext = vi.mocked(useDemoContext);

import { DemoUserCard } from "@/app/demo/social/_components/demo-user-card";

// ── Helpers ───────────────────────────────────────────────

const DEMO_USER_ID = "demo-user-001";

function makeProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: "other-user-002",
    username: "otro_usuario",
    instagram: null,
    is_public: true,
    is_admin: false,
    community_onboarding_completed: true,
    avatar: "#FF006E",
    avatar_url: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeFriendship(overrides?: Partial<DemoFriendship>): DemoFriendship {
  return {
    id: "fs-001",
    requester_id: DEMO_USER_ID,
    addressee_id: "other-user-002",
    status: "pending",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe("DemoUserCard — rendering", () => {
  it("renders the user's avatar", () => {
    render(<DemoUserCard profile={makeProfile()} />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("renders the username with @ prefix", () => {
    render(<DemoUserCard profile={makeProfile({ username: "sofi_music" })} />);
    expect(screen.getByText("@sofi_music")).toBeInTheDocument();
  });

  it("renders instagram handle when present", () => {
    render(<DemoUserCard profile={makeProfile({ instagram: "@sofimusic" })} />);
    expect(screen.getByText(/sofimusic/)).toBeInTheDocument();
  });

  it("does NOT render instagram link when instagram is null", () => {
    render(<DemoUserCard profile={makeProfile({ instagram: null })} />);
    expect(screen.queryByText(/instagram/i)).not.toBeInTheDocument();
  });
});

describe("DemoUserCard — friend status NONE", () => {
  it("shows 'Agregar amigo' button when relation is NONE", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile()} />);
    expect(screen.getByRole("button", { name: /agregar/i })).toBeInTheDocument();
  });

  it("calls sendFriendRequest with profile.id when agregar button is clicked", () => {
    mockSendFriendRequest.mockReset();
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile({ id: "other-user-002" })} />);
    fireEvent.click(screen.getByRole("button", { name: /agregar/i }));
    expect(mockSendFriendRequest).toHaveBeenCalledWith("other-user-002");
  });

  it("shows 'Solicitud enviada' after sending friend request", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile()} />);
    fireEvent.click(screen.getByRole("button", { name: /agregar/i }));
    expect(screen.getByText(/solicitud enviada/i)).toBeInTheDocument();
  });
});

describe("DemoUserCard — friend status PENDING_SENT", () => {
  it("shows 'Pendiente' badge when demo user sent request", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [makeFriendship({ requester_id: DEMO_USER_ID, addressee_id: "other-user-002", status: "pending" })],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile({ id: "other-user-002" })} />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });
});

describe("DemoUserCard — friend status ACCEPTED", () => {
  it("shows 'Amigos' badge when friendship is accepted", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [makeFriendship({ requester_id: DEMO_USER_ID, addressee_id: "other-user-002", status: "accepted" })],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile({ id: "other-user-002" })} />);
    expect(screen.getByText("Amigos")).toBeInTheDocument();
  });

  it("Amigos badge is a link to /demo/social/amigos/{profileId}", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [makeFriendship({ requester_id: DEMO_USER_ID, addressee_id: "other-user-002", status: "accepted" })],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile({ id: "other-user-002" })} />);
    const link = screen.getByText("Amigos").closest("a");
    expect(link).toHaveAttribute("href", "/demo/social/amigos/other-user-002");
  });
});

describe("DemoUserCard — aria-label on action button", () => {
  it("agregar button has aria-label", () => {
    mockUseDemoContext.mockReturnValue({
      demoUser: { id: DEMO_USER_ID } as Profile,
      friendships: [],
      sendFriendRequest: mockSendFriendRequest,
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoUserCard profile={makeProfile({ username: "sofi_music" })} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label");
  });
});
