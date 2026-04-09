import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

let mockPathname = "/demo/social";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import { DemoSocialTabs } from "@/app/demo/social/_components/demo-social-tabs";

// ── Tests ────────────────────────────────────────────────────

describe("DemoSocialTabs", () => {
  it("renders a tablist with aria-label", () => {
    render(<DemoSocialTabs />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Secciones sociales");
  });

  it("renders 3 tabs: Comunidad, Amigos, Grupos", () => {
    render(<DemoSocialTabs />);
    expect(screen.getByText("Comunidad")).toBeInTheDocument();
    expect(screen.getByText("Amigos")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("Comunidad tab links to /demo/social", () => {
    render(<DemoSocialTabs />);
    const comunidadLink = screen.getByText("Comunidad").closest("a");
    expect(comunidadLink).toHaveAttribute("href", "/demo/social");
  });

  it("Amigos tab links to /demo/social/amigos", () => {
    render(<DemoSocialTabs />);
    const amigosLink = screen.getByText("Amigos").closest("a");
    expect(amigosLink).toHaveAttribute("href", "/demo/social/amigos");
  });

  it("Grupos tab links to /demo/social/grupos", () => {
    render(<DemoSocialTabs />);
    const gruposLink = screen.getByText("Grupos").closest("a");
    expect(gruposLink).toHaveAttribute("href", "/demo/social/grupos");
  });

  it("Comunidad tab has aria-current=page when pathname is /demo/social", () => {
    mockPathname = "/demo/social";
    render(<DemoSocialTabs />);
    const comunidadLink = screen.getByText("Comunidad").closest("a");
    expect(comunidadLink).toHaveAttribute("aria-current", "page");
  });

  it("Comunidad tab does NOT have aria-current when pathname is /demo/social/amigos", () => {
    mockPathname = "/demo/social/amigos";
    render(<DemoSocialTabs />);
    const comunidadLink = screen.getByText("Comunidad").closest("a");
    expect(comunidadLink).not.toHaveAttribute("aria-current", "page");
  });

  it("Amigos tab has aria-current=page when pathname is /demo/social/amigos", () => {
    mockPathname = "/demo/social/amigos";
    render(<DemoSocialTabs />);
    const amigosLink = screen.getByText("Amigos").closest("a");
    expect(amigosLink).toHaveAttribute("aria-current", "page");
  });

  it("Grupos tab has aria-current=page when pathname is /demo/social/grupos/nuevo", () => {
    mockPathname = "/demo/social/grupos/nuevo";
    render(<DemoSocialTabs />);
    const gruposLink = screen.getByText("Grupos").closest("a");
    expect(gruposLink).toHaveAttribute("aria-current", "page");
  });

  it("only one tab has aria-current=page at a time (on Comunidad page)", () => {
    mockPathname = "/demo/social";
    render(<DemoSocialTabs />);
    const activeTabs = screen.getAllByRole("tab").filter(
      (tab) => tab.getAttribute("aria-current") === "page",
    );
    expect(activeTabs).toHaveLength(1);
    expect(activeTabs[0]).toHaveTextContent("Comunidad");
  });
});
