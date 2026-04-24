import { Orbit } from "lucide-react";
import { AuthCard } from "../components/app/AuthCard";
import { useRouter } from "../app/router";

export function AuthPage({
  mode,
}: {
  mode: "login" | "signup" | "forgot" | "verify";
}) {
  const { navigate } = useRouter();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-obsidian-bg text-text-primary">
      <div className="cinematic-bg" />
      <div className="landing-grid-pattern" />

      <div className="relative flex min-h-dvh flex-col px-4 pb-10 pt-4 sm:px-5 lg:px-7 2xl:px-10">
        <header className="landing-nav flex items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-black/25 px-4 py-3 backdrop-blur-2xl sm:px-5">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="orb-badge h-10 w-10 rounded-xl">
              <Orbit className="h-4 w-4 text-accent-ai" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-[0.14em] uppercase text-white">
                ReMorph
              </div>
            </div>
          </button>
        </header>

        <main className="grid flex-1 items-center gap-8 py-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)]">
          <section className="max-w-[42rem]">
            <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">Authentication</div>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.96] text-white sm:text-6xl">
              Secure access to the ReMorph control plane.
            </h1>
            <p className="mt-5 text-base leading-8 text-text-muted">
              Authenticate into your workspace, manage your organization, and enter the
              self-healing API platform with a clean enterprise-grade flow.
            </p>
          </section>

          <div className="flex justify-end">
            <AuthCard mode={mode} />
          </div>
        </main>
      </div>
    </div>
  );
}
