import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export function CoinPill({ value, className }: { value: number; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold tabular-nums",
        className,
      )}
    >
      <Coins className="size-4 text-accent" />
      {value.toLocaleString()}
    </div>
  );
}