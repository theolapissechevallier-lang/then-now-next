// Pixel-art trophy components. Pure CSS/SVG — no assets needed.
import { cn } from "@/lib/utils";
import type { AchievementRarity } from "@/lib/achievements";

const RARITY_COLORS: Record<
  AchievementRarity,
  { primary: string; secondary: string; accent: string }
> = {
  common: { primary: "#34d399", secondary: "#065f46", accent: "#a7f3d0" },
  rare: { primary: "#38bdf8", secondary: "#075985", accent: "#bae6fd" },
  epic: { primary: "#e879f9", secondary: "#86198f", accent: "#f5d0fe" },
  legendary: { primary: "#fbbf24", secondary: "#92400e", accent: "#fde68a" },
};

// Renders a chibi pixel-art trophy. Locked = grayscale + dim.
export function PixelTrophy({
  rarity,
  locked = false,
  size = 96,
  className,
}: {
  rarity: AchievementRarity;
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  const c = RARITY_COLORS[rarity];
  // pixel grid: 16x16, each "pixel" rendered as a rect
  // Trophy silhouette (1 = primary cup, 2 = handles, 3 = base, 4 = accent shine)
  const grid: number[][] = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 2, 1, 4, 4, 1, 1, 1, 1, 1, 1, 4, 4, 1, 2, 0],
    [2, 2, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 2, 2],
    [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    [2, 2, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 2, 2],
    [2, 2, 1, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2, 2],
    [0, 2, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 2, 0],
    [0, 0, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
  ];
  const cell = size / 16;
  const colorFor = (v: number) => {
    if (locked) {
      if (v === 0) return "transparent";
      if (v === 3) return "#1f2937";
      if (v === 2) return "#374151";
      if (v === 4) return "#6b7280";
      if (v === 5) return "#111827";
      return "#4b5563";
    }
    if (v === 0) return "transparent";
    if (v === 1) return c.primary;
    if (v === 2) return c.secondary;
    if (v === 3) return c.secondary;
    if (v === 4) return c.accent;
    if (v === 5) return c.secondary;
    return "transparent";
  };
  return (
    <svg
      className={cn("pixel-art", className)}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {grid.map((row, y) =>
        row.map((v, x) =>
          v === 0 ? null : (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={colorFor(v)}
            />
          ),
        ),
      )}
    </svg>
  );
}

// Pixel badge (circular shield) for category icons
export function PixelBadge({
  rarity,
  size = 48,
  icon,
  className,
}: {
  rarity: AchievementRarity;
  size?: number;
  icon: "goal" | "streak" | "pet" | "habits" | "special";
  className?: string;
}) {
  const c = RARITY_COLORS[rarity];
  const cell = size / 12;
  // Background ring
  const ring: number[][] = [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  ];
  // Icon overlay (12x12) per category — 3 = icon color
  const overlays: Record<string, number[][]> = {
    goal: [
      [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0],
      [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0],
      [0, 0, 3, 0, 0, 3, 3, 0, 0, 3, 0, 0],
      [0, 0, 3, 0, 3, 3, 3, 3, 0, 3, 0, 0],
      [0, 0, 3, 0, 3, 3, 3, 3, 0, 3, 0, 0],
      [0, 0, 3, 0, 0, 3, 3, 0, 0, 3, 0, 0],
      [0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0],
      [0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
    ],
    streak: [
      [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 3, 3, 0, 0, 0, 3, 3, 0, 0],
      [0, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0],
      [0, 0, 3, 3, 0, 3, 3, 3, 0, 3, 3, 0],
      [0, 0, 3, 0, 0, 3, 3, 3, 0, 0, 3, 0],
      [0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0],
      [0, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 0],
      [0, 0, 0, 3, 3, 3, 0, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0],
    ],
    pet: [
      [0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
      [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
      [0, 3, 3, 0, 3, 3, 3, 3, 0, 3, 3, 0],
      [0, 3, 3, 0, 3, 3, 3, 3, 0, 3, 3, 0],
      [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
      [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
      [0, 3, 3, 3, 0, 0, 0, 0, 3, 3, 3, 0],
      [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    habits: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0],
    ],
    special: [
      [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
      [0, 0, 3, 0, 0, 3, 3, 0, 0, 3, 0, 0],
      [3, 3, 0, 0, 3, 3, 3, 3, 0, 0, 3, 3],
      [3, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 3],
      [3, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 3],
      [3, 3, 0, 0, 3, 3, 3, 3, 0, 0, 3, 3],
      [0, 0, 3, 0, 0, 3, 3, 0, 0, 3, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
    ],
  };
  const overlay = overlays[icon];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {ring.map((row, y) =>
        row.map((v, x) => {
          if (v === 0) return null;
          const fill = v === 1 ? c.secondary : c.primary;
          return (
            <rect
              key={`r-${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={fill}
            />
          );
        }),
      )}
      {overlay.map((row, y) =>
        row.map((v, x) =>
          v === 0 ? null : (
            <rect
              key={`o-${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={c.accent}
            />
          ),
        ),
      )}
    </svg>
  );
}
