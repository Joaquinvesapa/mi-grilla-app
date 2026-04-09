import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { Suspense } from "react"
import DemoAmigosComparePage from "@/app/demo/social/amigos/[friendId]/page"
import type { Profile } from "@/lib/profile-types"
import type { GridDay } from "@/lib/schedule-types"

// ── Mocks ───────────────────────────────────────────────────

const DEMO_USER: Profile = {
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

const mockDay: GridDay = {
  label: "Viernes",
  stages: [],
  artists: [],
  bounds: { startMin: 720, endMin: 1440, totalMinutes: 720 },
}

const mockGetFriendAttendance = vi.fn(() => ["Viernes-Lorde"])

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => ({
    demoUser: DEMO_USER,
    allProfiles: [DEMO_USER, SOFI],
    attendance: new Set(["Viernes-DJO", "Viernes-Lorde"]),
    days: [mockDay],
    getFriendAttendance: mockGetFriendAttendance,
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

// ── Mock CompareView to isolate page logic ───────────────────

vi.mock(
  "@/app/(app)/social/amigos/[friendId]/_components/compare-view",
  () => ({
    CompareView: ({
      friendProfile,
      myAttendance,
      friendAttendance,
    }: {
      friendProfile: Profile
      myAttendance: string[]
      friendAttendance: string[]
      days: GridDay[]
    }) => (
      <div data-testid="compare-view">
        <span data-testid="friend-username">{friendProfile.username}</span>
        <span data-testid="my-attendance-count">{myAttendance.length}</span>
        <span data-testid="friend-attendance-count">
          {friendAttendance.length}
        </span>
      </div>
    ),
  }),
)

// ── Tests ───────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────

function renderWithSuspense(friendId: string) {
  return act(() => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <DemoAmigosComparePage params={Promise.resolve({ friendId })} />
      </Suspense>
    )
  })
}

// ── Tests ────────────────────────────────────────────────────

describe("DemoAmigosComparePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the page heading with friend username", async () => {
    await renderWithSuspense("sofi-music-002")
    expect(
      screen.getByRole("heading", { name: /sofi_music/i }),
    ).toBeInTheDocument()
  })

  it("renders back link to /demo/social/amigos", async () => {
    await renderWithSuspense("sofi-music-002")
    const backLink = screen.getByRole("link", { name: /volver/i })
    expect(backLink).toHaveAttribute("href", "/demo/social/amigos")
  })

  it("renders CompareView with correct friendProfile", async () => {
    await renderWithSuspense("sofi-music-002")
    expect(screen.getByTestId("compare-view")).toBeInTheDocument()
    expect(screen.getByTestId("friend-username")).toHaveTextContent("sofi_music")
  })

  it("passes demo user attendance (Set converted to array) to CompareView", async () => {
    await renderWithSuspense("sofi-music-002")
    // Demo user has 2 items in attendance Set
    expect(screen.getByTestId("my-attendance-count")).toHaveTextContent("2")
  })

  it("calls getFriendAttendance with the friendId", async () => {
    await renderWithSuspense("sofi-music-002")
    expect(mockGetFriendAttendance).toHaveBeenCalledWith("sofi-music-002")
  })

  it("passes friend attendance from getFriendAttendance to CompareView", async () => {
    await renderWithSuspense("sofi-music-002")
    expect(screen.getByTestId("friend-attendance-count")).toHaveTextContent("1")
  })

  it("shows not-found message when friendId does not exist in allProfiles", async () => {
    await renderWithSuspense("unknown-user-999")
    expect(screen.getByText(/no encontrado/i)).toBeInTheDocument()
  })
})
