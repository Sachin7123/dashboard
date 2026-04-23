# ReMorph Dashboard Working Context

This file is the persistent working memory for the ReMorph dashboard project.

Use this file when:
- chat context is lost
- token limits are reached
- a new LLM session needs to resume work
- the UI starts drifting away from the intended direction
- we need to compare the current result against the original goal

If the user says `update that document`, this file should be updated first so the working context stays synchronized with the actual project state.

## 1. Project Goal

The `dashboard` app is the frontend control plane for `ReMorph`.

ReMorph is a self-healing API system. The dashboard is meant to show:
- what API request failed
- what kind of drift happened
- how ReMorph reasoned about the failure
- what repair action it applied
- whether the request was healed successfully
- confidence, latency, retries, and backend diagnostics

This is not a generic admin panel.
It is meant to feel like:
- a premium AI operations control center
- a product demo for clients/investors
- an explainable observability surface for autonomous API healing

## 2. Product Direction

The intended visual/product style is:
- dark premium enterprise UI
- glassmorphism panels
- cinematic ambient lighting
- strong telemetry feel
- animated AI/system flow
- polished, readable, production-grade layout

The dashboard should communicate:
- intelligence
- control
- observability
- reliability
- explainability

## 3. Workspace Structure

Root workspace:
- `d:\Dashboard\dashboard` = frontend dashboard
- `d:\Dashboard\ReMorph` = backend/self-healing engine

Relevant frontend areas:
- `dashboard/src/App.tsx`
- `dashboard/src/index.css`
- `dashboard/src/components/dashboard/*`
- `dashboard/src/components/layout/Panel.tsx`
- `dashboard/src/hooks/useDashboardRuntime.ts`
- `dashboard/src/services/telemetry/*`
- `dashboard/src/types/remorph.ts`
- `dashboard/src/mock/database.ts`

Relevant backend areas:
- `ReMorph/server/main.py`
- `ReMorph/app/services/telemetry.py`

## 4. Current Architecture

Frontend data flow:
1. `useDashboardRuntime()` loads telemetry snapshots.
2. Telemetry comes from `src/services/telemetry/index.ts`.
3. The service chooses mock, real, or auto mode.
4. Mock mode is powered by a structured mock backend.
5. Real mode reads from the backend telemetry endpoint.
6. The UI renders metrics, event feed, diff view, reasoning trace, and hero flow from the active event.

Key runtime files:
- `dashboard/src/hooks/useDashboardRuntime.ts`
- `dashboard/src/services/telemetry/index.ts`
- `dashboard/src/services/telemetry/mockBackend.ts`
- `dashboard/src/services/telemetry/mockTelemetryService.ts`
- `dashboard/src/services/telemetry/realTelemetryService.ts`
- `dashboard/src/services/telemetry/normalizers.ts`

## 5. Current UI Composition

Main screen structure:
- left sidebar
- hero/system flow section
- summary metrics
- active event feed
- diff/recovery panel
- cognitive trace panel
- operational metadata panel
- training/operator summary panel

Important components:
- `HeroFlow.tsx`
- `EventFeed.tsx`
- `DiffViewer.tsx`
- `TracePanel.tsx`
- `MetricCard.tsx`
- `StatusPill.tsx`
- `SignalRow.tsx`
- `Panel.tsx`

## 6. Current UI Decisions

These were deliberate decisions during the current iteration:

### Layout
- The dashboard should be responsive and dynamic with screen size.
- It should not feel like a tiny centered box on larger monitors.
- The outer layout should use most of the available display width.
- Sidebar width should scale using responsive sizing, not a rigid fixed desktop width.
- Main content should expand naturally on wider displays.

### Scroll Behavior
- The page is allowed to scroll vertically.
- Internal cards can still have controlled scroll regions where needed.
- Full `100vh` locking for the entire interface was making the layout cramped and visually messy, so that approach was relaxed.

