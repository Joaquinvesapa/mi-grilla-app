import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { DemoContextValue } from "@/lib/demo/demo-types";
import type { GridDay, GridArtist } from "@/lib/schedule-types";

// ── Mocks ────────────────────────────────────────────────────

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: vi.fn(),
}));

// Mock DayTabs to keep test focus on DemoAgendaView logic
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
          data-testid={`tab-${d.toLowerCase()}`}
          aria-selected={i === activeDay}
          onClick={() => onDayChange(i)}
        >
          {d}
        </button>
      ))}
    </div>
  ),
}));

// Mock AgendaCard — pure props, we just need to see it's rendered with the right data
vi.mock("@/app/(app)/agenda/_components/agenda-card", () => ({
  AgendaCard: ({
    artist,
    onRemove,
  }: {
    artist: GridArtist;
    conflicts: string[];
    onRemove: (id: string) => void;
  }) => (
    <div data-testid={`agenda-card-${artist.id}`}>
      <span>{artist.name}</span>
      <button type="button" onClick={() => onRemove(artist.id)}>
        Quitar {artist.name}
      </button>
    </div>
  ),
}));

// Mock AgendaEmpty
vi.mock("@/app/(app)/agenda/_components/agenda-empty", () => ({
  AgendaEmpty: ({ type, dayLabel }: { type: string; dayLabel?: string }) => (
    <div data-testid={`agenda-empty-${type}`}>
      {dayLabel && <span>{dayLabel}</span>}
    </div>
  ),
}));

// Mock DownloadAgendaButton
vi.mock("@/app/(app)/agenda/_components/download-agenda-button", () => ({
  DownloadAgendaButton: ({
    days,
    selectedArtists,
  }: {
    days: GridDay[];
    selectedArtists: Set<string>;
  }) => (
    <button
      type="button"
      data-testid="download-button"
      data-days={days.length}
      data-selected={selectedArtists.size}
    >
      Descargar agenda
    </button>
  ),
}));

import { useDemoContext } from "@/lib/demo/demo-context";
const mockUseDemoContext = vi.mocked(useDemoContext);

import { DemoAgendaView } from "@/app/demo/agenda/_components/demo-agenda-view";

// ── Helpers ───────────────────────────────────────────────────

function makeArtist(
  id: string,
  name: string,
  startMin: number,
  endMin: number,
  stageName = "Flow Stage",
  startTime = "18:00",
  endTime = "19:30",
): GridArtist {
  return {
    id,
    name,
    startMin,
    endMin,
    stageName,
    stageIndex: 0,
    startTime,
    endTime,
    subtitle: undefined,
  };
}

function makeDay(
  label: string,
  artists: GridArtist[],
): GridDay {
  return {
    label,
    stages: [],
    artists,
    bounds: { startMin: 960, endMin: 1440, totalMinutes: 480 },
  };
}

function makeContext(
  attendance: Set<string>,
  toggleAttendance: (id: string) => void,
  days: GridDay[],
): DemoContextValue {
  return {
    attendance,
    toggleAttendance,
    days,
  } as unknown as DemoContextValue;
}

// ── Test data ─────────────────────────────────────────────────

const ARTIST_A = makeArtist("day1-ArtistA", "Artist A", 1080, 1200, "Flow Stage", "18:00", "20:00");
const ARTIST_B = makeArtist("day1-ArtistB", "Artist B", 1200, 1320, "Perry Stage", "20:00", "22:00");
const ARTIST_C = makeArtist("day2-ArtistC", "Artist C", 960, 1080, "Flow Stage", "16:00", "18:00");

const DAY1 = makeDay("Viernes", [ARTIST_A, ARTIST_B]);
const DAY2 = makeDay("Sábado", [ARTIST_C]);

// ── Tests: empty state ────────────────────────────────────────

describe("DemoAgendaView — empty state (no attendance)", () => {
  beforeEach(() => {
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(), vi.fn(), [DAY1, DAY2]),
    );
  });

  it("renders AgendaEmpty with type='no-shows' when no shows are selected globally", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByTestId("agenda-empty-no-shows")).toBeInTheDocument();
  });

  it("does NOT render day tabs when no shows are selected", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.queryByTestId("day-tabs")).toBeNull();
  });
});

// ── Tests: renders attending artists ──────────────────────────

describe("DemoAgendaView — with attendance", () => {
  const toggleFn = vi.fn();

  beforeEach(() => {
    toggleFn.mockReset();
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day1-ArtistA", "day1-ArtistB"]), toggleFn, [DAY1, DAY2]),
    );
  });

  it("renders attending artist cards for the active day", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByTestId("agenda-card-day1-ArtistA")).toBeInTheDocument();
    expect(screen.getByTestId("agenda-card-day1-ArtistB")).toBeInTheDocument();
  });

  it("renders day tabs when at least one show is selected globally", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByTestId("day-tabs")).toBeInTheDocument();
  });

  it("renders DownloadAgendaButton when shows are selected", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByTestId("download-button")).toBeInTheDocument();
  });

  it("DownloadAgendaButton receives selectedArtists set from context", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    const btn = screen.getByTestId("download-button");
    expect(btn).toHaveAttribute("data-selected", "2");
  });

  it("shows artist name from attending artist", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByText("Artist A")).toBeInTheDocument();
    expect(screen.getByText("Artist B")).toBeInTheDocument();
  });

  it("does NOT render artists from non-attended IDs", () => {
    // ARTIST_C is not in attendance, and is on day 2 — but we check it's not visible
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.queryByTestId("agenda-card-day2-ArtistC")).toBeNull();
  });
});

