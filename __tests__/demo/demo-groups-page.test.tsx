import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { DemoGroupWithMeta } from "@/lib/demo/demo-types";

// ── Mocks ─────────────────────────────────────────────────

const { mockUseDemoContext } = vi.hoisted(() => ({
  mockUseDemoContext: vi.fn(),
}));

vi.mock("@/app/demo/social/grupos/_components/demo-group-card", () => ({
  DemoGroupCard: ({ group }: { group: DemoGroupWithMeta }) => (
    <div data-testid="demo-group-card" data-group-id={group.id} data-group-name={group.name} />
  ),
}));

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: mockUseDemoContext,
}));

import DemoGruposPage from "@/app/demo/social/grupos/page";

// ── Helpers ────────────────────────────────────────────────

function makeGroup(id: string, name: string, role: "admin" | "member" = "member"): DemoGroupWithMeta {
  return {
    id,
    name,
    invite_code: "CODE123",
    created_by: "demo-user-001",
    created_at: "2026-01-01T00:00:00Z",
    member_count: 3,
    my_role: role,
  };
}

// ── Tests ─────────────────────────────────────────────────

describe("DemoGruposPage — renders group cards", () => {
  it("renders a DemoGroupCard for each group", () => {
    mockUseDemoContext.mockReturnValue({
      groups: [makeGroup("group-001", "Los Pibes del Lolla"), makeGroup("group-002", "After Tyler")],
    });
    render(<DemoGruposPage />);
    const cards = screen.getAllByTestId("demo-group-card");
    expect(cards).toHaveLength(2);
  });

  it("passes correct group data to each card", () => {
    mockUseDemoContext.mockReturnValue({
      groups: [makeGroup("group-001", "Los Pibes del Lolla"), makeGroup("group-002", "After Tyler")],
    });
    render(<DemoGruposPage />);
    const cards = screen.getAllByTestId("demo-group-card");
    expect(cards[0]).toHaveAttribute("data-group-id", "group-001");
    expect(cards[1]).toHaveAttribute("data-group-id", "group-002");
  });
});

describe("DemoGruposPage — empty state", () => {
  it("renders empty state when groups is empty", () => {
    mockUseDemoContext.mockReturnValue({ groups: [] });
    render(<DemoGruposPage />);
    expect(screen.queryAllByTestId("demo-group-card")).toHaveLength(0);
    expect(screen.getByText(/no pertenecés a ningún grupo/i)).toBeInTheDocument();
  });
});

describe("DemoGruposPage — no create/join buttons", () => {
  it("does NOT render a Crear grupo button", () => {
    mockUseDemoContext.mockReturnValue({ groups: [] });
    render(<DemoGruposPage />);
    expect(screen.queryByText(/crear grupo/i)).not.toBeInTheDocument();
  });

  it("does NOT render a Unirse button", () => {
    mockUseDemoContext.mockReturnValue({ groups: [] });
    render(<DemoGruposPage />);
    expect(screen.queryByText(/unirse/i)).not.toBeInTheDocument();
  });
});
