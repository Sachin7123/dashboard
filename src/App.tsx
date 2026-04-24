import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/react";
import { useDeferredValue, useEffect, useMemo } from "react";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { hasClerkKey } from "./app/clerk";
import { PreferencesProvider } from "./app/preferences";
import { RouterProvider, useRouter } from "./app/router";
import { ProductNav } from "./components/app/ProductNav";
import { IntroPage } from "./pages/IntroPage";
import { AuthPage } from "./pages/AuthPage";
import { PlatformPage } from "./pages/PlatformPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { useDashboardRuntime } from "./hooks/useDashboardRuntime";

export default function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <RouterProvider>
          {hasClerkKey ? (
            <>
              <ClerkLoading>
                <LoadingShell label="Loading secure ReMorph session" />
              </ClerkLoading>
              <ClerkLoaded>
                <AppShell />
              </ClerkLoaded>
            </>
          ) : (
            <MissingClerkSetup />
          )}
        </RouterProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

function AppShell() {
  const { path, navigate } = useRouter();
  const { isSignedIn } = useAuth();
  const runtime = useDashboardRuntime();
  const deferredEvents = useDeferredValue(runtime.snapshot?.events ?? []);

  const selectedEvent = useMemo(() => {
    if (!runtime.snapshot) return null;
    return (
      deferredEvents.find((event) => event.id === runtime.selectedEventId) ??
      deferredEvents[0] ??
      null
    );
  }, [deferredEvents, runtime.selectedEventId, runtime.snapshot]);

  const workflows = runtime.snapshot?.workflows ?? [];
  const activeWorkflow =
    !selectedEvent
      ? workflows[0] ?? null
      : (
          workflows.find(
            (workflow) =>
              workflow.scenario_type === selectedEvent.type &&
              workflow.agent_type === "adaptive",
          ) ??
          workflows.find((workflow) => workflow.scenario_type === selectedEvent.type) ??
          workflows[0] ??
          null
        );

  useEffect(() => {
    const titleMap: Record<string, string> = {
      "/": "ReMorph",
      "/login": "Sign In | ReMorph",
      "/signup": "Create Account | ReMorph",
      "/forgot-password": "Password Reset | ReMorph",
      "/verify-email": "Verify Email | ReMorph",
      "/platform": "Platform | ReMorph",
      "/dashboard": "Dashboard | ReMorph",
      "/profile": "Profile | ReMorph",
      "/settings": "Settings | ReMorph",
    };
    document.title = titleMap[path] ?? "ReMorph";
  }, [path]);

  useEffect(() => {
    const protectedRoute = ["/platform", "/dashboard", "/profile", "/settings"].includes(path);
    if (protectedRoute && !isSignedIn) {
      navigate("/login");
    }
  }, [isSignedIn, navigate, path]);

  if (path === "/") return <IntroPage />;
  if (path === "/login") return <AuthPage mode="login" />;
  if (path === "/signup") return <AuthPage mode="signup" />;
  if (path === "/forgot-password") return <AuthPage mode="forgot" />;
  if (path === "/verify-email") return <AuthPage mode="verify" />;

  if (!isSignedIn) return <AuthPage mode="login" />;

  if (path === "/platform") {
    return (
      <>
        <ProductNav />
        <PlatformPage
          snapshot={runtime.snapshot}
          event={selectedEvent}
          workflow={activeWorkflow}
          onEnterDashboard={() => navigate("/dashboard")}
          hideHeader
        />
      </>
    );
  }

  if (path === "/dashboard") {
    return (
      <>
        <ProductNav />
        <DashboardPage
          snapshot={runtime.snapshot}
          selectedEvent={selectedEvent}
          selectedEventId={runtime.selectedEventId}
          setSelectedEventId={runtime.setSelectedEventId}
          isLoading={runtime.isLoading}
          errorMessage={runtime.errorMessage}
          engineState={runtime.engineState}
          isLiveMode={runtime.isLiveMode}
          setIsLiveMode={runtime.setIsLiveMode}
        />
      </>
    );
  }

  if (path === "/profile") {
    return (
      <>
        <ProductNav />
        <ProfilePage />
      </>
    );
  }

  return (
    <>
      <ProductNav />
      <SettingsPage />
    </>
  );
}

function LoadingShell({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-obsidian-bg text-text-primary">
      <div className="glass-panel px-8 py-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">Loading</div>
        <div className="mt-3 text-lg font-semibold text-white">{label}</div>
      </div>
    </div>
  );
}

function MissingClerkSetup() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-obsidian-bg px-4 text-text-primary">
      <div className="glass-panel max-w-xl p-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">Clerk Setup Required</div>
        <h1 className="mt-4 text-3xl font-semibold text-white">Add your ReMorph Clerk key.</h1>
        <p className="mt-4 text-sm leading-7 text-text-muted">
          Set <code className="rounded bg-white/[0.04] px-2 py-1 text-white">VITE_CLERK_PUBLISHABLE_KEY</code> in
          <code className="ml-1 rounded bg-white/[0.04] px-2 py-1 text-white">.env.local</code> to enable production auth.
        </p>
      </div>
    </div>
  );
}
