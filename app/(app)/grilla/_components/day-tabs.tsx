"use client";

import { cn } from "@/lib/utils";

interface DayTabsProps {
  days: string[];
  activeDay: number;
  onDayChange: (index: number) => void;
}

const DAY_ACCENT: Record<string, string> = {
  Viernes: "bg-day-viernes",
  "Sábado": "bg-day-sabado",
  Domingo: "bg-day-domingo",
};

const DAY_TEXT: Record<string, string> = {
  Viernes: "text-day-viernes",
  "Sábado": "text-day-sabado",
  Domingo: "text-day-domingo",
};

export function DayTabs({ days, activeDay, onDayChange }: DayTabsProps) {
  return (
    <div role="tablist" className="flex gap-1 rounded-lg bg-surface/50 p-1">
      {days.map((day, i) => {
        const isActive = i === activeDay;
        const accentBg = DAY_ACCENT[day] ?? "bg-primary";
        const accentText = DAY_TEXT[day] ?? "text-primary";

        return (
          <button
            key={day}
            role="tab"
            aria-selected={isActive}
            onClick={() => onDayChange(i)}
            className={cn(
              "rounded-md px-4 py-2 font-display text-sm uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              isActive
                ? `${accentBg} text-white shadow-sm`
                : `${accentText} hover:bg-white/10`
            )}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
