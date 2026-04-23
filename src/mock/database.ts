import syntheticData from '../data/synthetic_data.json';
import type { ReMorphEvent, SessionState } from '../types/remorph';

export const mockSessionState: SessionState = {
  operator_name: 'Sachin Ops',
  role: 'Platform Reliability',
  auth_state: 'authenticated',
  environment: 'mock-lab',
};

export const mockLatencyProfiles = [
  { base: 180, jitter: 80, retries: 0 },
  { base: 260, jitter: 120, retries: 1 },
  { base: 420, jitter: 180, retries: 2 },
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
