import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { DemoGroupDetail } from "@/lib/demo/demo-types";

// ── Mocks ─────────────────────────────────────────────────

const mockWriteText = vi.fn(() => Promise.resolve());
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  configurable: true,
});

import { DemoGroupHeader } from "@/app/demo/social/grupos/[groupId]/_components/demo-group-header";

// ── Helpers ────────────────────────────────────────────────

function makeGroupDetail(overrides: Partial<DemoGroupDetail> = {}): DemoGroupDetail {
  return {
    id: "group-001",
    name: "Los Pibes del Lolla",
    invite_code: "LOLLA2025",
    created_by: "demo-user-001",
    created_at: "2026-01-01T00:00:00Z",
    members: [],
    my_role: "admin",
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────

describe("DemoGroupHeader — group name", () => {
  it("renders the group name", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ name: "Los Pibes del Lolla" })} />);
    expect(screen.getByText("Los Pibes del Lolla")).toBeInTheDocument();
  });

  it("renders a different group name correctly", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ name: "After Tyler" })} />);
    expect(screen.getByText("After Tyler")).toBeInTheDocument();
  });
});

describe("DemoGroupHeader — invite code", () => {
  it("renders the invite code", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ invite_code: "LOLLA2025" })} />);
    expect(screen.getByText("LOLLA2025")).toBeInTheDocument();
  });

  it("renders a different invite code correctly", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ invite_code: "TYLER25" })} />);
    expect(screen.getByText("TYLER25")).toBeInTheDocument();
  });
});

describe("DemoGroupHeader — member count", () => {
  it("shows member count based on members array", () => {
    const group = makeGroupDetail({
      invite_code: "XCODE99",
      members: [
        { group_id: "g1", user_id: "u1", role: "admin", profile: { id: "u1", username: "user1", instagram: null, is_public: true, is_admin: false, community_onboarding_completed: true, avatar: "#000", avatar_url: null, created_at: "" } },
        { group_id: "g1", user_id: "u2", role: "member", profile: { id: "u2", username: "user2", instagram: null, is_public: true, is_admin: false, community_onboarding_completed: true, avatar: "#000", avatar_url: null, created_at: "" } },
      ],
    });
    render(<DemoGroupHeader group={group} />);
    expect(screen.getByText(/2 miembros/)).toBeInTheDocument();
  });
});

describe("DemoGroupHeader — copy button", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
  });

  it("renders copy button with aria-label", () => {
    render(<DemoGroupHeader group={makeGroupDetail()} />);
    const copyBtn = screen.getByRole("button", { name: /copiar/i });
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn).toHaveAttribute("aria-label");
  });

  it("copies invite code to clipboard when copy button clicked", async () => {
    render(<DemoGroupHeader group={makeGroupDetail({ invite_code: "LOLLA2025" })} />);
    const copyBtn = screen.getByRole("button", { name: /copiar/i });
    fireEvent.click(copyBtn);
    expect(mockWriteText).toHaveBeenCalledWith("LOLLA2025");
  });

  it("shows 'Copiado' feedback in the copy button after clicking", async () => {
    render(<DemoGroupHeader group={makeGroupDetail({ invite_code: "LOLLA2025" })} />);
    const copyBtn = screen.getByRole("button", { name: /copiar/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    // After click, both the code display and the button show "Copiado ✓"
    const copiados = screen.getAllByText(/copiado/i);
    expect(copiados.length).toBeGreaterThanOrEqual(1);
  });
});

describe("DemoGroupHeader — role badge", () => {
  it("shows Admin badge when my_role is admin", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ my_role: "admin" })} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows Miembro badge when my_role is member", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ my_role: "member" })} />);
    expect(screen.getByText("Miembro")).toBeInTheDocument();
  });
});

describe("DemoGroupHeader — no destructive actions", () => {
  it("does NOT render a rename button", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ my_role: "admin" })} />);
    expect(screen.queryByLabelText(/renombrar/i)).not.toBeInTheDocument();
  });

  it("does NOT render an Eliminar grupo button", () => {
    render(<DemoGroupHeader group={makeGroupDetail({ my_role: "admin" })} />);
    expect(screen.queryByText(/eliminar grupo/i)).not.toBeInTheDocument();
  });
});
