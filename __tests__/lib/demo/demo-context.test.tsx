import { describe, it, expect } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { DemoProvider, useDemoContext } from "@/lib/demo/demo-context"
import { DEMO_USER, DEMO_USER_ATTENDANCE, DEMO_FRIENDSHIPS, DEMO_DAYS } from "@/lib/demo/demo-data"

// ── Test consumer helpers ───────────────────────────────────

/** Renders children inside DemoProvider — lets us grab context values from a real consumer */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>
}

/** Minimal consumer that renders a property from context to the DOM */
function DemoUserDisplay() {
  const ctx = useDemoContext()
  return <div data-testid="username">{ctx.demoUser.username}</div>
}

function AttendanceDisplay({ artistId }: { artistId: string }) {
  const ctx = useDemoContext()
  const attending = ctx.attendance.has(artistId)
  return (
    <div>
      <span data-testid="attending">{attending ? "yes" : "no"}</span>
      <button
        type="button"
        data-testid="toggle"
        onClick={() => ctx.toggleAttendance(artistId)}
      >
        toggle
      </button>
    </div>
  )
}

function FriendshipsDisplay() {
  const ctx = useDemoContext()
  return <div data-testid="fs-count">{ctx.friendships.length}</div>
}

function LiveStagesDisplay() {
  const ctx = useDemoContext()
  return <div data-testid="live-count">{ctx.liveStages.length}</div>
}

function DemoTimeDisplay() {
  const ctx = useDemoContext()
  return (
    <div>
      <span data-testid="current-min">{ctx.demoCurrentMin}</span>
      <span data-testid="day-label">{ctx.demoDayLabel}</span>
    </div>
  )
}

function SendFriendDisplay() {
  const ctx = useDemoContext()
  const handle = () => ctx.sendFriendRequest("new-user-999")
  return (
    <div>
      <span data-testid="fs-count">{ctx.friendships.length}</span>
      <button type="button" data-testid="send" onClick={handle}>send</button>
    </div>
  )
}

function AcceptFriendDisplay({ friendshipId }: { friendshipId: string }) {
  const ctx = useDemoContext()
  const fs = ctx.friendships.find((f) => f.id === friendshipId)
  const handle = () => ctx.acceptFriendRequest(friendshipId)
  return (
    <div>
      <span data-testid="status">{fs?.status ?? "not-found"}</span>
      <button type="button" data-testid="accept" onClick={handle}>accept</button>
    </div>
  )
}

function RejectFriendDisplay({ friendshipId }: { friendshipId: string }) {
  const ctx = useDemoContext()
  const fs = ctx.friendships.find((f) => f.id === friendshipId)
  const handle = () => ctx.rejectFriendRequest(friendshipId)
  return (
    <div>
      <span data-testid="status">{fs?.status ?? "not-found"}</span>
      <button type="button" data-testid="reject" onClick={handle}>reject</button>
    </div>
  )
}

function RemoveFriendDisplay({ friendshipId }: { friendshipId: string }) {
  const ctx = useDemoContext()
  const fs = ctx.friendships.find((f) => f.id === friendshipId)
  const handle = () => ctx.removeFriend(friendshipId)
  return (
    <div>
      <span data-testid="found">{fs ? "found" : "gone"}</span>
      <button type="button" data-testid="remove" onClick={handle}>remove</button>
    </div>
  )
}

function GetFriendAttendanceDisplay({ friendId }: { friendId: string }) {
  const ctx = useDemoContext()
  const shows = ctx.getFriendAttendance(friendId)
  return <div data-testid="shows-count">{shows.length}</div>
}

// ── Tests ──────────────────────────────────────────────────

describe("DemoProvider — initial state", () => {
  it("exposes demoUser with the correct username", () => {
    render(<DemoUserDisplay />, { wrapper: Wrapper })
    expect(screen.getByTestId("username")).toHaveTextContent(DEMO_USER.username)
  })

  it("exposes days with 3 days (Viernes, Sábado, Domingo)", () => {
    function DaysDisplay() {
      const ctx = useDemoContext()
      return <div data-testid="days">{ctx.days.length}</div>
    }
    render(<DaysDisplay />, { wrapper: Wrapper })
    expect(screen.getByTestId("days")).toHaveTextContent("3")
  })

  it("exposes demoCurrentMin as 1110 (18:30)", () => {
    render(<DemoTimeDisplay />, { wrapper: Wrapper })
    expect(screen.getByTestId("current-min")).toHaveTextContent("1110")
  })

  it("exposes demoDayLabel as 'Viernes'", () => {
    render(<DemoTimeDisplay />, { wrapper: Wrapper })
    expect(screen.getByTestId("day-label")).toHaveTextContent("Viernes")
  })

  it("initializes attendance from DEMO_USER_ATTENDANCE", () => {
    const firstId = DEMO_USER_ATTENDANCE[0]
    render(<AttendanceDisplay artistId={firstId} />, { wrapper: Wrapper })
    expect(screen.getByTestId("attending")).toHaveTextContent("yes")
  })

  it("attendance does NOT include an artist not in DEMO_USER_ATTENDANCE", () => {
    render(<AttendanceDisplay artistId="Viernes-NonExistent" />, { wrapper: Wrapper })
    expect(screen.getByTestId("attending")).toHaveTextContent("no")
  })

  it("initializes friendships from DEMO_FRIENDSHIPS", () => {
    render(<FriendshipsDisplay />, { wrapper: Wrapper })
    expect(screen.getByTestId("fs-count")).toHaveTextContent(String(DEMO_FRIENDSHIPS.length))
  })

  it("exposes liveStages computed for Viernes at DEMO_CURRENT_MIN", () => {
    render(<LiveStagesDisplay />, { wrapper: Wrapper })
    // Viernes has multiple stages — liveStages.length > 0
    const count = parseInt(screen.getByTestId("live-count").textContent ?? "0")
    expect(count).toBeGreaterThan(0)
  })

  it("liveStages count matches the number of stages in the Viernes day", () => {
    const viernesDay = DEMO_DAYS.find((d) => d.label === "Viernes")!
    render(<LiveStagesDisplay />, { wrapper: Wrapper })
    const count = parseInt(screen.getByTestId("live-count").textContent ?? "0")
    expect(count).toBe(viernesDay.stages.length)
  })
})

