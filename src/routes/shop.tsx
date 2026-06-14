import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Lock, Check, Coins } from "lucide-react";
import { useAvatar } from "@/lib/avatar-store";
import {
  DEFAULT_COSMETICS,
  getRarityColor,
  type CosmeticType,
  type CosmeticRarity,
} from "@/lib/avatar-types";
import { CoinPill } from "@/components/coin-pill";
import { PremiumDialog } from "@/components/premium-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — Future Me" }] }),
  component: Shop,
});

type Category = "all" | "hair" | "eyes" | "outfit" | "accessory" | "background" | "title" | "premium";

function Shop() {
  const { ownedCosmetics, balance, loading, error, buyCosmetic, canAfford } = useAvatar();
  const [cat, setCat] = useState<Category>("all");
  const [premiumOpen, setPremiumOpen] = useState(false);

  const filtered = DEFAULT_COSMETICS.filter((item) => {
    if (cat === "all") return item.price > 0 || item.premiumOnly;
    if (cat === "premium") return item.premiumOnly;
    if (cat === "hair") return item.type === "hair" && (item.price > 0 || item.premiumOnly);
    if (cat === "eyes") return item.type === "eyes" && (item.price > 0 || item.premiumOnly);
    if (cat === "outfit") return item.type === "outfit" && (item.price > 0 || item.premiumOnly);
    if (cat === "accessory") return item.type === "accessory" && (item.price > 0 || item.premiumOnly);
    if (cat === "background") return item.type === "background" && (item.price > 0 || item.premiumOnly);
    if (cat === "title") return item.type === "title" && (item.price > 0 || item.premiumOnly);
    return true;
  });

  const isOwned = (itemId: string) => ownedCosmetics.some(c => c.id === itemId);

  const handleBuy = async (itemId: string) => {
    const item = DEFAULT_COSMETICS.find(c => c.id === itemId);
    if (!item) return;

    if (item.premiumOnly) {
      setPremiumOpen(true);
      return;
    }

    if (isOwned(itemId)) {
      return;
    }

    await buyCosmetic(itemId);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Something went wrong</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between px-5 pt-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Cosmetic shop
          </p>
          <h1 className="mt-1 text-2xl font-bold">Make it yours.</h1>
        </div>
        <CoinPill value={balance.coins} />
      </header>

      <button
        onClick={() => setPremiumOpen(true)}
        className="mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-center justify-between gap-3 rounded-3xl border border-primary/30 p-4 text-left"
        style={{ background: "linear-gradient(135deg, oklch(0.32 0.1 145 / 0.4), oklch(0.32 0.12 50 / 0.3))" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20">
            <Sparkles className="size-5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">Unlock Premium</p>
            <p className="truncate text-xs text-muted-foreground">
              Exclusive cosmetics, legendary items.
            </p>
          </div>
        </div>
        <Button size="sm">Upgrade</Button>
      </button>

      <div className="mt-5 flex gap-2 overflow-x-auto px-5">
        {(["all", "hair", "eyes", "outfit", "accessory", "background", "title", "premium"] as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors",
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            )}
          >
            {c === "all" || c === "premium" ? c : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 px-5 text-center">
          <p className="text-muted-foreground">No items in this category</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 px-5 pb-8">
          {filtered.map((item) => {
            const owned = isOwned(item.id);
            const locked = item.premiumOnly && !owned;
            const affordable = canAfford(item.price);

            return (
              <button
                key={item.id}
                onClick={() => handleBuy(item.id)}
                className={cn(
                  "relative flex flex-col rounded-3xl border bg-card p-4 text-left transition-all",
                  locked ? "border-primary/30" : "border-border hover:border-primary/40",
                  owned && "border-success/30"
                )}
              >
                {/* Rarity badge */}
                <div
                  className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                  style={{
                    backgroundColor: `${getRarityColor(item.rarity)}20`,
                    color: getRarityColor(item.rarity),
                  }}
                >
                  {item.rarity}
                </div>

                <div className="grid h-24 place-items-center rounded-2xl bg-secondary/50">
                  {item.type === "background" ? (
                    <div
                      className="size-16 rounded-2xl"
                      style={{
                        background: item.id.includes("sunset")
                          ? "linear-gradient(to bottom, #ff6b6b, #ffd93d)"
                          : item.id.includes("night")
                          ? "linear-gradient(to bottom, #0f0f23, #1a1a2e)"
                          : item.id.includes("forest")
                          ? "linear-gradient(to bottom, #134e4a, #1e3a2f)"
                          : item.id.includes("cosmic")
                          ? "linear-gradient(to bottom, #1a0033, #330066)"
                          : "transparent",
                      }}
                    />
                  ) : item.type === "title" ? (
                    <div className="text-lg font-bold">{item.name}</div>
                  ) : (
                    <div
                      className="size-14 rounded-full border border-border"
                      style={{ backgroundColor: item.colors[0] || "#888" }}
                    />
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  {item.premiumOnly && (
                    <Sparkles className="size-3.5 shrink-0 text-primary" />
                  )}
                </div>

                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {item.type}
                </p>

                <div className="mt-2">
                  {owned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[11px] font-semibold text-success">
                      <Check className="size-3" /> Owned
                    </span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
                      <Lock className="size-3" /> Premium
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums",
                        affordable
                          ? "bg-secondary"
                          : "bg-danger/15 text-danger"
                      )}
                    >
                      <Coins className={cn("size-3", affordable && "text-accent")} />
                      {item.price}
                    </span>
                  )}
                </div>

                {/* Lock overlay for premium */}
                {locked && !owned && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl bg-background/40 backdrop-blur-[1px]">
                    <Lock className="size-5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <PremiumDialog open={premiumOpen} onOpenChange={setPremiumOpen} />
    </div>
  );
}
