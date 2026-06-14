import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — Future Me" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signUp, signIn, error, loading, clearError } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === "signup") {
      const result = await signUp(email, password);
      if (!result.error) {
        setSubmitted(true);
      }
    } else {
      await signIn(email, password);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-primary/15 mx-auto">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
          </p>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => {
              setSubmitted(false);
              setMode("signin");
            }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Future Me
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to sync your progress across devices."
              : "Start building your future self today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="h-12 pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl text-base shadow-glow"
          >
            {loading ? (
              "Loading..."
            ) : mode === "signin" ? (
              <>
                Sign in <ArrowRight className="ml-1 size-4" />
              </>
            ) : (
              <>
                Create account <ArrowRight className="ml-1 size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              clearError();
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <span className="font-semibold text-primary">Sign up</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="font-semibold text-primary">Sign in</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Continue without account (local-only mode)
          </button>
        </div>
      </div>
    </div>
  );
}
