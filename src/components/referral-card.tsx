import { useState } from "react";
import { Gift, Share2, Copy, Check, Users, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  buildShareMessage,
  REFERRAL_MILESTONES,
  shareTargets,
  useReferrals,
  nextMilestone,
} from "@/lib/referrals";

function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }
  return Promise.resolve(false);
}

export function ReferralCard({ compact = false }: { compact?: boolean }) {
  const { stats, loading } = useReferrals();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-5 animate-pulse">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-3 h-8 w-40 rounded bg-muted" />
      </div>
    );
  }

  if (!stats.code) {
    return (
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Invite friends
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to get your personal invite link and earn rewards.
        </p>
      </div>
    );
  }

  const milestone = nextMilestone(stats.totalRewarded);
  const progressPct = milestone
    ? Math.min(100, Math.round((stats.totalRewarded / milestone.count) * 100))
    : 100;

  const handleCopy = async () => {
    const ok = await copyToClipboard(stats.inviteUrl);
    toast[ok ? "success" : "error"](ok ? "Invite link copied" : "Couldn't copy link");
  };

  return (
    <>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Invite friends
          </p>
          <Gift className="size-4 text-primary" />
        </div>
        <p className="mt-2 text-lg font-bold">Share Future Me</p>
        <p className="text-xs text-muted-foreground">
          You earn 50 coins + 30 XP per friend who joins. They get a starter bonus too.
        </p>

        {!compact && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat icon={<Users className="size-3.5" />} label="Joined" value={stats.totalJoined} />
            <Stat icon={<Coins className="size-3.5" />} label="Coins" value={stats.totalCoinsEarned} />
            <Stat icon={<Sparkles className="size-3.5" />} label="XP" value={stats.totalXpEarned} />
          </div>
        )}

        {milestone && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Next: {milestone.label}</span>
              <span>
                {stats.totalRewarded}/{milestone.count}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Reward: {milestone.reward}</p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 truncate rounded-xl border border-border bg-secondary px-3 py-2 font-mono text-xs">
            {stats.code}
          </div>
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            <Copy className="mr-1 size-3.5" /> Copy
          </Button>
        </div>

        <Button
          className="mt-3 h-11 w-full rounded-2xl text-sm font-semibold shadow-glow"
          onClick={() => setOpen(true)}
        >
          <Share2 className="mr-2 size-4" /> Share Future Me
        </Button>
      </div>

      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        url={stats.inviteUrl}
        code={stats.code}
      />
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-secondary p-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}

export function ShareDialog({
  open,
  onOpenChange,
  url,
  code,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const targets = shareTargets(url);

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      toast.success("Link copied — paste it in your story or DM");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy link");
    }
  };

  const handleNative = async () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "Future Me",
          text: buildShareMessage(url),
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      void handleCopy();
    }
  };

  const openSocial = async (href: string, copyFirst = false) => {
    if (copyFirst) {
      await copyToClipboard(url);
      toast.success("Link copied — paste it into your post");
    }
    if (typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Future Me</DialogTitle>
          <DialogDescription>
            Your code: <span className="font-mono font-semibold text-foreground">{code}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <ShareButton label="WhatsApp" emoji="💬" onClick={() => openSocial(targets.whatsapp)} />
          <ShareButton label="Messenger" emoji="📨" onClick={() => openSocial(targets.messenger)} />
          <ShareButton
            label="Instagram"
            emoji="📸"
            onClick={() => openSocial(targets.instagram, true)}
          />
          <ShareButton label="TikTok" emoji="🎵" onClick={() => openSocial(targets.tiktok, true)} />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={handleCopy}>
            {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button className="flex-1" onClick={handleNative}>
            <Share2 className="mr-2 size-4" /> More…
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          Instagram & TikTok don't accept direct web shares — we copy your link so you can paste it
          into a post or story.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ShareButton({
  label,
  emoji,
  onClick,
}: {
  label: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-3 text-sm font-semibold transition-colors hover:border-primary/40"
    >
      <span className="text-lg">{emoji}</span> {label}
    </button>
  );
}

export function ReferralMilestonesList({ unlocked }: { unlocked: number }) {
  return (
    <div className="space-y-2">
      {REFERRAL_MILESTONES.map((m) => {
        const done = unlocked >= m.count;
        return (
          <div
            key={m.count}
            className={`flex items-center justify-between rounded-2xl border p-3 ${
              done ? "border-primary/40 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-8 place-items-center rounded-xl text-xs font-bold ${
                  done ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                {m.count}
              </span>
              <div>
                <p className="text-sm font-semibold">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">{m.reward}</p>
              </div>
            </div>
            {done && <Check className="size-4 text-primary" />}
          </div>
        );
      })}
    </div>
  );
}