import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
  const [oauthLoading, setOauthLoading] = useState<null | "google" | "apple">(null);

  const handleGoogle = async () => {
    setOauthLoading("google");
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) {
        toast.error("Google sign-in failed. Please try again.");
        setOauthLoading(null);
      }
      // If redirected, browser navigates away; nothing else to do.
    } catch (e) {
      toast.error("Google sign-in failed.");
      setOauthLoading(null);
    }
  };

  const handleApple = () => {
    toast.info(
      "Apple Sign-In coming soon. We're finalising the Apple Developer setup before enabling it.",
    );
  };

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

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span className="uppercase tracking-widest">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full rounded-2xl"
            onClick={handleGoogle}
            disabled={oauthLoading !== null || loading}
          >
            <GoogleIcon className="mr-2 size-4" />
            {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full rounded-2xl opacity-70"
            onClick={handleApple}
            disabled
            title="Coming soon"
          >
            <AppleIcon className="mr-2 size-4" />
            Continue with Apple (soon)
          </Button>
        </div>

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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.6 4.5 10.2 8.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c4.9 0 9.4-1.8 12.8-4.8l-5.9-5c-2 1.4-4.5 2.3-6.9 2.3-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.9 39.4 16.4 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l5.9 5C40.4 35.4 43.5 30.1 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.32-.06-.016-.05-.05-.32-.05-.6 0-1.14.55-2.27 1.17-2.99.78-.94 2.09-1.64 3.18-1.7.06.2.18.46.18.7zM21.06 17.27c-.55 1.28-.81 1.85-1.51 2.98-.98 1.58-2.37 3.55-4.08 3.57-1.54.02-1.94-.99-4.03-.98-2.09.01-2.53 1-4.06.98-1.71-.02-3.03-1.81-4.01-3.4C.62 17.18-.08 12.93 1.84 10.04 3.2 7.97 5.36 6.77 7.38 6.77c2.05 0 3.34 1.13 5.04 1.13 1.64 0 2.64-1.13 5.01-1.13 1.79 0 3.69.97 5.05 2.65-4.45 2.43-3.73 8.78-1.42 7.85z" />
    </svg>
  );
}
