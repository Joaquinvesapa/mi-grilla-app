import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Mocks ────────────────────────────────────────────────────
// Mock child components so this test targets DemoScheduleGrid composition
// and behavior only — not the internals of DayTabs, TimeAxis, or ArtistCard.

vi.mock("@/app/(app)/grilla/_components/day-tabs", () => ({
  DayTabs: ({
    days,
    activeDay,
    onDayChange,
  }: {
    days: string[];
    activeDay: number;
    onDayChange: (i: number) => void;
  }) => (
    <div data-testid="day-tabs">
      {days.map((d, i) => (
        <button
          key={d}
          type="button"
          data-testid={`day-tab-${d}`}
          aria-selected={i === activeDay}
          onClick={() => onDayChange(i)}
        >
          {d}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/app/(app)/grilla/_components/time-axis", () => ({
  TimeAxis: () => <div data-testid="time-axis" />,
}));

vi.mock("@/app/(app)/grilla/_components/artist-card", () => ({
  ArtistCard: ({
    artist,
    isSelected,
    isSelectable,
    onToggle,
  }: {
    artist: { id: string; name: string };
    isSelected: boolean;
    isSelectable: boolean;
    onToggle?: (id: string) => void;
  }) => (
    <button
      type="button"
      data-testid={`artist-card-${artist.id}`}
      aria-pressed={isSelected}
      data-selectable={isSelectable}
      onClick={() => onToggle?.(artist.id)}
    >
      {artist.name}
    </button>
  ),
}));

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: () => mockContext,
}));

// ── Fixtures ─────────────────────────────────────────────────

import type { GridDay, GridBounds } from "@/lib/schedule-types";

const bounds: GridBounds = { startMin: 780, endMin: 900, totalMinutes: 120 };

const mockDays: GridDay[] = [
  {
    label: "Viernes",
    stages: [
      { name: "Flow Stage", index: 0 },
      { name: "Samsung Stage", index: 1 },
    ],
    artists: [
      {
        id: "Viernes-Tyler",
        name: "Tyler",
        startMin: 800,
        endMin: 860,
        startTime: "13:20",
        endTime: "14:20",
        stageName: "Flow Stage",
        stageIndex: 0,
      },
      {
        id: "Viernes-Lorde",
        name: "Lorde",
        startMin: 820,
        endMin: 870,
        startTime: "13:40",
        endTime: "14:30",
        stageName: "Samsung Stage",
        stageIndex: 1,
      },
    ],
    bounds,
  },
  {
    label: "Sábado",
    stages: [{ name: "Flow Stage", index: 0 }],
    artists: [
      {
        id: "Sábado-Marina",
        name: "Marina",
        startMin: 800,
        endMin: 860,
        startTime: "13:20",
        endTime: "14:20",
        stageName: "Flow Stage",
        stageIndex: 0,
      },
    ],
    bounds,
  },
];

let mockContext = {
  attendance: new Set<string>(),
  toggleAttendance: vi.fn(),
};

// ── Import target (after mocks) ───────────────────────────────

import { DemoScheduleGrid } from "@/app/demo/grilla/_components/demo-schedule-grid";

// ── Tests: rendering ─────────────────────────────────────────

describe("DemoScheduleGrid", () => {
  it("renders DayTabs with all day labels", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    expect(screen.getByTestId("day-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("day-tab-Viernes")).toBeInTheDocument();
    expect(screen.getByTestId("day-tab-Sábado")).toBeInTheDocument();
  });

  it("renders the TimeAxis", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    expect(screen.getByTestId("time-axis")).toBeInTheDocument();
  });

  it("renders ArtistCards for the active day (Viernes by default)", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    expect(screen.getByTestId("artist-card-Viernes-Tyler")).toBeInTheDocument();
    expect(screen.getByTestId("artist-card-Viernes-Lorde")).toBeInTheDocument();
  });

  it("does NOT render ArtistCards from other days when on day 0", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    expect(
      screen.queryByTestId("artist-card-Sábado-Marina"),
    ).not.toBeInTheDocument();
  });

  it("renders stage names in the header row", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    // Stage names (with 'Stage' suffix stripped) should appear in header
    expect(screen.getByText("Flow")).toBeInTheDocument();
    expect(screen.getByText("Samsung")).toBeInTheDocument();
  });

  // ── Tests: day switching ──────────────────────────────────

  it("switches to Sábado artists when Sábado tab is clicked", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    fireEvent.click(screen.getByTestId("day-tab-Sábado"));
    expect(
      screen.getByTestId("artist-card-Sábado-Marina"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("artist-card-Viernes-Tyler"),
    ).not.toBeInTheDocument();
  });

  // ── Tests: attendance toggle ──────────────────────────────

  it("renders all ArtistCards as selectable (isSelectable=true always)", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    const card = screen.getByTestId("artist-card-Viernes-Tyler");
    expect(card.dataset.selectable).toBe("true");
  });

  it("passes isSelected=true for artists in context.attendance", () => {
    mockContext = {
      attendance: new Set(["Viernes-Tyler"]),
      toggleAttendance: vi.fn(),
    };

    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );

    expect(
      screen.getByTestId("artist-card-Viernes-Tyler"),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByTestId("artist-card-Viernes-Lorde"),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("calls context.toggleAttendance when an ArtistCard is clicked", () => {
    const toggleMock = vi.fn();
    mockContext = {
      attendance: new Set<string>(),
      toggleAttendance: toggleMock,
    };

    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );

    fireEvent.click(screen.getByTestId("artist-card-Viernes-Tyler"));
    expect(toggleMock).toHaveBeenCalledWith("Viernes-Tyler");
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  // ── Tests: no SaveAttendanceButton ───────────────────────

  it("does NOT render a save button (no batch save in demo mode)", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    // There should be no button with 'guardar' text
    expect(
      screen.queryByRole("button", { name: /guardar/i }),
    ).not.toBeInTheDocument();
  });

  // ── Tests: HORA label ────────────────────────────────────

  it("renders HORA label in the time column header", () => {
    render(
      <DemoScheduleGrid
        days={mockDays}
        eventName="Lollapalooza"
        currentMin={810}
        currentDayLabel="Viernes"
      />,
    );
    expect(screen.getByText("HORA")).toBeInTheDocument();
  });
});
