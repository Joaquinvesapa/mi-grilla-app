"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

interface PinInputProps {
  name: string;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function PinInput({ name, autoFocus = false, hasError = false }: PinInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>(Array(PIN_LENGTH).fill(null));

  // autoFocus solo en desktop (pointer: fine) para no disparar teclado virtual en mobile
  useEffect(() => {
    if (!autoFocus) return;
    if (window.matchMedia("(pointer: fine)").matches) {
      refs.current[0]?.focus();
    }
  }, [autoFocus]);

  const pinValue = digits.join("");

  function focusAt(index: number) {
    refs.current[index]?.focus();
  }

  function handleChange(index: number, value: string) {
    // Accept only a single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Advance focus
    if (index < PIN_LENGTH - 1) {
      focusAt(index + 1);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (digits[index]) {
        // Clear current slot
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        // Move back and clear previous
        next[index - 1] = "";
        setDigits(next);
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      focusAt(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) return;

    const next = Array(PIN_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);

    // Focus the slot after the last pasted digit
    const nextIndex = Math.min(pasted.length, PIN_LENGTH - 1);
    focusAt(nextIndex);
  }

  return (
    <div className="relative w-full">
      {/* Hidden input carries the full PIN value for the form */}
      <input type="hidden" name={name} value={pinValue} />

      {/* Visible digit boxes */}
      <div className="flex justify-center gap-2.5" role="group" aria-label="PIN de 6 dígitos">
        {digits.map((digit, i) => {
          const isFilled = digit !== "";

          return (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              aria-label={`Dígito ${i + 1} de ${PIN_LENGTH}`}
              autoComplete="one-time-code"
              spellCheck={false}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className={cn(
                "h-14 w-full max-w-[46px] rounded-xl border-2 bg-surface text-center text-xl font-bold text-surface-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation",
                "transition-[border-color,background-color] duration-150",
                isFilled && !hasError && "border-primary bg-primary/5",
                !isFilled && !hasError && "border-border",
                hasError && "border-accent-pink bg-accent-pink/5",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
