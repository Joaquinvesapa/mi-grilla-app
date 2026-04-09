import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { DemoGroupWithMeta } from "@/lib/demo/demo-types";

// ── Mocks ─────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    "aria-label": ariaLabel,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    "aria-label"?: string;
    className?: string;
  }) => (
    <a href={href} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  ),
}));

import { DemoGroupCard } from "@/app/demo/social/grupos/_components/demo-group-card";

// ── Helpers ────────────────────────────────────────────────

function makeGroup(overrides: Partial<DemoGroupWithMeta> = {}): DemoGroupWithMeta {
  return {
    id: "group-001",
    name: "Los Pibes del Lolla",
    invite_code: "LOLLA2025",
    created_by: "demo-user-001",
    created_at: "2026-01-01T00:00:00Z",
    member_count: 4,
    my_role: "admin",
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────

describe("DemoGroupCard — renders group name", () => {
  it("renders the group name", () => {
    render(<DemoGroupCard group={makeGroup({ name: "Los Pibes del Lolla" })} />);
    expect(screen.getByText("Los Pibes del Lolla")).toBeInTheDocument();
  });

  it("renders a different group name correctly", () => {
    render(<DemoGroupCard group={makeGroup({ name: "After Tyler" })} />);
    expect(screen.getByText("After Tyler")).toBeInTheDocument();
  });
});

describe("DemoGroupCard — member count", () => {
  it("renders member count in singular", () => {
    render(<DemoGroupCard group={makeGroup({ member_count: 1 })} />);
    expect(screen.getByText(/1 miembro/)).toBeInTheDocument();
  });

  it("renders member count in plural", () => {
    render(<DemoGroupCard group={makeGroup({ member_count: 4 })} />);
    expect(screen.getByText(/4 miembros/)).toBeInTheDocument();
  });
});

describe("DemoGroupCard — role badge", () => {
  it("shows 'Admin' badge when user is admin", () => {
    render(<DemoGroupCard group={makeGroup({ my_role: "admin" })} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows 'Miembro' badge when user is member", () => {
    render(<DemoGroupCard group={makeGroup({ my_role: "member" })} />);
    expect(screen.getByText("Miembro")).toBeInTheDocument();
  });
});

describe("DemoGroupCard — link", () => {
  it("links to the demo group detail page", () => {
    render(<DemoGroupCard group={makeGroup({ id: "group-001" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/demo/social/grupos/group-001");
  });

  it("links to a different group id correctly", () => {
    render(<DemoGroupCard group={makeGroup({ id: "group-002" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/demo/social/grupos/group-002");
  });

  it("has an aria-label on the link", () => {
    render(<DemoGroupCard group={makeGroup({ name: "Los Pibes del Lolla" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label");
    expect(link.getAttribute("aria-label")).toContain("Los Pibes del Lolla");
  });
});

describe("DemoGroupCard — no destructive actions", () => {
  it("does NOT render a delete button", () => {
    render(<DemoGroupCard group={makeGroup({ my_role: "admin" })} />);
    expect(screen.queryByText(/eliminar/i)).not.toBeInTheDocument();
  });

  it("does NOT render a leave button", () => {
    render(<DemoGroupCard group={makeGroup({ my_role: "member" })} />);
    expect(screen.queryByText(/salir/i)).not.toBeInTheDocument();
  });
});