// ── Tests: remove via toggleAttendance ────────────────────────

describe("DemoAgendaView — remove calls toggleAttendance (not server action)", () => {
  const toggleFn = vi.fn();

  beforeEach(() => {
    toggleFn.mockReset();
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day1-ArtistA"]), toggleFn, [DAY1, DAY2]),
    );
  });

  it("calls toggleAttendance with the artist id when remove button is clicked", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    const removeBtn = screen.getByRole("button", { name: "Quitar Artist A" });
    fireEvent.click(removeBtn);
    expect(toggleFn).toHaveBeenCalledWith("day1-ArtistA");
  });

  it("calls toggleAttendance once per click", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    const removeBtn = screen.getByRole("button", { name: "Quitar Artist A" });
    fireEvent.click(removeBtn);
    expect(toggleFn).toHaveBeenCalledTimes(1);
  });
});

// ── Tests: day switching ──────────────────────────────────────

describe("DemoAgendaView — day tab switching", () => {
  const toggleFn = vi.fn();

  beforeEach(() => {
    toggleFn.mockReset();
    // ARTIST_C is on day2, in attendance
    mockUseDemoContext.mockReturnValue(
      makeContext(
        new Set(["day1-ArtistA", "day2-ArtistC"]),
        toggleFn,
        [DAY1, DAY2],
      ),
    );
  });

  it("initially shows artists from day 0 (Viernes)", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByTestId("agenda-card-day1-ArtistA")).toBeInTheDocument();
    expect(screen.queryByTestId("agenda-card-day2-ArtistC")).toBeNull();
  });

  it("switches to day 1 artists when Sábado tab is clicked", () => {
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    const sabadoTab = screen.getByTestId("tab-sábado");
    fireEvent.click(sabadoTab);
    expect(screen.getByTestId("agenda-card-day2-ArtistC")).toBeInTheDocument();
    expect(screen.queryByTestId("agenda-card-day1-ArtistA")).toBeNull();
  });
});

// ── Tests: empty-day state ────────────────────────────────────

describe("DemoAgendaView — empty-day state", () => {
  it("renders AgendaEmpty with type='empty-day' when active day has no attended artists", () => {
    // Only day2 has attendance, but day 0 (Viernes) is active
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day2-ArtistC"]), vi.fn(), [DAY1, DAY2]),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByTestId("agenda-empty-empty-day")).toBeInTheDocument();
  });

  it("renders the day label inside empty-day state", () => {
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day2-ArtistC"]), vi.fn(), [DAY1, DAY2]),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    // The day label "Viernes" should appear inside the empty-day container
    const emptyContainer = screen.getByTestId("agenda-empty-empty-day");
    expect(emptyContainer).toHaveTextContent("Viernes");
  });
});

// ── Tests: stats badge ────────────────────────────────────────

describe("DemoAgendaView — summary stats", () => {
  it("shows total show count badge", () => {
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day1-ArtistA", "day1-ArtistB"]), vi.fn(), [DAY1, DAY2]),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    // 2 shows total
    expect(screen.getByText(/2 shows/i)).toBeInTheDocument();
  });

  it("shows singular 'show' when only 1 show selected", () => {
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day1-ArtistA"]), vi.fn(), [DAY1, DAY2]),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByText(/1 show/i)).toBeInTheDocument();
  });
});

// ── Tests: no offline/network code ───────────────────────────

describe("DemoAgendaView — no offline or server coupling", () => {
  it("does NOT render a pending mutations badge (no offline state)", () => {
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day1-ArtistA"]), vi.fn(), [DAY1, DAY2]),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    // 'pendiente' is the text from the original AgendaView offline badge
    expect(screen.queryByText(/pendiente/i)).toBeNull();
  });

  it("does NOT render AgendaEmpty with type='unauthenticated' (demo is always authed)", () => {
    mockUseDemoContext.mockReturnValue(
      makeContext(new Set(["day1-ArtistA"]), vi.fn(), [DAY1, DAY2]),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.queryByTestId("agenda-empty-unauthenticated")).toBeNull();
  });
});

// ── Tests: cross-day attendance counts ────────────────────────

describe("DemoAgendaView — cross-day show count", () => {
  it("counts shows across all days for the summary badge", () => {
    // 1 show on day1, 1 show on day2 → 2 total
    mockUseDemoContext.mockReturnValue(
      makeContext(
        new Set(["day1-ArtistA", "day2-ArtistC"]),
        vi.fn(),
        [DAY1, DAY2],
      ),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    expect(screen.getByText(/2 shows/i)).toBeInTheDocument();
  });

  it("DownloadAgendaButton receives the full attendance set (all days)", () => {
    mockUseDemoContext.mockReturnValue(
      makeContext(
        new Set(["day1-ArtistA", "day2-ArtistC"]),
        vi.fn(),
        [DAY1, DAY2],
      ),
    );
    render(<DemoAgendaView days={[DAY1, DAY2]} />);
    const btn = screen.getByTestId("download-button");
    expect(btn).toHaveAttribute("data-selected", "2");
  });
});
