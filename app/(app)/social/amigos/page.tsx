import { Suspense } from "react";
import {
  getAcceptedFriends,
  getPendingReceived,
  getPendingSent,
} from "./actions";
import { FriendCard } from "./_components/friend-card";
import { RequestCard } from "./_components/request-card";

// ── Page ───────────────────────────────────────────────────

export default function AmigosPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Pending requests received */}
      <Suspense fallback={<SectionSkeleton />}>
        <PendingReceivedSection />
      </Suspense>

      {/* Accepted friends */}
      <Suspense fallback={<SectionSkeleton />}>
        <FriendsSection />
      </Suspense>

      {/* Pending requests sent */}
      <Suspense fallback={<SectionSkeleton />}>
        <PendingSentSection />
      </Suspense>
    </div>
  );
}

// ── Pending received ───────────────────────────────────────

async function PendingReceivedSection() {
  const requests = await getPendingReceived();

  if (requests.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pl-1">
        <h2 className="text-sm font-semibold text-foreground">
          Solicitudes recibidas
        </h2>
        <span
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-primary-foreground"
          style={{ backgroundColor: "var(--color-accent-pink)" }}
        >
          {requests.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {requests.map((req) => (
          <RequestCard key={req.id} friendship={req} direction="received" />
        ))}
      </div>
    </section>
  );
}

// ── Accepted friends ───────────────────────────────────────

async function FriendsSection() {
  const friends = await getAcceptedFriends();

  if (friends.length === 0) {
    return (
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
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground pl-1">
        Amigos ({friends.length})
      </h2>

      <div className="flex flex-col gap-2">
        {friends.map((f) => (
          <FriendCard key={f.id} friendship={f} />
        ))}
      </div>
    </section>
  );
}

// ── Pending sent ───────────────────────────────────────────

async function PendingSentSection() {
  const requests = await getPendingSent();

  if (requests.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted pl-1">
        Solicitudes enviadas ({requests.length})
      </h2>

      <div className="flex flex-col gap-2">
        {requests.map((req) => (
          <RequestCard key={req.id} friendship={req} direction="sent" />
        ))}
      </div>
    </section>
  );
}

// ── Skeleton ───────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-5 w-32 rounded bg-muted/20 animate-pulse ml-1" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border p-3 animate-pulse"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-muted/20" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-4 w-28 rounded bg-muted/20" />
            <div className="h-3 w-20 rounded bg-muted/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
