import { useEffect, useMemo, useState } from 'react';
import { getTelemetryConfig, getTelemetrySnapshot } from '../services/telemetry';
import type { DashboardSnapshot, EngineState } from '../types/remorph';

export function useDashboardRuntime() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [engineState, setEngineState] = useState<EngineState>('idle');
  const [isLiveMode, setIsLiveMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    let cycleTimers: number[] = [];
    const controller = new AbortController();

    const run = async () => {
      try {
        setIsLoading((current) => current && !snapshot);
        const nextSnapshot = await getTelemetrySnapshot({ limit: 80, signal: controller.signal });
        if (!mounted) return;

        setSnapshot(nextSnapshot);
        setErrorMessage(null);
        setSelectedEventId((current) => {
          if (current && nextSnapshot.events.some((event) => event.id === current)) {
            return current;
          }
          return nextSnapshot.events[0]?.id ?? null;
        });

        const lead = nextSnapshot.events[0];
        cycleTimers.forEach((timer) => window.clearTimeout(timer));
        cycleTimers = [];

        if (lead) {
          setEngineState('thinking');
          cycleTimers.push(window.setTimeout(() => setEngineState('healing'), 650));
          cycleTimers.push(window.setTimeout(() => setEngineState(lead.status === 'healed' ? 'success' : 'thinking'), 1450));
          cycleTimers.push(window.setTimeout(() => setEngineState('idle'), 2800));
        } else {
          setEngineState('idle');
        }
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load runtime telemetry');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    const { pollMs } = getTelemetryConfig();
    const interval = window.setInterval(() => {
      if (isLiveMode) {
        void run();
      }
    }, pollMs);

    return () => {
      mounted = false;
      controller.abort();
      cycleTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(interval);
    };
  }, [isLiveMode]);

  const selectedEvent = useMemo(() => {
    if (!snapshot) return null;
    return snapshot.events.find((event) => event.id === selectedEventId) ?? snapshot.events[0] ?? null;
  }, [selectedEventId, snapshot]);

  return {
    snapshot,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    isLoading,
    errorMessage,
    engineState,
    isLiveMode,
    setIsLiveMode,
  };
}
