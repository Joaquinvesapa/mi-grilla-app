// ── Demo Group Detail Page ──────────────────────────────────
// Server Component wrapper for the group detail page.
// Exports generateStaticParams for static export (GitHub Pages)
// and delegates rendering to the client component.

import { DemoGroupDetailClient } from "./_components/demo-group-detail-client";

// ── Static params (GitHub Pages export) ────────────────────

export function generateStaticParams() {
  return [{ groupId: "group-001" }, { groupId: "group-002" }];
}

// ── Page ───────────────────────────────────────────────────

interface DemoGroupDetailPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function DemoGroupDetailPage({
  params,
}: DemoGroupDetailPageProps) {
  const { groupId } = await params;
  return <DemoGroupDetailClient groupId={groupId} />;
}
