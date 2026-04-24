import { motion } from "framer-motion";
import { ArrowRight, Orbit, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "../app/router";

const stats = [
  { label: "Telemetry modes", value: "Mock + Live" },
  { label: "Auth system", value: "Clerk" },
  { label: "Product shell", value: "Production-ready" },
];

const features = [
  "Autonomous API failure detection",
  "Safe route, payload, and auth repair",
  "Real-time control plane for recovery operations",
];

export function IntroPage() {
  const { navigate } = useRouter();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-obsidian-bg text-text-primary">
      <div className="cinematic-bg" />
      <div className="landing-grid-pattern" />
      <div className="remorph-aura" />
      <div className="remorph-morph remorph-morph-left" />
      <div className="remorph-morph remorph-morph-right" />

      <div className="relative w-full px-4 pb-10 pt-4 sm:px-5 lg:px-7 2xl:px-10">
        <header className="landing-nav sticky top-3 z-40 flex items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-black/25 px-4 py-3 backdrop-blur-2xl sm:px-5">
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

          <nav className="hidden items-center gap-6 text-sm text-text-muted lg:flex">
            <button className="transition hover:text-white">Product</button>
            <button className="transition hover:text-white">Security</button>
            <button className="transition hover:text-white">Docs</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.05]"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="rounded-2xl border border-accent-live/24 bg-accent-live/12 px-4 py-2.5 text-sm font-semibold text-accent-live transition hover:bg-accent-live/16"
            >
              Get Started
            </button>
          </div>
        </header>

        <main className="grid min-h-[calc(100dvh-7rem)] items-center gap-10 py-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] 2xl:grid-cols-[minmax(0,0.86fr)_minmax(640px,1.14fr)]">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-[44rem]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent-ai" />
              Enterprise AI reliability
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.95] text-white sm:text-6xl xl:text-[5.7rem]">
              Self-healing infrastructure for modern APIs.
            </h1>
            <p className="mt-6 max-w-[40rem] text-lg leading-8 text-text-muted">
              ReMorph detects failures, repairs broken requests, and restores healthy traffic
              through a production-grade AI control plane.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center gap-2 rounded-2xl border border-accent-success/22 bg-accent-success/12 px-5 py-3.5 text-sm font-semibold text-accent-success transition hover:bg-accent-success/16"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.05]"
              >
                Sign In
              </button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="glass-card px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
                    {item.label}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative"
          >
            <div className="remorph-hero-backdrop" />
            <div className="remorph-hero-shadow" />

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="glass-panel remorph-hero-shell p-6 lg:p-7"
            >
              <div className="remorph-hero-glow" />
              <div className="remorph-hero-orbit remorph-hero-orbit-a" />
              <div className="remorph-hero-orbit remorph-hero-orbit-b" />

              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.45 }}
                  className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-live/18 bg-accent-live/10">
                    <ShieldCheck className="h-5 w-5 text-accent-live" />
                  </div>
                  <div className="mt-5 text-2xl font-semibold text-white">Trusted recovery surface</div>
                  <p className="mt-3 text-sm leading-7 text-text-muted">
                    Built for teams that need clear signals, rapid incident response, and
                    reliable API healing without operational clutter.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.45 }}
                  className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-success/18 bg-accent-success/10">
                    <TrendingUp className="h-5 w-5 text-accent-success" />
                  </div>
                  <div className="mt-5 text-2xl font-semibold text-white">Startup-ready UX</div>
                  <p className="mt-3 text-sm leading-7 text-text-muted">
                    A real product flow: intro, auth, platform entry, dashboard telemetry,
                    profile, settings, and production-style data surfaces.
                  </p>
                </motion.div>
              </div>

              <div className="mt-5 grid gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.26 + index * 0.08, duration: 0.4 }}
                    className="glass-card flex items-center gap-3 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-accent-live shadow-[0_0_14px_rgba(73,215,255,0.55)]" />
                    <span className="text-sm text-white">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.section>
        </main>

        <footer className="pb-4 text-center text-xs uppercase tracking-[0.28em] text-text-muted">
          ReMorph • self-healing API platform
        </footer>
      </div>
    </div>
  );
}
