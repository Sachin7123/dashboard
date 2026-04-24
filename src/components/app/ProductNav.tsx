import { SignOutButton, useUser } from "@clerk/react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Orbit, Search, Settings, User, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, type AppPath } from "../../app/router";

const navItems: Array<{ label: string; path: AppPath }> = [
  { label: "Platform", path: "/platform" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
];

export function ProductNav() {
  const { path, navigate } = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const identityLetter = useMemo(() => {
    const source = user?.fullName?.trim() || user?.firstName?.trim() || "ReMorph";
    return source.charAt(0).toUpperCase() || "R";
  }, [user?.firstName, user?.fullName]);

  return (
    <header className="sticky top-3 z-40 mx-4 mt-4 rounded-[24px] border border-white/8 bg-black/25 px-4 py-3 backdrop-blur-2xl sm:mx-5 lg:mx-7 2xl:mx-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate("/platform")} className="flex items-center gap-3">
          <div className="orb-badge h-10 w-10 rounded-xl">
            <Orbit className="h-4 w-4 text-accent-ai" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold tracking-[0.14em] uppercase text-white">
              ReMorph
            </div>
          </div>
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                path === item.path
                  ? "bg-white/[0.08] text-white"
                  : "text-text-muted hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-text-muted md:flex">
            <Search className="h-3.5 w-3.5" />
            Search logs, requests, alerts
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-text-muted transition hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 transition hover:bg-white/[0.05]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-live/12 text-xs font-semibold text-accent-live">
                {identityLetter}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium text-white">
                  {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "ReMorph"}
                </div>
                <div className="text-xs text-text-muted">ReMorph</div>
              </div>
            </button>

            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[250px] rounded-[24px] border border-white/8 bg-[#0c0f14]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                >
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
                    <div className="text-sm font-medium text-white">
                      {user?.fullName ?? "ReMorph User"}
                    </div>
                    <div className="mt-1 text-xs text-text-muted">
                      {user?.primaryEmailAddress?.emailAddress ?? "Set your Clerk email"}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <DropdownItem icon={User} label="Profile" onClick={() => { setOpen(false); navigate("/profile"); }} />
                    <DropdownItem icon={Settings} label="Settings" onClick={() => { setOpen(false); navigate("/settings"); }} />
                    <DropdownItem icon={LayoutDashboard} label="Dashboard" onClick={() => { setOpen(false); navigate("/dashboard"); }} />
                    <SignOutButton>
                      <button
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text-muted transition hover:bg-white/[0.05] hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </SignOutButton>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-text-muted transition hover:bg-white/[0.05] hover:text-white"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