### Hero Section
- The hero is important, but it should not overpower the whole dashboard.
- The canvas/orb should feel fitted and controlled.
- The hero must support the layout, not dominate it.

### Lower Content Area
- The lower-right side was previously too compressed.
- Diff/trace/metadata/training cards should not be forced into overly narrow columns.
- The event feed needs enough room to read comfortably.

## 7. Problems Already Identified

These issues were explicitly identified during the project:
- hero canvas felt messy and oversized
- dashboard was too locked to viewport height
- lower sections were clustered and over-compressed
- right-side panels became too narrow
- large displays had too much empty space on both sides
- alignment did not scale well with different monitor sizes

## 8. What Has Already Been Implemented

These upgrades have already been done:

### Mock / Backend Readiness
- mock backend layer added
- structured telemetry adapter added
- mock and real backend switching supported
- retry/delay simulation added
- session/auth-related mock states added

### UI Upgrade
- dashboard rebuilt around modular components
- premium dark glass design system established
- animated hero/system flow added
- event feed, diff viewer, trace panel, metadata cards modularized

### Responsive/Layout Upgrade
- layout moved away from hard locked viewport-only behavior
- page can scroll vertically when needed
- left rail can remain sticky on large screens
- dashboard width now uses more of the display
- responsive sidebar sizing introduced
- right-side content no longer forced into tiny columns

## 9. Current State Of The Project

At the latest saved state:
- the dashboard is much closer to the desired product quality
- the architecture is cleaner than the original monolithic version
- the app is responsive and more display-aware than before
- there is still ongoing UI polish/alignment work

The project is not considered fully visually finished yet.
The main remaining work is layout polish, spacing harmony, and UI refinement.

## 10. Known Remaining Improvement Areas

These are still good targets for future work:
- refine hero rhythm relative to lower cards
- standardize spacing/padding between sections
- improve typography consistency
- improve panel height harmony
- tune large-display layout behavior further
- make sure each screen size feels intentionally designed, not just stretched

## 11. Guardrails For Future LLM Sessions

If a future LLM continues this project, it should follow these rules:

1. Do not revert the dashboard back to a cramped fixed-height single-screen layout.
2. Do not reintroduce large dead margins on wide displays.
3. Do not let the hero canvas dominate the entire page again.
4. Do not compress the lower-right area into narrow unusable columns.
5. Keep the architecture modular and typed.
6. Use existing telemetry services and runtime hook instead of inventing a parallel data path.
7. Preserve the premium ReMorph visual direction.
8. Prefer layout balance and readability over flashy but messy visuals.

## 12. How To Resume In A New Session

Paste something like this into a new LLM session:

`Read dashboard/PROJECT_WORKING_CONTEXT.md first and use it as the source of truth before making changes. Continue from the current dashboard state without undoing the documented architecture and layout decisions.`

If the UI starts drifting:

`Read dashboard/PROJECT_WORKING_CONTEXT.md and bring the dashboard back in line with that documented direction.`

## 13. How To Update This File

When the user says `update that document`, update this file with:
- what changed
- what decisions were made
- what problems were found
- what remains unfinished

Do not leave this file stale if the UI direction changes in a meaningful way.

## 14. Verification Notes

Latest confirmed local verification:
- `npx tsc -b` passed

There was also a prior Vite/Windows sandbox issue where normal build verification sometimes required unrestricted execution because of `spawn EPERM` during config loading. That was an environment/sandbox issue, not a TypeScript app error.

## 15. Short Resume Summary

If someone wants the shortest version possible:

The ReMorph dashboard is a premium observability/control-plane UI for a self-healing API system. It uses a modular telemetry architecture with mock and real backend modes. The UI has already been upgraded significantly, but layout polish is still in progress. The main goals now are dynamic responsive behavior, proper alignment, reduced clustering, better use of large display widths, and preserving a polished enterprise AI-control-center look.
