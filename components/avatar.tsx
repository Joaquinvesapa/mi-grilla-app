import Image from "next/image";
import { cn } from "@/lib/utils";

// ── Size presets ───────────────────────────────────────────

const AVATAR_SIZE = {
  XS: "xs",
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
} as const;

type AvatarSize = (typeof AVATAR_SIZE)[keyof typeof AVATAR_SIZE];

const sizeConfig: Record<
  AvatarSize,
  { container: string; text: string; pixels: number }
> = {
  xs: { container: "h-7 w-7", text: "text-[10px]", pixels: 28 },
  sm: { container: "h-8 w-8", text: "text-xs", pixels: 32 },
  md: { container: "h-10 w-10", text: "text-sm", pixels: 40 },
  lg: { container: "h-11 w-11", text: "text-base", pixels: 44 },
  xl: { container: "h-24 w-24", text: "text-3xl", pixels: 96 },
};

// ── Props ──────────────────────────────────────────────────

interface AvatarProps {
  username: string;
  color: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

// ── Component ──────────────────────────────────────────────

export function Avatar({
  username,
  color,
  src,
  size = AVATAR_SIZE.LG,
  className,
}: AvatarProps) {
  const config = sizeConfig[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={`Foto de perfil de ${username}`}
        width={config.pixels}
        height={config.pixels}
        className={cn(
          "shrink-0 rounded-full object-cover",
          config.container,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-display uppercase",
        config.container,
        config.text,
        className,
      )}
      style={{ backgroundColor: color, color: "#ffffff" }}
    >
      {username.charAt(0)}
    </div>
  );
}

export { AVATAR_SIZE };
export type { AvatarSize };
