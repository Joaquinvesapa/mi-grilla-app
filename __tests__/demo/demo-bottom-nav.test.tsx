import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoBottomNav } from "@/app/demo/_components/demo-bottom-nav";

// ── Mock next/navigation ─────────────────────────────────────

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = vi.mocked(usePathname);

// ── Tests ────────────────────────────────────────────────────

describe("DemoBottomNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/demo/grilla");
  });

  it("renders a nav element with role=navigation", () => {
    render(<DemoBottomNav />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has aria-label 'Navegación principal'", () => {
    render(<DemoBottomNav />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Navegación principal");
  });

  it("renders exactly 4 navigation tabs", () => {
    render(<DemoBottomNav />);
    // Each tab has an aria-label
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("renders tabs for Grilla, Agenda, Social, Perfil", () => {
    render(<DemoBottomNav />);
    expect(screen.getByRole("button", { name: "Grilla" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Social" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Perfil" })).toBeInTheDocument();
  });

  it("marks the active tab with aria-current=page when pathname matches /demo/grilla", () => {
    mockUsePathname.mockReturnValue("/demo/grilla");
    render(<DemoBottomNav />);
    const grillaBtn = screen.getByRole("button", { name: "Grilla" });
    expect(grillaBtn).toHaveAttribute("aria-current", "page");
  });

  it("does NOT mark inactive tabs with aria-current when on /demo/grilla", () => {
    mockUsePathname.mockReturnValue("/demo/grilla");
    render(<DemoBottomNav />);
    const agendaBtn = screen.getByRole("button", { name: "Agenda" });
    const socialBtn = screen.getByRole("button", { name: "Social" });
    const perfilBtn = screen.getByRole("button", { name: "Perfil" });
    expect(agendaBtn).not.toHaveAttribute("aria-current");
    expect(socialBtn).not.toHaveAttribute("aria-current");
    expect(perfilBtn).not.toHaveAttribute("aria-current");
  });

  it("marks Social tab active when pathname starts with /demo/social", () => {
    mockUsePathname.mockReturnValue("/demo/social/amigos");
    render(<DemoBottomNav />);
    const socialBtn = screen.getByRole("button", { name: "Social" });
    expect(socialBtn).toHaveAttribute("aria-current", "page");
  });

  it("marks Agenda tab active when pathname is /demo/agenda", () => {
    mockUsePathname.mockReturnValue("/demo/agenda");
    render(<DemoBottomNav />);
    const agendaBtn = screen.getByRole("button", { name: "Agenda" });
    expect(agendaBtn).toHaveAttribute("aria-current", "page");
  });

  it("marks Perfil tab active when pathname is /demo/perfil", () => {
    mockUsePathname.mockReturnValue("/demo/perfil");
    render(<DemoBottomNav />);
    const perfilBtn = screen.getByRole("button", { name: "Perfil" });
    expect(perfilBtn).toHaveAttribute("aria-current", "page");
  });

  it("all buttons have type=button", () => {
    render(<DemoBottomNav />);
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toHaveAttribute("type", "button");
    }
  });

  it("all SVG icons are aria-hidden", () => {
    render(<DemoBottomNav />);
    const svgs = document.querySelectorAll("svg");
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });
});
