import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ────────────────────────────────────────────────────
// Mock all sub-components so the test focuses on DemoLayout composition.
// Each mock renders a test-id sentinel so we can assert presence.

vi.mock("@/lib/demo/demo-context", () => ({
  DemoProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="demo-provider">{children}</div>
  ),
}));

vi.mock("@/components/dark-mode-toggle", () => ({
  DarkModeToggle: () => <div data-testid="dark-mode-toggle" />,
}));

vi.mock("@/app/demo/_components/demo-banner", () => ({
  DemoBanner: () => <div data-testid="demo-banner" />,
}));

vi.mock("@/app/demo/_components/demo-live-now-menu", () => ({
  DemoLiveNowMenu: () => <div data-testid="demo-live-now-menu" />,
}));

vi.mock("@/app/demo/_components/demo-bottom-nav", () => ({
  DemoBottomNav: () => <div data-testid="demo-bottom-nav" />,
}));

import DemoLayout from "@/app/demo/layout";

// ── Tests ────────────────────────────────────────────────────

describe("DemoLayout", () => {
  it("renders DemoProvider wrapping all content", () => {
    render(<DemoLayout>test</DemoLayout>);
    expect(screen.getByTestId("demo-provider")).toBeInTheDocument();
  });

  it("renders DarkModeToggle inside DemoProvider", () => {
    render(<DemoLayout>test</DemoLayout>);
    const provider = screen.getByTestId("demo-provider");
    const toggle = screen.getByTestId("dark-mode-toggle");
    expect(provider).toContainElement(toggle);
  });

  it("renders DemoBanner inside DemoProvider", () => {
    render(<DemoLayout>test</DemoLayout>);
    const provider = screen.getByTestId("demo-provider");
    const banner = screen.getByTestId("demo-banner");
    expect(provider).toContainElement(banner);
  });

  it("renders DemoLiveNowMenu inside DemoProvider", () => {
    render(<DemoLayout>test</DemoLayout>);
    const provider = screen.getByTestId("demo-provider");
    const liveMenu = screen.getByTestId("demo-live-now-menu");
    expect(provider).toContainElement(liveMenu);
  });

  it("renders DemoBottomNav inside DemoProvider", () => {
    render(<DemoLayout>test</DemoLayout>);
    const provider = screen.getByTestId("demo-provider");
    const nav = screen.getByTestId("demo-bottom-nav");
    expect(provider).toContainElement(nav);
  });

  it("renders children inside a main element", () => {
    render(<DemoLayout><span data-testid="child-content">hijo</span></DemoLayout>);
    const main = document.querySelector("main");
    expect(main).not.toBeNull();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("main element has min-h-screen class", () => {
    render(<DemoLayout>test</DemoLayout>);
    const main = document.querySelector("main");
    expect(main?.className).toContain("min-h-screen");
  });

  it("main element has bottom padding inline style for safe-area", () => {
    render(<DemoLayout>test</DemoLayout>);
    const main = document.querySelector("main");
    expect(main?.style.paddingBottom).toBe(
      "calc(4rem + var(--safe-area-bottom))",
    );
  });

  it("children content is accessible (inside main, inside DemoProvider)", () => {
    render(
      <DemoLayout>
        <p data-testid="nested-child">contenido de la app</p>
      </DemoLayout>,
    );
    const main = document.querySelector("main");
    const child = screen.getByTestId("nested-child");
    expect(main).toContainElement(child);
  });
});
