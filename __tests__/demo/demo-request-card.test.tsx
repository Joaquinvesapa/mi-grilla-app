import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { DemoRequestCard } from "@/app/demo/social/amigos/_components/demo-request-card"
import type { Profile } from "@/lib/profile-types"

// ── Mocks ───────────────────────────────────────────────────

const mockAcceptFriendRequest = vi.fn()
const mockRejectFriendRequest = vi.fn()

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => ({
    acceptFriendRequest: mockAcceptFriendRequest,
    rejectFriendRequest: mockRejectFriendRequest,
  }),
}))

// ── Fixtures ────────────────────────────────────────────────

const valeProfile: Profile = {
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

const fedeProfile: Profile = {
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

// ── Tests ───────────────────────────────────────────────────

describe("DemoRequestCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the requester's username with @", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    expect(screen.getByText("@vale_dance")).toBeInTheDocument()
  })

  it("renders the requester's instagram when present", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    expect(screen.getByText("ig: @valedance")).toBeInTheDocument()
  })

  it("does not render instagram when null", () => {
    render(
      <DemoRequestCard friendshipId="fs-008" profile={fedeProfile} />,
    )
    expect(screen.queryByText(/ig:/)).not.toBeInTheDocument()
  })

  it("renders Aceptar button with aria-label", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    const btn = screen.getByRole("button", { name: "Aceptar solicitud de vale_dance" })
    expect(btn).toBeInTheDocument()
  })

  it("renders Rechazar button with aria-label", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    const btn = screen.getByRole("button", { name: "Rechazar solicitud de vale_dance" })
    expect(btn).toBeInTheDocument()
  })

  it("calls acceptFriendRequest with the friendshipId when Aceptar is clicked", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar solicitud de vale_dance" }),
    )
    expect(mockAcceptFriendRequest).toHaveBeenCalledWith("fs-007")
  })

  it("calls rejectFriendRequest with the friendshipId when Rechazar is clicked", () => {
    render(
      <DemoRequestCard friendshipId="fs-008" profile={fedeProfile} />,
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Rechazar solicitud de fede_bass" }),
    )
    expect(mockRejectFriendRequest).toHaveBeenCalledWith("fs-008")
  })

  it("Aceptar and Rechazar buttons have type=button", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("type", "button")
    })
  })

  it("renders avatar initial from username", () => {
    render(
      <DemoRequestCard friendshipId="fs-007" profile={valeProfile} />,
    )
    expect(screen.getByText("v")).toBeInTheDocument()
  })
})
