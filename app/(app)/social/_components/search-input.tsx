"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useRef, useTransition } from "react";

const DEBOUNCE_MS = 300;

export function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().trim();

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }

        // Reset pagination when searching
        params.delete("page");

        router.replace(`${pathname}?${params.toString()}`);
      });
    }, DEBOUNCE_MS);
  }

  return (
    <div className="relative">
      {/* Search icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="search"
        name="q"
        placeholder="Buscar por usuario..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="w-full rounded-2xl border border-border bg-surface pl-11 pr-4 py-3 text-sm text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation"
      />

      {/* Loading indicator */}
      {isPending && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"
          role="status"
          aria-label="Buscando"
        />
      )}
    </div>
  );
}
