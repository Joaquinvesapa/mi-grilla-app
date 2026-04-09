"use client";

// ── Types ──────────────────────────────────────────────────

interface DemoSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// ── Component ──────────────────────────────────────────────

export function DemoSearchInput({
  value,
  onChange,
  placeholder = "Buscar por usuario...",
}: DemoSearchInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
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
        aria-label="Buscar"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="w-full rounded-2xl border border-border bg-surface pl-11 pr-4 py-3 text-sm text-surface-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 touch-manipulation"
      />
    </div>
  );
}
