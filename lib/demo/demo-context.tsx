"use client";

// ── Demo Context ────────────────────────────────────────────
// Provides all demo-mode state and mutations without any
// Supabase dependency. Wrap the demo shell with <DemoProvider>.

import { createContext, useContext, useState, useMemo } from "react"
import type { DemoContextValue, DemoFriendship } from "@/lib/demo/demo-types"
import {
  DEMO_USER,
  DEMO_PROFILES,
  DEMO_FRIENDSHIPS,
  DEMO_GROUPS,
  DEMO_GROUP_DETAILS,
  DEMO_USER_ATTENDANCE,
  DEMO_FRIEND_ATTENDANCE,
  DEMO_DAYS,
  DEMO_EVENT_NAME,
  DEMO_CURRENT_MIN,
  DEMO_DAY_LABEL,
} from "@/lib/demo/demo-data"
import { computeLiveStages } from "@/lib/schedule-utils"

// ── Context ────────────────────────────────────────────────

const DemoContext = createContext<DemoContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // ── Attendance state ─────────────────────────────────
  const [attendance, setAttendance] = useState<Set<string>>(
    () => new Set(DEMO_USER_ATTENDANCE),
  )

  // ── Friendships state ────────────────────────────────
  const [friendships, setFriendships] = useState<DemoFriendship[]>(
    () => DEMO_FRIENDSHIPS,
  )

  // ── Live stages — computed once for Viernes at DEMO_CURRENT_MIN ──
  const liveStages = useMemo(() => {
    const viernesDay = DEMO_DAYS.find((d) => d.label === "Viernes")
    if (!viernesDay) return []
    return computeLiveStages(viernesDay, DEMO_CURRENT_MIN)
  }, [])

  // ── Mutations ─────────────────────────────────────────

  function toggleAttendance(artistId: string) {
    setAttendance((prev) => {
      const next = new Set(prev)
      if (next.has(artistId)) {
        next.delete(artistId)
      } else {
        next.add(artistId)
      }
      return next
    })
  }

  function sendFriendRequest(targetId: string) {
    const newFriendship: DemoFriendship = {
      id: `fs-demo-${Date.now()}`,
      requester_id: DEMO_USER.id,
      addressee_id: targetId,
      status: "pending",
      created_at: new Date().toISOString(),
    }
    setFriendships((prev) => [...prev, newFriendship])
  }

  function acceptFriendRequest(friendshipId: string) {
    setFriendships((prev) =>
      prev.map((f) =>
        f.id === friendshipId ? { ...f, status: "accepted" } : f,
      ),
    )
  }

  function rejectFriendRequest(friendshipId: string) {
    setFriendships((prev) =>
      prev.map((f) =>
        f.id === friendshipId ? { ...f, status: "rejected" } : f,
      ),
    )
  }

  function removeFriend(friendshipId: string) {
    setFriendships((prev) => prev.filter((f) => f.id !== friendshipId))
  }

  // ── Queries ───────────────────────────────────────────

  function getFriendAttendance(friendId: string): string[] {
    return DEMO_FRIEND_ATTENDANCE[friendId] ?? []
  }

  // ── Context value ─────────────────────────────────────

  const value: DemoContextValue = {
    // Demo user
    demoUser: DEMO_USER,

    // Schedule
    days: DEMO_DAYS,
    eventName: DEMO_EVENT_NAME,

    // En vivo
    liveStages,
    demoCurrentMin: DEMO_CURRENT_MIN,
    demoDayLabel: DEMO_DAY_LABEL,

    // Attendance
    attendance,
    toggleAttendance,

    // Social state
    allProfiles: DEMO_PROFILES,
    friendships,
    groups: DEMO_GROUPS,
    groupDetails: DEMO_GROUP_DETAILS,
    friendAttendance: DEMO_FRIEND_ATTENDANCE,

    // Social mutations
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,

    // Attendance queries
    getFriendAttendance,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

// ── Hook ───────────────────────────────────────────────────

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (ctx === null) {
    throw new Error(
      "useDemoContext must be used inside a <DemoProvider>. " +
        "Make sure the component is wrapped in DemoProvider.",
    )
  }
  return ctx
}
