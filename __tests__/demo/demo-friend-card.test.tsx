import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { DemoFriendCard } from "@/app/demo/social/amigos/_components/demo-friend-card"
import type { Profile } from "@/lib/profile-types"

// ── Mocks ───────────────────────────────────────────────────

const mockRemoveFriend = vi.fn()

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => ({
    removeFriend: mockRemoveFriend,
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

// ── Fixtures ────────────────────────────────────────────────

const sofiProfile: Profile = {
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

const nicoProfile: Profile = {
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

// ── Tests ───────────────────────────────────────────────────

describe("DemoFriendCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the friend's username with @", () => {
    render(<DemoFriendCard friendId="sofi-music-002" profile={sofiProfile} />)
    expect(screen.getByText("@sofi_music")).toBeInTheDocument()
  })

  it("renders the friend's instagram when present", () => {
    render(<DemoFriendCard friendId="sofi-music-002" profile={sofiProfile} />)
    expect(screen.getByText("ig: @sofimusic")).toBeInTheDocument()
  })

  it("does not render instagram when null", () => {
    render(<DemoFriendCard friendId="nico-lolla-003" profile={nicoProfile} />)
    expect(screen.queryByText(/ig:/)).not.toBeInTheDocument()
  })

  it("renders compare link to /demo/social/amigos/{friendId}", () => {
    render(<DemoFriendCard friendId="sofi-music-002" profile={sofiProfile} />)
    const link = screen.getByRole("link", { name: /comparar/i })
    expect(link).toHaveAttribute("href", "/demo/social/amigos/sofi-music-002")
  })

  it("renders Eliminar button with aria-label", () => {
    render(<DemoFriendCard friendId="sofi-music-002" profile={sofiProfile} />)
    const btn = screen.getByRole("button", { name: "Eliminar a sofi_music" })
    expect(btn).toBeInTheDocument()
  })

  it("calls removeFriend with the friendshipId when Eliminar is clicked", () => {
    render(
      <DemoFriendCard
        friendId="sofi-music-002"
        profile={sofiProfile}
        friendshipId="fs-001"
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Eliminar a sofi_music" }))
    expect(mockRemoveFriend).toHaveBeenCalledWith("fs-001")
  })

  it("Eliminar button has type=button", () => {
    render(<DemoFriendCard friendId="sofi-music-002" profile={sofiProfile} />)
    const btn = screen.getByRole("button", { name: "Eliminar a sofi_music" })
    expect(btn).toHaveAttribute("type", "button")
  })

  it("renders avatar initial from username", () => {
    render(<DemoFriendCard friendId="sofi-music-002" profile={sofiProfile} />)
    // Avatar renders first char of username
    expect(screen.getByText("s")).toBeInTheDocument()
  })
})
