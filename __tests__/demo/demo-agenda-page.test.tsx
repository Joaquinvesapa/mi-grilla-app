import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ────────────────────────────────────────────────────

// Mock DemoContext so the page can render without a real provider
vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: vi.fn(() => ({
    days: [],
    attendance: new Set<string>(),
    toggleAttendance: vi.fn(),
  })),
}));

// Mock DemoAgendaView so we focus on page-level behavior
vi.mock("@/app/demo/agenda/_components/demo-agenda-view", () => ({
  DemoAgendaView: ({ days }: { days: unknown[] }) => (
    <div data-testid="demo-agenda-view" data-days={days.length} />
  ),
}));

import { useDemoContext } from "@/lib/demo/demo-context";
const mockUseDemoContext = vi.mocked(useDemoContext);

import DemoAgendaPage from "@/app/demo/agenda/page";

// ── Tests ────────────────────────────────────────────────────

describe("DemoAgendaPage", () => {
  it("renders the page heading MI AGENDA", () => {
    render(<DemoAgendaPage />);
    expect(screen.getByRole("heading", { name: /mi agenda/i })).toBeInTheDocument();
  });

  it("heading text is 'MI AGENDA' (uppercase)", () => {
    render(<DemoAgendaPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("MI AGENDA");
  });

  it("renders DemoAgendaView component", () => {
    render(<DemoAgendaPage />);
    expect(screen.getByTestId("demo-agenda-view")).toBeInTheDocument();
  });

  it("passes days from context to DemoAgendaView — 0 days when context returns empty", () => {
    render(<DemoAgendaPage />);
    const view = screen.getByTestId("demo-agenda-view");
    expect(view).toHaveAttribute("data-days", "0");
  });

  it("passes days count when context has non-empty days", () => {
    mockUseDemoContext.mockReturnValue({
      days: [{ label: "Viernes", stages: [], artists: [], bounds: { startMin: 960, endMin: 1440, totalMinutes: 480 } }],
      attendance: new Set<string>(),
      toggleAttendance: vi.fn(),
    } as unknown as ReturnType<typeof useDemoContext>);
    render(<DemoAgendaPage />);
    const view = screen.getByTestId("demo-agenda-view");
    expect(view).toHaveAttribute("data-days", "1");
  });

  it("renders a subheading describing demo mode", () => {
    render(<DemoAgendaPage />);
    expect(screen.getByText(/modo demo/i)).toBeInTheDocument();
  });
});
