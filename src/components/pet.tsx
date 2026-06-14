import { ITEMS_BY_ID } from "@/lib/catalog";
import type { LivePet } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PetCreature({
  pet,
  size = 180,
  className,
  animate = true,
}: {
  pet: LivePet;
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  const skin = ITEMS_BY_ID[pet.skin];
  const color = skin?.petColor ?? "#5be1c4";
  const pattern = skin?.petPattern ?? "none";
  const accEmoji = ITEMS_BY_ID[pet.accessory]?.emoji;
  const mood = pet.happiness < 30 ? "sad" : pet.hunger < 25 ? "tired" : "happy";
  const { stage } = pet;
  const scale =
    stage.stage === "egg" ? 0.7 : stage.stage === "baby" ? 0.8 : stage.stage === "teen" ? 0.95 : 1;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(animate && "animate-pulse")}
        style={{ width: size * scale, height: size * scale }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <radialGradient id={`g-${pet.skin}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          {stage.stage === "egg" ? (
            <ellipse cx="50" cy="55" rx="32" ry="38" fill={`url(#g-${pet.skin})`} stroke="#0008" strokeWidth="0.5" />
          ) : (
            <g>
              <ellipse cx="50" cy="62" rx="34" ry="30" fill={`url(#g-${pet.skin})`} />
              <ellipse cx="36" cy="90" rx="8" ry="4" fill={color} opacity="0.8" />
              <ellipse cx="64" cy="90" rx="8" ry="4" fill={color} opacity="0.8" />
            </g>
          )}
          {pattern === "stars" && (
            <g fill="#fff" opacity="0.85">
              <circle cx="38" cy="55" r="1.2" />
              <circle cx="60" cy="48" r="1" />
              <circle cx="66" cy="65" r="1.4" />
              <circle cx="45" cy="72" r="1" />
            </g>
          )}
          {pattern === "fire" && (
            <path d="M 50 30 Q 56 38 50 46 Q 44 38 50 30 Z" fill="#ffd34d" opacity="0.9" />
          )}
          {pattern === "aurora" && (
            <g opacity="0.55">
              <ellipse cx="42" cy="60" rx="10" ry="20" fill="#5be1c4" />
              <ellipse cx="60" cy="62" rx="9" ry="18" fill="#ff5cae" />
            </g>
          )}
          {stage.stage !== "egg" && mood === "happy" && (
            <g fill="#1a1a1f">
              <circle cx="40" cy="56" r="3" />
              <circle cx="60" cy="56" r="3" />
              <circle cx="41" cy="55" r="0.9" fill="#fff" />
              <circle cx="61" cy="55" r="0.9" fill="#fff" />
              <path d="M 44 68 Q 50 74 56 68" stroke="#1a1a1f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </g>
          )}
          {stage.stage !== "egg" && mood === "tired" && (
            <g stroke="#1a1a1f" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M 36 56 L 44 56" />
              <path d="M 56 56 L 64 56" />
              <path d="M 44 72 Q 50 66 56 72" />
            </g>
          )}
          {stage.stage !== "egg" && mood === "sad" && (
            <g>
              <circle cx="40" cy="58" r="2.4" fill="#1a1a1f" />
              <circle cx="60" cy="58" r="2.4" fill="#1a1a1f" />
              <path d="M 44 72 Q 50 66 56 72" stroke="#1a1a1f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </g>
          )}
          {stage.stage !== "egg" && (
            <g>
              <circle cx="34" cy="66" r="3" fill="#ff8aa8" opacity="0.45" />
              <circle cx="66" cy="66" r="3" fill="#ff8aa8" opacity="0.45" />
            </g>
          )}
        </svg>
      </div>
      {accEmoji && accEmoji !== "✕" && (
        <span
          className="pointer-events-none absolute"
          style={{ fontSize: size * 0.2, top: size * 0.04 }}
        >
          {accEmoji}
        </span>
      )}
    </div>
  );
}

export function PetStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color = value < 25 ? "bg-danger" : value < 50 ? "bg-warn" : "bg-primary";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}