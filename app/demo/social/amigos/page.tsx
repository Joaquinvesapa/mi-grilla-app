"use client";

// ── DemoAmigosPage ─────────────────────────────────────────
// Lists pending friend requests and accepted friends in demo mode.
// All data comes from useDemoContext() — no Supabase calls.

import { useDemoContext } from "@/lib/demo/demo-context";
import { DemoRequestCard } from "./_components/demo-request-card";
import { DemoFriendCard } from "./_components/demo-friend-card";

// ── Page ───────────────────────────────────────────────────

export default function DemoAmigosPage() {
  const { demoUser, allProfiles, friendships } = useDemoContext();

  // ── Derive accepted friends ───────────────────────────────
  const acceptedFriendships = friendships.filter(
    (f) =>
      f.status === "accepted" &&
      (f.requester_id === demoUser.id || f.addressee_id === demoUser.id),
  );

  const acceptedFriends = acceptedFriendships.map((f) => {
    const friendId =
      f.requester_id === demoUser.id ? f.addressee_id : f.requester_id;
    const profile = allProfiles.find((p) => p.id === friendId);
    return { friendship: f, friendId, profile };
  }).filter((item) => item.profile !== undefined);

  // ── Derive pending received requests ──────────────────────
  const pendingReceived = friendships.filter(
    (f) => f.status === "pending" && f.addressee_id === demoUser.id,
  );

  const pendingWithProfiles = pendingReceived.map((f) => {
    const profile = allProfiles.find((p) => p.id === f.requester_id);
    return { friendship: f, profile };
  }).filter((item) => item.profile !== undefined);

  return (
    <div className="flex flex-col gap-6">
      {/* Solicitudes pendientes */}
      {pendingWithProfiles.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2 pl-1">
            <h2 className="text-sm font-semibold text-foreground">
              Solicitudes pendientes
            </h2>
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-primary-foreground"
              style={{ backgroundColor: "var(--color-accent-pink)" }}
            >
              {pendingWithProfiles.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {pendingWithProfiles.map(({ friendship, profile }) => (
              <DemoRequestCard
                key={friendship.id}
                friendshipId={friendship.id}
                profile={profile!}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mis amigos */}
      {acceptedFriends.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="text-4xl" role="img" aria-label="Amigos">
            👋
          </span>
          <p className="text-sm text-muted">
            Todavía no tenés amigos agregados.
          </p>
          <p className="max-w-xs text-xs text-muted">
            Andá a <strong>Comunidad</strong> para buscar usuarios y enviarles
            una solicitud de amistad.
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground pl-1">
            Mis amigos ({acceptedFriends.length})
          </h2>

          <div className="flex flex-col gap-2">
            {acceptedFriends.map(({ friendship, friendId, profile }) => (
              <DemoFriendCard
                key={friendship.id}
                friendId={friendId}
                profile={profile!}
                friendshipId={friendship.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
