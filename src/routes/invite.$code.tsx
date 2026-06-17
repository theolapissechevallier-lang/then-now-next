import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Gift, Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  checkReferralCode,
  claimReferral,
  setPendingReferral,
} from "@/lib/referrals";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Join Future Me — invite ${params.code}` },
      {
        name: "description",
        content: "A friend invited you to build your Future Me. Claim your starter bonus.",
      },
      { property: "og:title", content: "You've been invited to Future Me" },
      {
        property: "og:description",
        content: "Build the best version of yourself — claim 25 coins + 15 XP starter bonus.",
      },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const cleanCode = (code ?? "").toUpperCase().trim();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await checkReferralCode(cleanCode);
      if (alive) setStatus(ok ? "valid" : "invalid");
    })();
    return () => {
      alive = false;
    };
  }, [cleanCode]);

  useEffect(() => {
    if (authLoading || status !== "valid" || !user || claiming) return;
    setClaiming(true);
    (async () => {
      const res = await claimReferral(cleanCode);
      if (res.ok) {
        toast.success("Invite redeemed! +25 coins · +15 XP");
      } else if (res.reason === "already_redeemed") {
        toast.info("You've already redeemed an invite code.");
      } else if (res.reason === "self_referral") {
        toast.info("You can't redeem your own invite.");
      } else if (res.reason && res.reason !== "code_not_found") {
        toast.error("Couldn't claim invite — try again later.");
      }
      navigate({ to: "/" });
    })();
  }, [authLoading, status, user, claiming, cleanCode, navigate]);

  const handleStart = () => {
    setPendingReferral(cleanCode);
    navigate({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary/15">
        <Gift className="size-8 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">
        You've been invited to{" "}
        <span className="text-gradient-future">Future Me</span>
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Build the best version of yourself — track habits, raise your pet, and project your future.
      </p>

      <div className="mt-6 w-full max-w-sm rounded-3xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your starter bonus
        </p>
        <div className="mt-3 flex items-center justify-around">
          <div className="flex items-center gap-2">
            <Coins className="size-5 text-accent" />
            <span className="text-xl font-bold">+25</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="text-xl font-bold">+15 XP</span>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">Code: {cleanCode}</p>
      </div>

      <div className="mt-6 w-full max-w-sm space-y-2">
        {status === "checking" && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Checking invite…
          </div>
        )}
        {status === "invalid" && (
          <p className="text-sm text-danger">This invite code is invalid or expired.</p>
        )}
        {status === "valid" && !user && (
          <Button className="h-12 w-full rounded-2xl text-base font-semibold shadow-glow" onClick={handleStart}>
            Claim & start
          </Button>
        )}
        {claiming && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Claiming your bonus…
          </div>
        )}
        <Button asChild variant="ghost" className="w-full">
          <Link to="/">Skip for now</Link>
        </Button>
      </div>
    </div>
  );
}