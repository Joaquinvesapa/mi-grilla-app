// ── DemoAmigosComparePage ──────────────────────────────────
// Server Component wrapper for the friend compare page.
// Exports generateStaticParams for static export (GitHub Pages)
// and delegates rendering to the client component.

import { DemoCompareClient } from "./_components/demo-compare-client";

// ── Static params (GitHub Pages export) ────────────────────

export function generateStaticParams() {
  return [
    { friendId: "sofi-music-002" },
    { friendId: "nico-lolla-003" },
    { friendId: "cami-fest-004" },
    { friendId: "mati-rock-005" },
    { friendId: "lu-beats-006" },
    { friendId: "tomi-live-007" },
  ];
}

// ── Page ───────────────────────────────────────────────────

interface DemoAmigosComparePageProps {
  params: Promise<{ friendId: string }>;
}

export default async function DemoAmigosComparePage({
  params,
}: DemoAmigosComparePageProps) {
  const { friendId } = await params;
  return <DemoCompareClient friendId={friendId} />;
}
