import syntheticData from '../data/synthetic_data.json';
import type { ConnectionStatus, ReMorphEvent, SessionState } from '../types/remorph';

export const mockSessionState: SessionState = {
  operator_name: 'Sachin Ops',
  role: 'Platform Reliability',
  auth_state: 'authenticated',
  environment: 'mock-lab',
};

export const mockLatencyProfiles = [
  { id: 'stable', label: 'Stable sync lane', base: 180, jitter: 80, retries: 0, connection: 'connected' as ConnectionStatus },
  { id: 'retrying', label: 'Adaptive retry lane', base: 260, jitter: 120, retries: 1, connection: 'connected' as ConnectionStatus },
  { id: 'timeout-edge', label: 'Timeout recovery lane', base: 420, jitter: 180, retries: 2, connection: 'degraded' as ConnectionStatus },
];

export const mockSessionVariants: SessionState[] = [
  mockSessionState,
  {
    operator_name: 'Sachin Ops',
    role: 'Platform Reliability',
    auth_state: 'authenticated',
    environment: 'staging',
  },
  {
    operator_name: 'Sachin Ops',
    role: 'Platform Reliability',
    auth_state: 'reauth_required',
    environment: 'mock-lab',
  },
];

export const mockBackendNotices = [
  'Proxy ingress accepted request envelope.',
  'Reasoning trace stitched from latest repair attempt.',
  'Synthetic lab mode active until Vedant backend is live.',
  'Adaptive retry policy injected into telemetry simulator.',
  'Schema drift edge-case replay queued for next refresh.',
];

export function getSeedEvents(): ReMorphEvent[] {
  return (syntheticData as ReMorphEvent[]).map((event, index) => ({
    ...event,
    id: event.id || `seed-${index}`,
  }));
}

export function getMockAuthHeaders(): Record<string, string> {
  return {
    Authorization: 'Bearer remorph-mock-session-token',
    'x-vendor-id': 'ven-mock-001',
    'x-api-key': 'mock-live-key',
  };
}
