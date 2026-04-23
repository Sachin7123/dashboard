import type { EngineState, EventType, ReMorphEvent } from '../types/remorph';

export function shortUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function formatClock(value: string | null) {
  if (!value) return 'Awaiting sync';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
}

export function labelForType(type: EventType | 'all') {
  switch (type) {
    case 'payload_drift':
      return 'Payload Drift';
    case 'route_drift':
      return 'Route Drift';
    case 'auth_drift':
      return 'Auth Drift';
    case 'server_fault':
      return 'Server Fault';
    default:
      return 'All Intercepts';
  }
}

export function parseReasoning(reasoning: string) {
  const thoughtMatch = reasoning.match(/<think>([\s\S]*?)<\/think>/i);
  const thoughtBlock = thoughtMatch?.[1] ?? reasoning;
  return thoughtBlock
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function engineTone(state: EngineState): 'success' | 'live' | 'ai' | 'error' | 'muted' {
  switch (state) {
    case 'success':
      return 'success';
    case 'healing':
      return 'live';
    case 'thinking':
      return 'ai';
    default:
      return 'muted';
  }
}

export function toneClass(tone: 'success' | 'live' | 'ai' | 'error' | 'muted') {
  switch (tone) {
    case 'success':
      return 'text-accent-success';
    case 'live':
      return 'text-accent-live';
    case 'ai':
      return 'text-accent-ai';
    case 'error':
      return 'text-accent-error';
    default:
      return 'text-text-muted';
  }
}

export function eventTone(event: ReMorphEvent): 'success' | 'live' | 'ai' | 'error' {
  if (event.status === 'healed') return 'success';
  if (event.status === 'pending') return 'live';
  return 'error';
}
