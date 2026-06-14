import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { useAppState } from "@/lib/store";

const FEATURES = [
  "Exclusive avatar & pet cosmetics",
  "Aurora & cosmic themes",
  "Advanced 10-year projections",
  "AI coach & personalized advice",
  "Unlimited history",
];

export function PremiumDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { setPremium } = useAppState();

  const handleActivatePremium = async () => {
    await setPremium(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden border-border bg-card">
        <DialogHeader>
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/15">
            <Sparkles className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Future Me Premium</DialogTitle>
          <DialogDescription className="text-sm">
            Unlock everything that makes your future self iconic.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-2 space-y-2 text-sm">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="size-4 text-primary" /> {f}
            </li>
          ))}
        </ul>
        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleActivatePremium}
            className="h-12 w-full rounded-2xl shadow-glow"
          >
            Start free trial — $7.99/mo
          </Button>
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Maybe later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}