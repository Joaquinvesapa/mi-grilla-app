"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const buttonBase =
  "rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    return `/social?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={cn(buttonBase, "border border-border text-surface-foreground hover:bg-primary/10")}
        >
          Anterior
        </Link>
      ) : (
        <span
          className={cn(buttonBase, "border border-border text-muted opacity-50 cursor-not-allowed")}
          aria-disabled="true"
        >
          Anterior
        </span>
      )}

      <span className="text-sm text-muted tabular-nums">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={cn(buttonBase, "border border-border text-surface-foreground hover:bg-primary/10")}
        >
          Siguiente
        </Link>
      ) : (
        <span
          className={cn(buttonBase, "border border-border text-muted opacity-50 cursor-not-allowed")}
          aria-disabled="true"
        >
          Siguiente
        </span>
      )}
    </div>
  );
}
