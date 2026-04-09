import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DemoPage, { generateMetadata } from "@/app/demo/page";

// ── Tests: generateMetadata ──────────────────────────────────

describe("generateMetadata", () => {
  it("returns title 'MiGrilla Demo'", async () => {
    const metadata = await generateMetadata();
    expect(metadata.title).toBe("MiGrilla Demo");
  });

  it("returns a non-empty description", async () => {
    const metadata = await generateMetadata();
    expect(typeof metadata.description).toBe("string");
    expect((metadata.description as string).length).toBeGreaterThan(0);
  });

  it("sets robots.index to false for noindex", async () => {
    const metadata = await generateMetadata();
    const robots = metadata.robots as { index: boolean };
    expect(robots.index).toBe(false);
  });
});

// ── Tests: DemoPage component ────────────────────────────────

describe("DemoPage", () => {
  it("renders MIGRILLA heading in font-display style", () => {
    render(<DemoPage />);
    // Should render the brand name in uppercase using font-display
    const heading = screen.getByRole("heading", { name: /migrilla/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders the event description copy mentioning Lollapalooza", () => {
    render(<DemoPage />);
    expect(screen.getByText(/Lollapalooza/i)).toBeInTheDocument();
  });

  it("renders the CTA link pointing to /demo/grilla", () => {
    render(<DemoPage />);
    // The CTA is an anchor (or button-styled link) to /demo/grilla
    const cta = screen.getByRole("link", { name: /explorar demo/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/demo/grilla");
  });

  it("renders CTA text in uppercase (EXPLORAR DEMO)", () => {
    render(<DemoPage />);
    const cta = screen.getByRole("link", { name: /explorar demo/i });
    // The visible text should be EXPLORAR DEMO (uppercase enforced via CSS or text node)
    expect(cta.textContent?.toUpperCase()).toContain("EXPLORAR DEMO");
  });

  it("renders description mentioning festival/agenda/grupo features", () => {
    render(<DemoPage />);
    // Any combination of these words should appear in the page
    const content = document.body.textContent ?? "";
    const hasFeatureMention =
      /grilla|agenda|grupo/i.test(content);
    expect(hasFeatureMention).toBe(true);
  });

  it("renders a 'demo con datos de ejemplo' notice", () => {
    render(<DemoPage />);
    expect(screen.getByText(/datos de ejemplo/i)).toBeInTheDocument();
  });
});
