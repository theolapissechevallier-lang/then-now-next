import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Pencil, ShoppingBag, X } from "lucide-react";
import { PixelPet, PetStats } from "@/components/pixel-pet";
import { FoodSprite } from "@/components/pixel-sprites";
import { CoinPill } from "@/components/coin-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePet } from "@/lib/pet-store";
import { useHabits } from "@/lib/habit-store";
import { cn } from "@/lib/utils";
import {
  getPetStage,
  getLevelProgress,
  DEFAULT_PET_SPECIES,
  DEFAULT_FOODS,
  type PetSpecies,
  type FoodItem,
} from "@/lib/pet-types";

export const Route = createFileRoute("/pet")({
  head: () => ({ meta: [{ title: "Your Pet — Future Me" }] }),
  component: PetPage,
});

function PetPage() {
  const {
    pet,
    species,
    foods,
    ownedFoods,
    loading,
    hasPet,
    error,
    createPet,
    feedPet,
    buyFood,
    renamePet,
  } = usePet();
  const { getTodaysCoins } = useHabits();
  const [showCreation, setShowCreation] = useState(false);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [feedingFood, setFeedingFood] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground">Loading pet...</p>
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
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!hasPet || showCreation) {
    return (
      <PetCreationFlow
        species={species}
        onCreatePet={async (name, speciesId) => {
          const success = await createPet(name, speciesId);
          if (success) {
            setShowCreation(false);
          }
          return success;
        }}
        onCancel={hasPet ? () => setShowCreation(false) : undefined}
      />
    );
  }

  if (!pet) return null;

  const progress = getLevelProgress(pet.xp);
  const stage = getPetStage(pet.xp);
  const coins = getTodaysCoins();

  const handleFeed = async (food: FoodItem) => {
    if (food.premiumOnly) {
      return;
    }

    const owned = ownedFoods.find(f => f.id === food.id);
    if (!owned || owned.quantity < 1) {
      return;
    }

    setFeedingFood(food.id);
    await feedPet(food.id);
    setFeedingFood(null);
  };

  const handleBuy = async (food: FoodItem) => {
    if (food.premiumOnly) {
      return;
    }
    await buyFood(food.id);
  };

  const handleRename = async () => {
    if (name.trim()) {
      await renamePet(name.trim());
    }
    setEditName(false);
  };

  return (
    <div className="pb-8">
      <header className="flex items-center justify-between px-5 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Companion
        </p>
        <CoinPill value={coins} />
      </header>

      <section className="mt-4 px-5">
        <div
          className="relative overflow-hidden rounded-3xl border border-border p-6"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, oklch(0.32 0.08 180 / 0.5), transparent 60%), var(--color-card)",
          }}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {editName ? (
                <form onSubmit={(e) => { e.preventDefault(); handleRename(); }} className="flex gap-2">
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 16))}
                    placeholder={pet.name}
                    className="h-9 bg-secondary"
                  />
                  <Button size="sm" type="submit">Save</Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setEditName(false)}>
                    <X className="size-4" />
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => { setName(pet.name); setEditName(true); }}
                  className="flex items-center gap-1.5 text-2xl font-bold"
                >
                  {pet.name}
                  <Pencil className="size-4 text-muted-foreground" />
                </button>
              )}
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span className="capitalize">{stage}</span> · Level {pet.level}
              </p>
            </div>
          </div>

          <div className="mt-4 grid place-items-center">
            <div className="relative">
              <PixelPet
                species={pet.species}
                stage={stage}
                mood={pet.mood}
                size={180}
              />
              {pet.mood === "excited" && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                  ✨
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Evolution Progress</span>
              <span className="tabular-nums">{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${progress.progress * 100}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {progress.current} / {progress.required} XP
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <PetStats
              hunger={pet.hunger}
              happiness={pet.happiness}
              energy={pet.energy}
              xp={pet.xp}
              level={pet.level}
              stage={stage}
              size="md"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Food Inventory
          </h3>
          <p className="text-xs text-muted-foreground">Feed to restore stats</p>
        </div>

        {(ownedFoods.length === 0) ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No food yet!</p>
            <p className="mt-1 text-xs text-muted-foreground">Buy some below to feed your pet.</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {ownedFoods.map(food => (
              <button
                key={food.id}
                onClick={() => handleFeed(food)}
                disabled={feedingFood === food.id}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-2 text-center transition-all",
                  "hover:border-primary/40 hover:bg-card/80",
                  feedingFood === food.id && "opacity-50"
                )}
              >
                <FoodSprite id={food.id} size={32} />
                <p className="text-[10px] font-semibold">{food.name}</p>
                <p className="text-[9px] text-muted-foreground">x{food.quantity}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 px-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Buy Food
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {foods.filter(f => !f.premiumOnly).map(food => {
            const owned = ownedFoods.find(f => f.id === food.id);
            return (
              <button
                key={food.id}
                onClick={() => handleBuy(food)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
                )}
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary">
                  <FoodSprite id={food.id} size={32} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{food.name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    +{food.hungerValue} H·{food.happinessValue} J·{food.energyValue} E
                  </p>
                  {owned && (
                    <p className="mt-0.5 text-[9px] text-primary">x{owned.quantity}</p>
                  )}
                </div>
                <div className="text-right">
                  <CoinPill value={food.price} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Premium Foods
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="size-3" /> Premium
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {foods.filter(f => f.premiumOnly).map(food => (
            <div
              key={food.id}
              className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card p-4 opacity-60"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">
                {food.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{food.name}</p>
                <p className="text-[10px] text-muted-foreground">{food.description}</p>
                <p className="mt-1 text-[10px] text-primary">Premium unlocks soon</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <Button asChild variant="secondary" className="h-12 w-full rounded-2xl">
          <a href="/shop">
            <ShoppingBag className="mr-2 size-4" />
            Shop pet cosmetics
          </a>
        </Button>
      </section>
    </div>
  );
}

function PetCreationFlow({
  species,
  onCreatePet,
  onCancel,
}: {
  species: PetSpecies[];
  onCreatePet: (name: string, speciesId: string) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState<"species" | "name">("species");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const selected = species.find(s => s.id === selectedSpecies);

  const handleCreate = async () => {
    if (!selectedSpecies || !name.trim()) return;
    setCreating(true);
    await onCreatePet(name.trim(), selectedSpecies);
    setCreating(false);
  };

  return (
    <div className="px-5 pt-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          New Companion
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {step === "species" ? "Choose your companion" : "Name your companion"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "species"
            ? "Pick a species that resonates with you"
            : "Give your new friend a special name"}
        </p>
      </header>

      {step === "species" && (
        <section className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {species.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecies(s.id)}
                className={cn(
                  "relative flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all",
                  selectedSpecies === s.id
                    ? "border-primary bg-card shadow-lg"
                    : "border-border bg-card/50 hover:border-primary/40"
                )}
              >
                {s.rarity === "rare" && (
                  <span className="absolute right-2 top-2 text-xs text-primary">Rare</span>
                )}
                <div className="grid size-20 place-items-center rounded-2xl bg-secondary">
                  <PixelPet species={s.id} stage="baby" mood="happy" size={64} />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{s.rarity}</p>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <Button
              className="h-12 w-full rounded-2xl"
              disabled={!selectedSpecies}
              onClick={() => setStep("name")}
            >
              Continue
            </Button>
            {onCancel && (
              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </section>
      )}

      {step === "name" && selected && (
        <section className="mt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="grid size-32 place-items-center rounded-3xl bg-secondary">
              <PixelPet species={selected.id} stage="baby" mood="excited" size={128} />
            </div>
            <p className="text-lg font-semibold">{selected.name}</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
            className="mt-6 space-y-4"
          >
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 16))}
              placeholder="Enter a name..."
              className="h-12 text-center text-lg"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setStep("species")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!name.trim() || creating}
              >
                {creating ? "Creating..." : "Create Companion"}
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
