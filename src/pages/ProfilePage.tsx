import { useUser } from "@clerk/react";
import { Panel } from "../components/layout/Panel";

export function ProfilePage() {
  const { user } = useUser();
  const displayName = user?.fullName ?? user?.firstName ?? "ReMorph User";
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? "No email on file";
  const displayAvatar = (user?.fullName?.[0] ?? user?.firstName?.[0] ?? "R").toUpperCase();

  return (
    <div className="w-full px-4 pb-8 pt-4 sm:px-5 lg:px-7 2xl:px-10">
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <Panel eyebrow="Profile" title="Account Identity" contentClassName="px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-live/12 text-lg font-semibold text-accent-live">
              {displayAvatar}
            </div>
            <div>
              <div className="text-xl font-semibold text-white">{displayName}</div>
              <div className="mt-1 text-sm text-text-muted">{displayEmail}</div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <ProfileRow label="Organization" value="ReMorph" />
            <ProfileRow label="Role" value="Platform Operator" />
            <ProfileRow label="Account ID" value={user?.id ?? "Clerk session pending"} />
            <ProfileRow label="Email verified" value={user?.primaryEmailAddress?.verification?.status ?? "unknown"} />
          </div>
        </Panel>

        <Panel eyebrow="Workspace" title="Team + Access" contentClassName="px-5 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Tile title="Organization team" body="Control access, workspace members, and admin roles." />
            <Tile title="Preferences" body="Theme, notifications, telemetry defaults, and product behavior." />
            <Tile title="Security" body="Email verification, password controls, and active session awareness through Clerk." />
            <Tile title="Account details" body="Signed-in user identity, workspace ownership, and platform role visibility." />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{label}</div>
      <div className="mt-2 text-sm text-white">{value}</div>
    </div>
  );
}

function Tile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-3 text-sm leading-7 text-text-muted">{body}</div>
    </div>
  );
}
