import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoBanner } from "@/app/demo/_components/demo-banner";

// ── Tests ───────────────────────────────────────────────────

describe("DemoBanner", () => {
  it("renders with role=status for accessibility", () => {
    render(<DemoBanner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the demo mode label text", () => {
    render(<DemoBanner />);
    expect(screen.getByText(/Modo Demo/i)).toBeInTheDocument();
  });

  it("renders the reset notice text", () => {
    render(<DemoBanner />);
    expect(
      screen.getByText(/se resetean al recargar/i),
    ).toBeInTheDocument();
  });

  it("has an aria-label on the status element", () => {
    render(<DemoBanner />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label");
    // aria-label must be non-empty
    expect(status.getAttribute("aria-label")!.length).toBeGreaterThan(0);
  });

  it("renders an info icon as decorative (aria-hidden)", () => {
    render(<DemoBanner />);
    const svg = document.querySelector("svg[aria-hidden='true']");
    expect(svg).not.toBeNull();
  });

  it("accepts an optional className prop without crashing", () => {
    render(<DemoBanner className="custom-class" />);
    // Still renders the status element with correct content
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Modo Demo/i)).toBeInTheDocument();
  });
});
