import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DemoLiveNowMenu } from "@/app/demo/_components/demo-live-now-menu";
import type { DemoContextValue } from "@/lib/demo/demo-types";
import type { LiveStage, GridArtist } from "@/lib/schedule-types";

// ── Mock DemoContext ──────────────────────────────────────────

vi.mock("@/lib/demo/demo-context", () => ({
  useDemoContext: vi.fn(),
}));

import { useDemoContext } from "@/lib/demo/demo-context";
const mockUseDemoContext = vi.mocked(useDemoContext);

// ── Helpers ───────────────────────────────────────────────────

function makeLiveStage(
  stageName: string,
  stageIndex: number,
  nowPlaying: LiveStage["nowPlaying"],
  upNext: LiveStage["upNext"],
): LiveStage {
  return { stageName, stageIndex, nowPlaying, upNext };
}

function makeArtist(name: string, startMin: number, endMin: number, stageName: string): GridArtist {
  return {
    id: `test-${name}`,
    name,
    startMin,
    endMin,
    stageName,
    stageIndex: 0,
    startTime: "00:00",
    endTime: "00:00",
    subtitle: undefined,
  };
}

function makeContext(liveStages: LiveStage[], demoCurrentMin = 900): DemoContextValue {
  return {
    liveStages,
    demoCurrentMin,
  } as unknown as DemoContextValue;
}

// ── Tests: renders nothing when no live/upcoming stages ───────

describe("DemoLiveNowMenu — no stages", () => {
  it("renders nothing when liveStages is empty", () => {
    mockUseDemoContext.mockReturnValue(makeContext([]));
    const { container } = render(<DemoLiveNowMenu />);
    expect(screen.queryByRole("button", { name: /ver artistas/i })).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when all stages have null nowPlaying and null upNext", () => {
    const emptyStage = makeLiveStage("Flow Stage", 0, null, null);
    mockUseDemoContext.mockReturnValue(makeContext([emptyStage]));
    const { container } = render(<DemoLiveNowMenu />);
    expect(container.firstChild).toBeNull();
  });
});

// ── Tests: FAB rendering ──────────────────────────────────────

describe("DemoLiveNowMenu — FAB with live stages", () => {
  const artist = makeArtist("Tyler, The Creator", 870, 960, "Flow Stage");
  const liveStage = makeLiveStage("Flow Stage", 0, artist, null);

  beforeEach(() => {
    mockUseDemoContext.mockReturnValue(makeContext([liveStage]));
  });

  it("renders the FAB button when there are live stages", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    expect(fab).toBeInTheDocument();
  });

  it("FAB shows EN VIVO text when nowPlaying is not null", () => {
    render(<DemoLiveNowMenu />);
    expect(screen.getByText("EN VIVO")).toBeInTheDocument();
  });

  it("FAB shows PRÓXIMO text when only upNext exists (no nowPlaying)", () => {
    const upNextArtist = makeArtist("Lorde", 960, 1020, "Flow Stage");
    const upNextStage = makeLiveStage("Flow Stage", 0, null, upNextArtist);
    mockUseDemoContext.mockReturnValue(makeContext([upNextStage]));
    render(<DemoLiveNowMenu />);
    expect(screen.getByText("PRÓXIMO")).toBeInTheDocument();
  });

  it("FAB has aria-label 'Ver artistas en vivo'", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: "Ver artistas en vivo" });
    expect(fab).toBeInTheDocument();
  });

  it("FAB has aria-expanded=false when sheet is closed", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    expect(fab).toHaveAttribute("aria-expanded", "false");
  });
});

// ── Tests: Sheet open/close ───────────────────────────────────

describe("DemoLiveNowMenu — sheet interactions", () => {
  const artist = makeArtist("Tyler, The Creator", 870, 960, "Flow Stage");
  const liveStage = makeLiveStage("Flow Stage", 0, artist, null);

  beforeEach(() => {
    mockUseDemoContext.mockReturnValue(makeContext([liveStage]));
  });

  it("opens the sheet dialog when FAB is clicked", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    fireEvent.click(fab);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the artist name in the open sheet", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    fireEvent.click(fab);
    expect(screen.getByText("Tyler, The Creator")).toBeInTheDocument();
  });

  it("closes the sheet when close button is clicked (aria-expanded goes back to false)", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    fireEvent.click(fab);
    expect(fab).toHaveAttribute("aria-expanded", "true");
    const closeBtn = screen.getByRole("button", { name: /cerrar/i });
    fireEvent.click(closeBtn);
    expect(fab).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the sheet on Escape key press", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    fireEvent.click(fab);
    expect(fab).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fab).toHaveAttribute("aria-expanded", "false");
  });

  it("sheet dialog has aria-label when live", () => {
    render(<DemoLiveNowMenu />);
    fireEvent.click(screen.getByRole("button", { name: /ver artistas en vivo/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Artistas en vivo ahora");
  });

  it("FAB aria-expanded becomes true when sheet opens", () => {
    render(<DemoLiveNowMenu />);
    const fab = screen.getByRole("button", { name: /ver artistas en vivo/i });
    fireEvent.click(fab);
    expect(fab).toHaveAttribute("aria-expanded", "true");
  });
});

// ── Tests: no polling / side-effect-free ─────────────────────

describe("DemoLiveNowMenu — no async side effects", () => {
  it("does not set up any interval (no polling)", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const artist = makeArtist("Lorde", 870, 960, "Flow Stage");
    const stage = makeLiveStage("Flow Stage", 0, artist, null);
    mockUseDemoContext.mockReturnValue(makeContext([stage]));
    render(<DemoLiveNowMenu />);
    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });
});
