# ReMorph Dashboard

Premium observability dashboard for the ReMorph self-healing control plane.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Backend Telemetry Config

The UI now supports a backend telemetry endpoint and falls back to the local synthetic dataset when a backend is unavailable.

Create a `.env.local` file if you want live backend polling:

```bash
VITE_TELEMETRY_MODE=auto
VITE_TELEMETRY_URL=http://localhost:8000/api/telemetry
VITE_TELEMETRY_POLL_MS=6000
```

Modes:

- `local`: always use bundled synthetic data
- `remote`: require backend telemetry
- `auto`: try backend first, then fall back to local data

Expected response shape:

- raw JSON array of events, or
- object with `events`, `records`, `items`, or `data`

Each event can use the dashboard-native fields or backend-adjacent fields like `target_url`, `error_code`, `fixed_payload`, `fixed_headers`, `processing_ms`, `repair_strategy`, and `diagnostics`.
