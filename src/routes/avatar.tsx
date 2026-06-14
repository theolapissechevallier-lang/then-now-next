import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Check, Lock } from "lucide-react";
import { PixelAvatar, AvatarPreview } from "@/components/pixel-avatar";
import { CosmeticSprite } from "@/components/pixel-sprites";
import { CoinPill } from "@/components/coin-pill";
import { useAvatar } from "@/lib/avatar-store";
import {
  getCosmeticsByType,
  SKIN_TONES,
  getRarityColor,
  type CosmeticType,
} from "@/lib/avatar-types";
import { cn } from "@/lib/utils";
import { PremiumDialog } from "@/components/premium-dialog";

export const Route = createFileRoute("/avatar")({
  head: () => ({ meta: [{ title: "Your Avatar — Future Me" }] }),
  component: AvatarPage,
});

const TABS: { key: CosmeticType; label: string }[] = [
  { key: "hair", label: "Hair" },
  { key: "eyes", label: "Eyes" },
  { key: "outfit", label: "Outfit" },
  { key: "accessory", label: "Accessories" },
  { key: "background", label: "Background" },
  { key: "title", label: "Title" },
];

function AvatarPage() {
  const {
    avatar,
    cosmetics,
    ownedCosmetics,
    balance,
    loading,
    error,
    updateAvatar,
    buyCosmetic,
    equipCosmetic,
    canAfford,
  } = useAvatar();

  const [tab, setTab] = useState<CosmeticType>("hair");
  const [colorPicker, setColorPicker] = useState<string | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground">Loading avatar...</p>
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

  const tabItems = getCosmeticsByType(tab);
  const isOwned = (itemId: string) => ownedCosmetics.some(c => c.id === itemId);
  const isEquipped = (itemId: string) => {
    const item = cosmetics.find(c => c.id === itemId);
    if (!item) return false;
    switch (item.type) {
      case "hair": return avatar.hairStyle === itemId.replace("hair-", "");
      case "eyes": return avatar.eyeStyle === itemId.replace("eyes-", "");
      case "outfit": return avatar.outfit === itemId.replace("outfit-", "");
      case "accessory": return avatar.accessory === itemId.replace("acc-", "");
      case "background": return avatar.background === itemId.replace("bg-", "");
      case "title": return avatar.title === item.name;
      default: return false;
    }
  };

  const handleSelectItem = async (itemId: string) => {
    const item = cosmetics.find(c => c.id === itemId);
    if (!item) return;

    if (item.premiumOnly) {
      setPremiumOpen(true);
      return;
    }

    if (!isOwned(itemId)) {
      if (!canAfford(item.price)) {
        return;
      }
      const success = await buyCosmetic(itemId);
      if (!success) return;
    }

    await equipCosmetic(itemId);
  };

  const handleColorChange = async (colorType: string, color: string) => {
    switch (colorType) {
      case "hair":
        await updateAvatar({ hairColor: color });
        break;
      case "eyes":
        await updateAvatar({ eyeColor: color });
        break;
      case "outfit":
        await updateAvatar({ outfitColor: color });
        break;
      case "skin":
        await updateAvatar({ skinTone: color });
        break;
    }
    setColorPicker(null);
  };

  const getCurrentItemColors = (itemType: CosmeticType): string[] => {
    switch (itemType) {
      case "hair":
        return tabItems.find(i => i.id === `hair-${avatar.hairStyle}`)?.colors || [];
      case "eyes":
        return tabItems.find(i => i.id === `eyes-${avatar.eyeStyle}`)?.colors || [];
      case "outfit":
        return tabItems.find(i => i.id === `outfit-${avatar.outfit}`)?.colors || [];
      default:
        return [];
    }
  };

  const getPreviewAvatar = (): typeof avatar => {
    return avatar;
  };

  return (
    <div className="pb-8">
      <header className="flex items-center justify-between px-5 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Your Avatar
        </p>
        <CoinPill value={balance.coins} />
      </header>

      <div className="mt-6 grid place-items-center px-5">
        <div className="relative">
          <PixelAvatar avatar={getPreviewAvatar()} size={220} showTitle />
          {avatar.title && (
            <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-amber-400">
              {avatar.title}
            </p>
          )}
        </div>
      </div>

      {/* Skin tone picker */}
      <div className="mt-6 px-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Skin Tone
        </p>
        <div className="flex gap-2 flex-wrap">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone}
              onClick={() => handleColorChange("skin", tone)}
              className={cn(
                "size-10 rounded-full border-2 transition-all",
                avatar.skinTone === tone
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40"
              )}
              style={{ backgroundColor: tone }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto px-5 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Color picker for current item */}
      {tab !== "background" && tab !== "title" && tab !== "accessory" && (
        <div className="mt-4 px-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {tab === "hair" ? "Hair Color" : tab === "eyes" ? "Eye Color" : "Outfit Color"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {getCurrentItemColors(tab).map((color) => {
              const currentColor = tab === "hair" ? avatar.hairColor : tab === "eyes" ? avatar.eyeColor : avatar.outfitColor;
              return (
                <button
                  key={color}
                  onClick={() => {
                    if (tab === "hair") handleColorChange("hair", color);
                    else if (tab === "eyes") handleColorChange("eyes", color);
                    else handleColorChange("outfit", color);
                  }}
                  className={cn(
                    "size-8 rounded-full border-2 transition-all",
                    currentColor === color
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        </div>
      )}

      {tab !== "title" && (
        <div className="mt-4 grid grid-cols-3 gap-2 px-5 sm:grid-cols-4">
          {tabItems.map((item) => {
            const owned = isOwned(item.id);
            const equipped = isEquipped(item.id);
            const affordable = canAfford(item.price);
            const style = item.id.split('-').pop() || 'default';

            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all",
                  equipped
                    ? "border-primary bg-card ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40",
                  item.premiumOnly && !owned && "opacity-80"
                )}
              >
                {/* Rarity indicator */}
                <div
                  className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: getRarityColor(item.rarity) }}
                />

                {/* Item preview using pixel sprite */}
                <div className="grid size-10 place-items-center">
                  <CosmeticSprite
                    type={item.type}
                    style={style}
                    color={item.colors[0]}
                    size={32}
                  />
                </div>

                <p className="text-[10px] font-semibold line-clamp-1 mt-1">{item.name || "None"}</p>

                {/* Status badge */}
                {item.premiumOnly && !owned ? (
                  <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary/15 text-primary">
                    <Sparkles className="size-2.5" />
                  </span>
                ) : !owned ? (
                  <span
                    className={cn(
                      "absolute right-1.5 top-1.5 inline-flex items-center rounded-full px-1 py-0.5 text-[8px] font-bold",
                      affordable ? "bg-card/90 text-foreground" : "bg-danger/20 text-danger"
                    )}
                  >
                    {item.price > 0 ? `${item.price}c` : "Free"}
                  </span>
                ) : equipped ? (
                  <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" />
                  </span>
                ) : null}

                {/* Lock overlay for premium */}
                {item.premiumOnly && !owned && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl bg-background/40 backdrop-blur-[1px]">
                    <Lock className="size-3 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === "title" && (
        <div className="mt-4 space-y-2 px-5">
          {tabItems.map((item) => {
            const owned = isOwned(item.id);
            const equipped = isEquipped(item.id);

            if (!item.name) return null;

            return (
              <button
                key={item.id}
                onClick={() => item.name && handleSelectItem(item.id)}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                  equipped
                    ? "border-primary bg-card ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getRarityColor(item.rarity) }}
                  />
                  <span className="font-semibold">{item.name}</span>
                </div>
                {!owned && !item.premiumOnly && (
                  <span
                    className={cn(
                      "text-xs font-bold",
                      canAfford(item.price) ? "text-muted-foreground" : "text-danger"
                    )}
                  >
                    {item.price}c
                  </span>
                )}
                {equipped && <Check className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}

      <PremiumDialog open={premiumOpen} onOpenChange={setPremiumOpen} />
    </div>
  );
}
