import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ────────────────────────────────────────────────────

// Mock DemoScheduleGrid so this test focuses on page composition
vi.mock("@/app/demo/grilla/_components/demo-schedule-grid", () => ({
  DemoScheduleGrid: ({
    days,
    eventName,
    currentMin,
    currentDayLabel,
  }: {
    days: unknown[];
    eventName: string;
    currentMin: number;
    currentDayLabel: string;
  }) => (
    <div
      data-testid="demo-schedule-grid"
      data-event-name={eventName}
      data-current-min={currentMin}
      data-current-day-label={currentDayLabel}
      data-days-count={days.length}
    />
  ),
}));

// Mock useDemoContext to return controlled values
const mockDays = [
  { label: "Viernes", stages: [], artists: [], bounds: { startMin: 780, endMin: 900, totalMinutes: 120 } },
  { label: "Sábado", stages: [], artists: [], bounds: { startMin: 780, endMin: 900, totalMinutes: 120 } },
];

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => ({
    days: mockDays,
    eventName: "Lollapalooza Argentina 2025",
    demoCurrentMin: 810,
    demoDayLabel: "Viernes",
    attendance: new Set(),
    toggleAttendance: vi.fn(),
    liveStages: [],
    allProfiles: [],
    friendships: [],
    groups: [],
    groupDetails: {},
    friendAttendance: {},
    demoUser: { id: "u1", username: "demo" },
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    rejectFriendRequest: vi.fn(),
    removeFriend: vi.fn(),
    getFriendAttendance: vi.fn(),
  }),
}));

import DemoGrillaPage from "@/app/demo/grilla/page";

// ── Tests ────────────────────────────────────────────────────

describe("DemoGrillaPage", () => {
  it("renders DemoScheduleGrid", () => {
    render(<DemoGrillaPage />);
    expect(screen.getByTestId("demo-schedule-grid")).toBeInTheDocument();
  });

  it("passes days from context to DemoScheduleGrid", () => {
    render(<DemoGrillaPage />);
    const grid = screen.getByTestId("demo-schedule-grid");
    expect(grid.dataset.daysCount).toBe("2");
  });

  it("passes eventName from context to DemoScheduleGrid", () => {
    render(<DemoGrillaPage />);
    const grid = screen.getByTestId("demo-schedule-grid");
    expect(grid.dataset.eventName).toBe("Lollapalooza Argentina 2025");
  });

  it("passes demoCurrentMin from context to DemoScheduleGrid as currentMin", () => {
    render(<DemoGrillaPage />);
    const grid = screen.getByTestId("demo-schedule-grid");
    expect(grid.dataset.currentMin).toBe("810");
  });

  it("passes demoDayLabel from context to DemoScheduleGrid as currentDayLabel", () => {
    render(<DemoGrillaPage />);
    const grid = screen.getByTestId("demo-schedule-grid");
    expect(grid.dataset.currentDayLabel).toBe("Viernes");
  });

  it("renders the eventName as a visible heading", () => {
    render(<DemoGrillaPage />);
    expect(
      screen.getByRole("heading", { name: /Lollapalooza Argentina 2025/i }),
    ).toBeInTheDocument();
  });

  it("heading uses font-display class", () => {
    render(<DemoGrillaPage />);
    const heading = screen.getByRole("heading", {
      name: /Lollapalooza Argentina 2025/i,
    });
    expect(heading.className).toContain("font-display");
  });
});