describe("toggleAttendance", () => {
  it("removes an attended artist when toggled", () => {
    const artistId = DEMO_USER_ATTENDANCE[0]
    render(<AttendanceDisplay artistId={artistId} />, { wrapper: Wrapper })

    expect(screen.getByTestId("attending")).toHaveTextContent("yes")
    act(() => {
      screen.getByTestId("toggle").click()
    })
    expect(screen.getByTestId("attending")).toHaveTextContent("no")
  })

  it("adds a non-attended artist when toggled", () => {
    render(<AttendanceDisplay artistId="Viernes-Unknown" />, { wrapper: Wrapper })

    expect(screen.getByTestId("attending")).toHaveTextContent("no")
    act(() => {
      screen.getByTestId("toggle").click()
    })
    expect(screen.getByTestId("attending")).toHaveTextContent("yes")
  })
})

describe("sendFriendRequest", () => {
  it("adds a new friendship with status 'pending'", () => {
    render(<SendFriendDisplay />, { wrapper: Wrapper })

    const initialCount = parseInt(screen.getByTestId("fs-count").textContent ?? "0")
    act(() => {
      screen.getByTestId("send").click()
    })
    expect(screen.getByTestId("fs-count")).toHaveTextContent(String(initialCount + 1))
  })
})

describe("acceptFriendRequest", () => {
  it("changes a pending friendship status to 'accepted'", () => {
    // fs-007 is pending (vale-dance-008 → demo-user-001)
    render(<AcceptFriendDisplay friendshipId="fs-007" />, { wrapper: Wrapper })

    expect(screen.getByTestId("status")).toHaveTextContent("pending")
    act(() => {
      screen.getByTestId("accept").click()
    })
    expect(screen.getByTestId("status")).toHaveTextContent("accepted")
  })
})

describe("rejectFriendRequest", () => {
  it("changes a pending friendship status to 'rejected'", () => {
    // fs-008 is pending (fede-bass-009 → demo-user-001)
    render(<RejectFriendDisplay friendshipId="fs-008" />, { wrapper: Wrapper })

    expect(screen.getByTestId("status")).toHaveTextContent("pending")
    act(() => {
      screen.getByTestId("reject").click()
    })
    expect(screen.getByTestId("status")).toHaveTextContent("rejected")
  })
})

describe("removeFriend", () => {
  it("removes a friendship from the list", () => {
    // fs-001 is accepted (demo-user-001 → sofi-music-002)
    render(<RemoveFriendDisplay friendshipId="fs-001" />, { wrapper: Wrapper })

    expect(screen.getByTestId("found")).toHaveTextContent("found")
    act(() => {
      screen.getByTestId("remove").click()
    })
    expect(screen.getByTestId("found")).toHaveTextContent("gone")
  })
})

describe("getFriendAttendance", () => {
  it("returns the attendance array for a known friend", () => {
    // sofi-music-002 has 8 shows in DEMO_FRIEND_ATTENDANCE
    render(<GetFriendAttendanceDisplay friendId="sofi-music-002" />, { wrapper: Wrapper })
    const count = parseInt(screen.getByTestId("shows-count").textContent ?? "0")
    expect(count).toBeGreaterThan(0)
  })

  it("returns empty array for an unknown friend ID", () => {
    render(<GetFriendAttendanceDisplay friendId="does-not-exist" />, { wrapper: Wrapper })
    expect(screen.getByTestId("shows-count")).toHaveTextContent("0")
  })
})

describe("useDemoContext — outside provider", () => {
  it("throws an error when used outside DemoProvider", () => {
    function BadConsumer() {
      useDemoContext()
      return null
    }
    // Suppress console.error from React's error boundary during this test
    const originalError = console.error
    console.error = () => {}
    expect(() => render(<BadConsumer />)).toThrow()
    console.error = originalError
  })
})
