import { ITEMS_BY_ID } from "@/lib/catalog";
import type { AvatarState } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AvatarPortrait({
  avatar,
  size = 220,
  className,
  ring,
}: {
  avatar: AvatarState;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const skin = ITEMS_BY_ID[avatar.skin]?.skinColor ?? "#f1c7a7";
  const hair = ITEMS_BY_ID[avatar.hair]?.hairColor ?? "#2c2c34";
  const outfit = ITEMS_BY_ID[avatar.outfit]?.outfitColor ?? "#3b7a57";
  const bg = ITEMS_BY_ID[avatar.background]?.bg ?? "linear-gradient(135deg,#0d3b3b,#5b2a72)";
  const accEmoji = ITEMS_BY_ID[avatar.accessory]?.emoji;

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-3xl",
        ring && "ring-2 ring-primary/30",
        className,
      )}
      style={{ width: size, height: size, background: bg }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.85} height={size * 0.85}>
        <path d="M 12 100 Q 50 60 88 100 Z" fill={outfit} />
        <path d="M 35 78 Q 50 90 65 78 L 65 100 L 35 100 Z" fill={outfit} stroke="#000" strokeOpacity={0.06} />
        <rect x="42" y="60" width="16" height="14" rx="4" fill={skin} />
        <circle cx="50" cy="42" r="22" fill={skin} />
        {avatar.hair === "hair-buzz" && (
          <path d="M 28 38 Q 50 18 72 38 L 72 44 Q 50 30 28 44 Z" fill={hair} />
        )}
        {avatar.hair === "hair-short" && (
          <path d="M 26 40 Q 50 12 74 40 L 74 50 Q 64 36 50 36 Q 36 36 26 50 Z" fill={hair} />
        )}
        {avatar.hair === "hair-curly" && (
          <g fill={hair}>
            <circle cx="34" cy="32" r="9" />
            <circle cx="44" cy="24" r="9" />
            <circle cx="56" cy="24" r="9" />
            <circle cx="66" cy="32" r="9" />
            <circle cx="30" cy="42" r="6" />
            <circle cx="70" cy="42" r="6" />
          </g>
        )}
        {avatar.hair === "hair-long" && (
          <path d="M 24 42 Q 50 8 76 42 L 78 70 L 70 60 Q 60 38 50 38 Q 40 38 30 60 L 22 70 Z" fill={hair} />
        )}
        {(avatar.hair === "hair-pink" || avatar.hair === "hair-gold") && (
          <path d="M 24 40 Q 50 8 76 40 L 76 52 Q 64 32 50 32 Q 36 32 24 52 Z" fill={hair} />
        )}
        <circle cx="42" cy="46" r="2.2" fill="#1a1a1f" />
        <circle cx="58" cy="46" r="2.2" fill="#1a1a1f" />
        <path d="M 43 54 Q 50 60 57 54" stroke="#1a1a1f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      {accEmoji && accEmoji !== "✕" && (
        <span
          className="pointer-events-none absolute"
          style={{
            fontSize: size * 0.18,
            top:
              avatar.accessory === "acc-halo" || avatar.accessory === "acc-crown"
                ? size * 0.05
                : size * 0.32,
          }}
        >
          {accEmoji}
        </span>
      )}
    </div>
  );
}