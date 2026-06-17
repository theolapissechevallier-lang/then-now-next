import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, LogOut, User, Cloud, CloudOff, Shield, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/app-shell";
import { ReferralCard, ReferralMilestonesList } from "@/components/referral-card";
import { useReferrals } from "@/lib/referrals";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Future Me" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut, isAvailable, loading } = useAuth();
  const { state, reset, loading: dataLoading } = useAppState();
  const { stats: referralStats } = useReferrals();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleResetData = () => {
    reset();
    toast.success("All data cleared");
  };

  return (
    <div>
      <ScreenHeader
        eyebrow="Settings"
        title="Account & Data"
        subtitle="Manage your account and local data."
      />

      <section className="mt-6 px-5 space-y-4">
        {/* Account status */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary">
                {user ? (
                  <User className="size-5 text-primary" />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
              </span>
              <div>
                <p className="font-semibold">{user ? "Signed in" : "Local mode"}</p>
                <p className="text-sm text-muted-foreground">
                  {user ? user.email : "Sign in to sync across devices"}
                </p>
              </div>
            </div>
          </div>

          {user ? (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          ) : (
            <Button asChild className="mt-4 w-full">
              <Link to="/auth">
                Sign in to sync
              </Link>
            </Button>
          )}
        </div>

        {/* Sync status */}
        {isAvailable && (
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary">
                {user ? (
                  <Cloud className="size-5 text-primary" />
                ) : (
                  <CloudOff className="size-5 text-muted-foreground" />
                )}
              </span>
              <div>
                <p className="font-semibold">Cloud sync</p>
                <p className="text-sm text-muted-foreground">
                  {user
                    ? "Your data syncs automatically"
                    : "Sign in to enable cloud sync"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats summary */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your data
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-2xl font-bold">{state.coins.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Coins</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-2xl font-bold">{state.profile.streak}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-2xl font-bold">{state.inventory.length}</p>
              <p className="text-xs text-muted-foreground">Items owned</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-2xl font-bold">{Object.keys(state.entries).length}</p>
              <p className="text-xs text-muted-foreground">Days tracked</p>
            </div>
          </div>
        </div>

        {/* Referrals */}
        {user && (
          <>
            <ReferralCard />
            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Referral milestones
              </p>
              <div className="mt-3">
                <ReferralMilestonesList unlocked={referralStats.totalRewarded} />
              </div>
            </div>
          </>
        )}

        {/* Danger zone */}
        <div className="rounded-3xl border border-danger/30 bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-danger/10">
              <Shield className="size-5 text-danger" />
            </span>
            <div>
              <p className="font-semibold">Danger zone</p>
              <p className="text-sm text-muted-foreground">
                Reset all local data. This cannot be undone.
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4 w-full">
                <Trash2 className="mr-2 size-4" />
                Reset all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all your local progress, including habits, coins, streak, and purchases.
                  {user && " Your cloud data will remain and can be synced again after reset."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData}>
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <p className="px-5 mt-8 pb-6 text-center text-xs text-muted-foreground">
        Future Me v2.0 — Building your tomorrow, today.
      </p>
    </div>
  );
}
