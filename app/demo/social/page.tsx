"use client";

import { useState } from "react";
import { useDemoContext } from "@/lib/demo/demo-context";
import { DemoSearchInput } from "./_components/demo-search-input";
import { DemoUserCard } from "./_components/demo-user-card";

// ── Component ──────────────────────────────────────────────

export default function DemoSocialPage() {
  const { demoUser, allProfiles } = useDemoContext();
  const [query, setQuery] = useState("");

  // Exclude demo user and apply search filter
  const filtered = allProfiles.filter((profile) => {
    if (profile.id === demoUser.id) return false;

    if (!query) return true;

    const q = query.toLowerCase();
    const matchesUsername = profile.username.toLowerCase().includes(q);
    const matchesInstagram = profile.instagram
      ? profile.instagram.toLowerCase().includes(q)
      : false;

    return matchesUsername || matchesInstagram;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <DemoSearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar por usuario..."
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="text-4xl" role="img" aria-label="Sin resultados">
            {query ? "🔍" : "👋"}
          </span>
          <p className="text-sm text-muted">
            {query
              ? `No se encontraron usuarios con "${query}"`
              : "No hay usuarios en la comunidad todavía."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((profile) => (
            <DemoUserCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
