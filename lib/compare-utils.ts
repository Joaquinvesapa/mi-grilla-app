import type { GridArtist } from "./schedule-types"

// ── Types ──────────────────────────────────────────────────

export const COMPARE_CATEGORY = {
  COMMON: "common",
  ONLY_ME: "only_me",
  ONLY_FRIEND: "only_friend",
} as const

export type CompareCategory =
  (typeof COMPARE_CATEGORY)[keyof typeof COMPARE_CATEGORY]

export interface CategorizedArtist {
  artist: GridArtist
  tag: CompareCategory
}

// ── Categorization ─────────────────────────────────────────

/**
 * Categorize a day's artists by set membership:
 * - common: in both mySet AND friendSet
 * - only_me: in mySet but NOT in friendSet
 * - only_friend: in friendSet but NOT in mySet
 */
export function categorizeArtists(
  artists: GridArtist[],
  mySet: Set<string>,
  friendSet: Set<string>,
): {
  common: GridArtist[]
  onlyMe: GridArtist[]
  onlyFriend: GridArtist[]
} {
  const common: GridArtist[] = []
  const onlyMe: GridArtist[] = []
  const onlyFriend: GridArtist[] = []

  for (const artist of artists) {
    const inMy = mySet.has(artist.id)
    const inFriend = friendSet.has(artist.id)

    if (inMy && inFriend) {
      common.push(artist)
    } else if (inMy) {
      onlyMe.push(artist)
    } else if (inFriend) {
      onlyFriend.push(artist)
    }
  }

  return { common, onlyMe, onlyFriend }
}
