/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface PreferencesState {
  theme: "obsidian" | "midnight";
  notifications: boolean;
  securityDigest: boolean;
  liveTelemetry: boolean;
}

interface PreferencesContextValue {
  preferences: PreferencesState;
  updatePreferences: (patch: Partial<PreferencesState>) => void;
}

const STORAGE_KEY = "remorph.preferences";

const defaultPreferences: PreferencesState = {
  theme: "obsidian",
  notifications: true,
  securityDigest: true,
  liveTelemetry: true,
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesState>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultPreferences, ...(JSON.parse(raw) as Partial<PreferencesState>) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences]);

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences(patch: Partial<PreferencesState>) {
        setPreferences((current) => ({ ...current, ...patch }));
      },
    }),
    [preferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }
  return context;
}
