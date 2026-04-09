import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import DemoAmigosPage from "@/app/demo/social/amigos/page"
import type { Profile } from "@/lib/profile-types"
import type { DemoFriendship } from "@/lib/demo/demo-types"

// ── Mocks ───────────────────────────────────────────────────

const mockAcceptFriendRequest = vi.fn()
const mockRejectFriendRequest = vi.fn()
const mockRemoveFriend = vi.fn()

const DEMO_USER_ID = "demo-user-001"

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

const DEMO_USER: Profile = {
  id: DEMO_USER_ID,
  username: "joaquin_demo",
  instagram: "@joaquinvesapa",
  is_public: true,
  is_admin: false,
  community_onboarding_completed: true,
  avatar: "#3A86FF",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00Z",
}

const acceptedFriendship: DemoFriendship = {
  id: "fs-001",
  requester_id: DEMO_USER_ID,
  addressee_id: "sofi-music-002",
  status: "accepted",
  created_at: "2026-01-15T00:00:00Z",
}

const pendingFriendship: DemoFriendship = {
  id: "fs-007",
  requester_id: "vale-dance-008",
  addressee_id: DEMO_USER_ID,
  status: "pending",
  created_at: "2026-02-01T00:00:00Z",
}

// ── Context Factory ─────────────────────────────────────────

let mockFriendships: DemoFriendship[] = [acceptedFriendship, pendingFriendship]

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => ({
    demoUser: DEMO_USER,
    allProfiles: [DEMO_USER, SOFI, VALE],
    friendships: mockFriendships,
    removeFriend: mockRemoveFriend,
    acceptFriendRequest: mockAcceptFriendRequest,
    rejectFriendRequest: mockRejectFriendRequest,
  }),
}))

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// ── Tests ───────────────────────────────────────────────────

describe("DemoAmigosPage — with friends and pending requests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFriendships = [acceptedFriendship, pendingFriendship]
  })

  it("renders Solicitudes pendientes section header when there are pending requests", () => {
    render(<DemoAmigosPage />)
    expect(screen.getByText("Solicitudes pendientes")).toBeInTheDocument()
  })

  it("renders a DemoRequestCard for the pending request (shows requester username)", () => {
    render(<DemoAmigosPage />)
    expect(screen.getByText("@vale_dance")).toBeInTheDocument()
  })

  it("renders Mis amigos section header", () => {
    render(<DemoAmigosPage />)
    expect(screen.getByText(/Mis amigos/i)).toBeInTheDocument()
  })

  it("renders a DemoFriendCard for the accepted friend (shows friend username)", () => {
    render(<DemoAmigosPage />)
    expect(screen.getByText("@sofi_music")).toBeInTheDocument()
  })

  it("only pending friendships where addressee is demo user are shown as requests", () => {
    render(<DemoAmigosPage />)
    const aceptarBtn = screen.getByRole("button", {
      name: "Aceptar solicitud de vale_dance",
    })
    expect(aceptarBtn).toBeInTheDocument()
  })

  it("accepted friends count is shown in Mis amigos section header", () => {
    render(<DemoAmigosPage />)
    expect(screen.getByText(/Mis amigos.*\(1\)/)).toBeInTheDocument()
  })

  it("pending count badge shows 1 for one pending request", () => {
    render(<DemoAmigosPage />)
    // Badge showing number of pending requests
    expect(screen.getByText("1")).toBeInTheDocument()
  })
})

describe("DemoAmigosPage — empty state", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFriendships = []
  })

  it("does not render Solicitudes pendientes section when no pending requests", () => {
    render(<DemoAmigosPage />)
    expect(screen.queryByText("Solicitudes pendientes")).not.toBeInTheDocument()
  })

  it("shows empty state message when no accepted friends", () => {
    render(<DemoAmigosPage />)
    expect(
      screen.getByText(/Todavía no tenés amigos/i),
    ).toBeInTheDocument()
  })
})
