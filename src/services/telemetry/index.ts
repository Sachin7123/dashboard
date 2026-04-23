import { MockTelemetryService } from './mockTelemetryService';
import { RealTelemetryService } from './realTelemetryService';
import type { DashboardSnapshot, TelemetryRequestOptions, TelemetryService } from '../../types/remorph';

type BackendMode = 'auto' | 'mock' | 'real';

const BACKEND_MODE = ((import.meta.env.VITE_REMORPH_BACKEND_MODE as string | undefined) ?? 'auto') as BackendMode;
const BACKEND_URL = (import.meta.env.VITE_REMORPH_BACKEND_URL as string | undefined)
  ?? (import.meta.env.VITE_TELEMETRY_URL as string | undefined)
  ?? 'http://localhost:8000/api/telemetry';
const REFRESH_MS = Number(import.meta.env.VITE_REMORPH_REFRESH_MS ?? import.meta.env.VITE_TELEMETRY_POLL_MS ?? 4500);

const mockService = new MockTelemetryService();
const realService = new RealTelemetryService(BACKEND_URL);

export function getTelemetryConfig() {
  return {
    mode: BACKEND_MODE,
    url: BACKEND_URL,
    pollMs: Number.isFinite(REFRESH_MS) ? REFRESH_MS : 4500,
  };
}

export async function getTelemetrySnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
  const config = getTelemetryConfig();

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
