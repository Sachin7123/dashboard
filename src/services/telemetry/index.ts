import { MockTelemetryService } from './mockTelemetryService';
import { RealTelemetryService } from './realTelemetryService';
import type { DashboardSnapshot, TelemetryRequestOptions, TelemetryService } from '../../types/remorph';

type BackendMode = 'auto' | 'mock' | 'real';

const mockService = new MockTelemetryService();

function normalizeMode(value?: string): BackendMode {
  const normalized = String(value ?? 'auto').toLowerCase();
  if (normalized === 'mock' || normalized === 'local') return 'mock';
  if (normalized === 'real' || normalized === 'remote') return 'real';
  return 'auto';
}

function getBackendUrl() {
  return (import.meta.env.VITE_REMORPH_BACKEND_URL as string | undefined)
    ?? (import.meta.env.VITE_TELEMETRY_URL as string | undefined)
    ?? 'http://localhost:8000/api/telemetry';
}

export function getTelemetryConfig() {
  const pollMs = Number(import.meta.env.VITE_REMORPH_REFRESH_MS ?? import.meta.env.VITE_TELEMETRY_POLL_MS ?? 4500);

  return {
    mode: normalizeMode(
      (import.meta.env.VITE_REMORPH_BACKEND_MODE as string | undefined)
      ?? (import.meta.env.VITE_TELEMETRY_MODE as string | undefined),
    ),
    url: getBackendUrl(),
    pollMs: Number.isFinite(pollMs) ? pollMs : 4500,
  };
}

function getRealService() {
  return new RealTelemetryService(getBackendUrl());
}

export async function getTelemetrySnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
  const config = getTelemetryConfig();
  const realService = getRealService();

  if (config.mode === 'mock') {
    return mockService.getSnapshot(options);
  }

  if (config.mode === 'real') {
    return realService.getSnapshot(options);
  }

  try {
    return await realService.getSnapshot(options);
  } catch {
    return mockService.getSnapshot(options);
  }
}

export type { DashboardSnapshot, TelemetryService };
