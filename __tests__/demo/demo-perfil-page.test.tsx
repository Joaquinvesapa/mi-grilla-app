// ── Demo Perfil Page Tests ──────────────────────────────────
// Integration tests for app/demo/perfil/page.tsx

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Profile } from "@/lib/profile-types"

// ── Mock next/link ──────────────────────────────────────────
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

// ── Mock next/image (Avatar uses it) ───────────────────────
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => <img src={src} alt={alt} {...props} />,
}))

// ── Mock useDemoContext ─────────────────────────────────────
const mockDemoUser: Profile = {
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

const mockContextValue = {
  demoUser: mockDemoUser,
  days: [],
  eventName: "Lollapalooza Argentina",
  liveStages: [],
  demoCurrentMin: 1110,
  demoDayLabel: "Viernes",
  attendance: new Set<string>(),
  toggleAttendance: vi.fn(),
  allProfiles: [],
  friendships: [],
  groups: [],
  groupDetails: {},
  friendAttendance: {},
  sendFriendRequest: vi.fn(),
  acceptFriendRequest: vi.fn(),
  rejectFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
  getFriendAttendance: vi.fn(),
}

const mockUseDemoContext = vi.fn(() => mockContextValue)

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => mockUseDemoContext(),
}))

// ── Import component (after mocks) ─────────────────────────
import DemoPerfilPage from "@/app/demo/perfil/page"

// ── Tests ───────────────────────────────────────────────────

describe("DemoPerfilPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore the default mock return value after any per-test overrides
    mockUseDemoContext.mockReturnValue(mockContextValue)
  })

  // ── Avatar ──────────────────────────────────────────────

  it("renders the avatar with demo user's username initial", () => {
    render(<DemoPerfilPage />)
    // Avatar renders the first char of username when no src
    const avatar = screen.getByText("j")
    expect(avatar).toBeInTheDocument()
  })

  // ── Username ─────────────────────────────────────────────

  it("renders @joaquin_demo as heading", () => {
    render(<DemoPerfilPage />)
    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toHaveTextContent("@joaquin_demo")
  })

  it("heading uses font-display class (UPPERCASE visual style)", () => {
    render(<DemoPerfilPage />)
    const heading = screen.getByRole("heading", { level: 1 })
    // Verify the font-display class is applied (visual convention)
    expect(heading.className).toMatch(/font-display/)
  })

  // ── Instagram link ────────────────────────────────────────

  it("renders instagram handle as a link", () => {
    render(<DemoPerfilPage />)
    const igLink = screen.getByRole("link", { name: /@joaquinvesapa/i })
    expect(igLink).toBeInTheDocument()
  })

  it("instagram link points to instagram.com profile", () => {
    render(<DemoPerfilPage />)
    const igLink = screen.getByRole("link", { name: /@joaquinvesapa/i })
    expect(igLink).toHaveAttribute(
      "href",
      "https://instagram.com/@joaquinvesapa",
    )
  })

  it("instagram link opens in a new tab", () => {
    render(<DemoPerfilPage />)
    const igLink = screen.getByRole("link", { name: /@joaquinvesapa/i })
    expect(igLink).toHaveAttribute("target", "_blank")
  })

  // ── Community toggle ──────────────────────────────────────

  it("renders the 'Aparecer en Comunidad' toggle", () => {
    render(<DemoPerfilPage />)
    const toggle = screen.getByRole("switch", {
      name: /aparecer en comunidad/i,
    })
    expect(toggle).toBeInTheDocument()
  })

  it("toggle is initially unchecked (visual-only, does not persist)", () => {
    render(<DemoPerfilPage />)
    const toggle = screen.getByRole("switch", {
      name: /aparecer en comunidad/i,
    })
    expect(toggle).toHaveAttribute("aria-checked", "false")
  })

  it("clicking toggle changes its checked state", () => {
    render(<DemoPerfilPage />)
    const toggle = screen.getByRole("switch", {
      name: /aparecer en comunidad/i,
    })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-checked", "true")
  })

  it("clicking toggle twice reverts to unchecked", () => {
    render(<DemoPerfilPage />)
    const toggle = screen.getByRole("switch", {
      name: /aparecer en comunidad/i,
    })
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-checked", "false")
  })

  // ── Quick links ───────────────────────────────────────────

  it("renders 'Mi Agenda' link pointing to /demo/agenda", () => {
    render(<DemoPerfilPage />)
    const agendaLink = screen.getByRole("link", { name: /mi agenda/i })
    expect(agendaLink).toHaveAttribute("href", "/demo/agenda")
  })

  it("renders 'Mis Grupos' link pointing to /demo/social/grupos", () => {
    render(<DemoPerfilPage />)
    const gruposLink = screen.getByRole("link", { name: /mis grupos/i })
    expect(gruposLink).toHaveAttribute("href", "/demo/social/grupos")
  })

  // ── No real sign-out ──────────────────────────────────────

  it("does NOT render a form action pointing to signOut", () => {
    render(<DemoPerfilPage />)
    // There should be no sign-out server action form
    const forms = document.querySelectorAll("form")
    expect(forms).toHaveLength(0)
  })

  // ── No /login links ───────────────────────────────────────

  it("does NOT have any link pointing to /login", () => {
    render(<DemoPerfilPage />)
    const loginLinks = screen
      .queryAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/login")
    expect(loginLinks).toHaveLength(0)
  })

  // ── All /demo links ───────────────────────────────────────

  it("all internal links use /demo/ prefix", () => {
    render(<DemoPerfilPage />)
    const internalLinks = screen
      .queryAllByRole("link")
      .filter(
        (el) =>
          el.getAttribute("href")?.startsWith("/") &&
          !el.getAttribute("href")?.startsWith("http"),
      )
    internalLinks.forEach((link) => {
      const href = link.getAttribute("href") ?? ""
      expect(href).toMatch(/^\/demo/)
    })
  })

  // ── No instagram when null ────────────────────────────────

  it("hides instagram link when demoUser.instagram is null", () => {
    // Override the module mock to return a user with no instagram
    const contextWithoutIg = {
      ...mockContextValue,
      demoUser: { ...mockDemoUser, instagram: null },
    }
    // Patch the mock factory for this one render
    mockUseDemoContext.mockReturnValueOnce(contextWithoutIg)

    render(<DemoPerfilPage />)
    // Should not find any link with @ in its text (ig link is gone)
    const igLinks = screen
      .queryAllByRole("link")
      .filter((el) => el.textContent?.includes("@joaquinvesapa"))
    expect(igLinks).toHaveLength(0)
  })
})
