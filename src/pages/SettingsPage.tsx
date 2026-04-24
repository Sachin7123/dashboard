import { useState } from "react";
import { usePreferences } from "../app/preferences";
import { Panel } from "../components/layout/Panel";

export function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();
  const [saved, setSaved] = useState(false);

  function saveSettings() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="w-full px-4 pb-8 pt-4 sm:px-5 lg:px-7 2xl:px-10">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Panel eyebrow="Settings" title="Platform Preferences" contentClassName="px-5 py-5">
          <div className="space-y-4">
            <SettingSelect
              label="Theme preference"
              value={preferences.theme}
              options={[
                { label: "Obsidian", value: "obsidian" },
                { label: "Midnight", value: "midnight" },
              ]}
              onChange={(value) => updatePreferences({ theme: value as "obsidian" | "midnight" })}
            />
            <ToggleRow
              label="Email + in-app notifications"
              description="Receive operational alerts and account notices."
              checked={preferences.notifications}
              onChange={(checked) => updatePreferences({ notifications: checked })}
            />
            <ToggleRow
              label="Security digest"
              description="Keep Clerk account security and session notices visible."
              checked={preferences.securityDigest}
              onChange={(checked) => updatePreferences({ securityDigest: checked })}
            />
            <ToggleRow
              label="Live telemetry by default"
              description="Launch the dashboard with the live ingestion toggle enabled."
              checked={preferences.liveTelemetry}
              onChange={(checked) => updatePreferences({ liveTelemetry: checked })}
            />
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel eyebrow="Security" title="Account Controls" contentClassName="px-5 py-5">
            <div className="space-y-3">
              <SettingsTile title="Session management" body="Active Clerk sessions are managed through your signed-in account." />
              <SettingsTile title="Password + MFA" body="Use Clerk account security settings to manage password and additional verification." />
              <SettingsTile title="Account preferences" body="ReMorph preferences persist locally and apply across product pages." />
            </div>
          </Panel>

          <Panel eyebrow="Save" title="Update Settings" contentClassName="px-5 py-5">
            <button
              onClick={saveSettings}
              className="w-full rounded-2xl border border-accent-live/24 bg-accent-live/12 px-4 py-3 text-sm font-semibold text-accent-live transition hover:bg-accent-live/16"
            >
              Save preferences
            </button>
            {saved ? (
              <div className="mt-3 rounded-2xl border border-accent-success/20 bg-accent-success/10 px-4 py-3 text-sm text-accent-success">
                ReMorph settings updated.
              </div>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-2 text-sm leading-7 text-text-muted">{description}</div>
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-13 rounded-full transition ${
            checked ? "bg-accent-live/70" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              checked ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function SettingSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-sm font-semibold text-white">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/8 bg-black/22 px-4 py-3 text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SettingsTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-text-muted">{body}</div>
    </div>
  );
}
