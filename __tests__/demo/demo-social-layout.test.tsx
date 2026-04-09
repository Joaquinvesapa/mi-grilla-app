import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ────────────────────────────────────────────────────

vi.mock("@/app/demo/social/_components/demo-social-tabs", () => ({
  DemoSocialTabs: () => <div data-testid="demo-social-tabs" />,
}));

import DemoSocialLayout from "@/app/demo/social/layout";

// ── Tests ────────────────────────────────────────────────────

describe("DemoSocialLayout", () => {
  it("renders the SOCIAL heading", () => {
    render(<DemoSocialLayout><span /></DemoSocialLayout>);
    expect(screen.getByRole("heading", { name: /social/i })).toBeInTheDocument();
  });

  it("heading text is uppercase SOCIAL", () => {
    render(<DemoSocialLayout><span /></DemoSocialLayout>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("SOCIAL");
  });

  it("renders DemoSocialTabs component", () => {
    render(<DemoSocialLayout><span /></DemoSocialLayout>);
    expect(screen.getByTestId("demo-social-tabs")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <DemoSocialLayout>
        <span data-testid="child-content">contenido</span>
      </DemoSocialLayout>,
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("heading has font-display class (uppercase display font)", () => {
    render(<DemoSocialLayout><span /></DemoSocialLayout>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("font-display");
  });
});
