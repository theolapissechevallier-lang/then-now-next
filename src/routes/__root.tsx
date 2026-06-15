import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode, useState } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { HabitProvider } from "@/lib/habit-store";
import { PetProvider } from "@/lib/pet-store";
import { AvatarProvider } from "@/lib/avatar-store";
import { GoalProvider } from "@/lib/goals-store";
import { AchievementsProvider } from "@/lib/achievements-store";
import { JournalProvider } from "@/lib/journal-store";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1a1f" },
      { title: "Future Me — See who you become" },
      {
        name: "description",
        content:
          "Turn today's habits into your future self. Daily tracking, projections, and brutally honest reality checks.",
      },
      { property: "og:title", content: "Future Me — See who you become" },
      {
        property: "og:description",
        content:
          "Turn today's habits into your future self. Daily tracking, projections, and brutally honest reality checks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Future Me — See who you become" },
      {
        name: "twitter:description",
        content:
          "Turn today's habits into your future self. Daily tracking, projections, and brutally honest reality checks.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bbab96c3-7ab6-43c8-b13f-9c303e65acee/id-preview-4c7efa27--42e5410e-15f0-423f-8ff4-0ecb211a3955.lovable.app-1781397696083.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bbab96c3-7ab6-43c8-b13f-9c303e65acee/id-preview-4c7efa27--42e5410e-15f0-423f-8ff4-0ecb211a3955.lovable.app-1781397696083.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HabitProvider>
          <PetProvider>
            <AvatarProvider>
              <GoalProvider>
                <AchievementsProvider>
                  <JournalProvider>
                    <AuthLoadingGate>
                      <AppShell>
                        <Outlet />
                      </AppShell>
                    </AuthLoadingGate>
                  </JournalProvider>
                </AchievementsProvider>
              </GoalProvider>
              <Toaster position="top-center" theme="dark" />
            </AvatarProvider>
          </PetProvider>
        </HabitProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthLoadingGate({ children }: { children: ReactNode }) {
  const { loading, isAvailable } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // After a short delay, if auth is still loading, show prompt
    const timer = setTimeout(() => {
      setShowAuthPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading && showAuthPrompt && isAvailable) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="animate-pulse space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/20" />
            <div className="h-4 w-32 mx-auto rounded bg-muted" />
            <div className="h-3 w-24 mx-auto rounded bg-muted" />
          </div>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              window.location.href = "/auth";
            }}
          >
            Sign in to sync data
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
