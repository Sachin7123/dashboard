# ReMorph Dashboard Working Context

This file is the persistent working memory for the ReMorph frontend product.

Use this file when:

- chat context is lost
- token limits are reached
- a new LLM session needs to resume work
- the UI starts drifting away from the intended direction
- we need to compare the current result against the original goal

If the user says `update that document`, this file should be updated first so the working context stays synchronized with the actual project state.

## 1. Project Goal

The `dashboard` app is no longer just a single dashboard screen.

It is now the frontend shell for the ReMorph product experience:

- intro page
- authentication flow
- logged-in platform page
- dashboard
- profile
- settings

ReMorph is a self-healing API platform. The product is meant to show:

- what API request failed
- what kind of drift happened
- how ReMorph reasoned about the failure
- what repair action it applied
- whether the request was healed successfully
- confidence, latency, retries, and backend diagnostics

This is not a generic admin panel.
It should feel like:

- a premium AI operations control center
- a startup-grade SaaS platform
- a product demo for clients/investors/judges
- an explainable observability surface for autonomous API healing

## 2. Product Direction

The intended visual/product style is:

- dark premium enterprise UI
- glassmorphism panels where useful
- cinematic ambient lighting
- strong telemetry feel
- polished, readable, production-grade layout
- premium micro-interactions instead of noisy animation
- strong brand consistency around the single name `ReMorph`

The product should communicate:

- intelligence
- control
- observability
- reliability
- explainability
- trust

## 3. Workspace Structure

Root workspace:

- `d:\Dashboard\dashboard` = frontend product shell
- `d:\Dashboard\ReMorph` = backend/self-healing engine

Relevant frontend areas:

- `dashboard/src/App.tsx`
- `dashboard/src/main.tsx`
- `dashboard/src/index.css`
- `dashboard/src/app/*`
- `dashboard/src/pages/*`
- `dashboard/src/components/app/*`
- `dashboard/src/components/dashboard/*`
- `dashboard/src/components/layout/Panel.tsx`
- `dashboard/src/hooks/useDashboardRuntime.ts`
- `dashboard/src/services/telemetry/*`
- `dashboard/src/types/remorph.ts`
- `dashboard/src/mock/database.ts`

Relevant backend areas:

- `ReMorph/app/main.py`
- `ReMorph/app/services/telemetry.py`

## 4. Current Architecture

### Product Shell

The frontend now behaves as a lightweight routed product shell with these routes:

- `/` = intro page
- `/login`
- `/signup`
- `/forgot-password`
- `/verify-email`
- `/platform`
- `/dashboard`
- `/profile`
- `/settings`

Core shell files:

- `dashboard/src/App.tsx`
- `dashboard/src/app/router.tsx`
- `dashboard/src/app/clerk.ts`
- `dashboard/src/app/preferences.tsx`
- `dashboard/src/components/app/ProductNav.tsx`
- `dashboard/src/pages/IntroPage.tsx`
- `dashboard/src/pages/AuthPage.tsx`

### Authentication

Authentication is now designed around Clerk.

Current state:

- Clerk React SDK is installed
- `ClerkProvider` is wired in `src/main.tsx`
- the app expects `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`
- signed-in routes are protected at the app-shell level
- account/profile surfaces read from Clerk user data

Important setup note:

- if Clerk env is missing, the app intentionally shows a setup-required screen
- Clerk sign-up may need dashboard configuration to disable unsupported phone-number requirements depending on the instance configuration

### Frontend Data Flow

Dashboard runtime data flow remains:

1. `useDashboardRuntime()` loads telemetry snapshots.
2. Telemetry comes from `src/services/telemetry/index.ts`.
3. The service chooses mock, real, or auto mode.
4. Mock mode is powered by a structured mock backend.
5. Real mode reads from the backend telemetry endpoint.
6. The UI renders metrics, event feed, diff view, reasoning trace, workflow replay, benchmark/training panels, and hero flow from the active event.
7. Runtime polling uses a softer commit path so rapid live-ingestion refreshes feel smoother and produce less visible flicker.

Key runtime files:

- `dashboard/src/hooks/useDashboardRuntime.ts`
- `dashboard/src/services/telemetry/index.ts`
- `dashboard/src/services/telemetry/mockBackend.ts`
- `dashboard/src/services/telemetry/mockTelemetryService.ts`
- `dashboard/src/services/telemetry/realTelemetryService.ts`
- `dashboard/src/services/telemetry/normalizers.ts`

## 5. Current UI Composition

### Intro Page

The intro page is now the first entry point.

It includes:

- ReMorph branding
- concise product headline and explanation
- hero CTA for sign in / get started
- trust/product summary cards
- animated aura, glow, and subtle morph/orbit effects

Important files:

- `dashboard/src/pages/IntroPage.tsx`
- `dashboard/src/index.css`

### Authentication Pages

Authentication pages are now dedicated screens with ReMorph styling and Clerk UI integration.

Important files:

- `dashboard/src/pages/AuthPage.tsx`
- `dashboard/src/components/app/AuthCard.tsx`
- `dashboard/src/app/clerk.ts`

### Platform Page

The old “landing page” is now the logged-in `/platform` page.

It includes:

- ReMorph architecture story
- animated API/system demo
- healing workflow summary
- metrics
- CTA into the dashboard

Important files:

- `dashboard/src/pages/PlatformPage.tsx`
- `dashboard/src/components/dashboard/OrganizationLanding.tsx`
- `dashboard/src/components/dashboard/SystemArchitectureBoard.tsx`

### Dashboard

Main dashboard structure now includes:

- top product nav
- left sidebar
- hero/system flow section
- product pipeline strip
- summary metrics
- active event feed
- benchmark advantage panel
- training readiness panel
- diff/recovery panel
- cognitive trace panel
- workflow replay panel
- runtime services panel
- operational metadata panel
- training/operator summary panel
- logs/requests table with pagination

Important dashboard components:

- `HeroFlow.tsx`
- `EventFeed.tsx`
- `DiffViewer.tsx`
- `TracePanel.tsx`
- `PipelineMap.tsx`
- `WorkflowTimeline.tsx`
- `BenchmarkPanel.tsx`
- `TrainingPanel.tsx`
- `ServiceHealthPanel.tsx`
- `MetricCard.tsx`
- `StatusPill.tsx`
- `SignalRow.tsx`
- `Panel.tsx`
- `Pagination.tsx`

### Profile + Settings

These pages now exist as part of the product shell.

Profile includes:

- avatar/initial
- name
- email
- organization = `ReMorph`
- role placeholder
- account identity details

Settings includes:

- theme preference
- notification toggles
- security-related placeholders
- session/account preference messaging
- save/update interaction
- local persistence through preferences context

## 6. Current UI Decisions

These were deliberate decisions during the current iteration:

### Branding

- The product name should be shown simply as `ReMorph`.
- Avoid extra sub-brand lockups like `AI Recovery Cloud` or `Product Cloud` in the logo area.
- Branding should feel clean, high-trust, and consistent across intro, auth, platform, dashboard, profile, and settings.

### Layout

- The product should use most of the available display width.
- It should not feel like a tiny centered box on larger monitors.
- Sidebar width should scale using responsive sizing, not a rigid fixed desktop width.
- Main content should expand naturally on wider displays.

### Intro Page

- The intro page should feel minimal, premium, and high-trust.
- Neon glow, aura, and morph effects are allowed, but only if they remain subtle and elegant.
- Motion should feel smooth and premium, not flashy or gimmicky.
- Hero depth should come from layered glow/shadow/backdrop treatment instead of clutter.

### Platform Page

- The platform page is logged-in product storytelling, not the public intro page.
- It should feel like part of the same ecosystem as dashboard/profile/settings.
- The system demo should be cleaner and more product-like than earlier noisy visual experiments.

### Dashboard

- The dashboard should remain responsive and dynamic with screen size.
- It should not return to a cramped fixed-height single-screen layout.
- Internal cards can still have controlled scroll regions where needed.
- Overflow handling remains a first-class requirement.

### Data UX

- Lists and logs should support search, sort, filters, page size selection, and pagination.
- Operational surfaces should feel deployable and usable, not just decorative.

## 7. Problems Already Identified

These issues were explicitly identified during the project:

- early landing pages felt too demo-like and not product-grade enough
- large displays previously had too much empty space on both sides
- some hero/diagram versions felt messy or visually inconsistent
- the 3D hero experiment on the platform page felt weird and was replaced with a cleaner product-demo approach
- product shell originally lacked proper routing/auth/profile/settings
- mock auth was not acceptable for final product direction
- Clerk setup can fail if phone-number sign-up is enabled for unsupported regions or unwanted auth identifiers

## 8. What Has Already Been Implemented

### Mock / Backend Readiness

- mock backend layer added
- structured telemetry adapter added
- mock and real backend switching supported
- retry/delay simulation added
- session/auth-related mock states added for telemetry

### Product Shell Upgrade

- app rebuilt from single-screen shell into a multi-page ReMorph product flow
- intro page created
- auth pages created
- protected product routes created
- profile page created
- settings page created
- top product nav created
- account dropdown created

### Authentication Upgrade

- Clerk React SDK installed
- Clerk provider wired
- auth UI integrated into ReMorph styling
- signed-in route gating added
- logout flow added
- account/profile data reads from Clerk user object

### UI Upgrade

- dashboard rebuilt around modular components
- premium dark glass design system established
- animated hero/system flow added
- event feed, diff viewer, trace panel, metadata cards modularized
- dashboard exposes Sprint 4-style workflow episodes, benchmark deltas, training readiness, and runtime service health
- product vision flow is explicitly shown as Input -> Detection -> Intelligence -> Self-Healing -> Recovery -> Success
- wrapping and overflow handling were tightened across the dashboard so long URLs and diagnostics fit more reliably
- intro page now includes premium aura/glow/morph styling

### Responsive/Layout Upgrade

- layout moved away from hard locked viewport-only behavior
- page can scroll vertically when needed
- dashboard width uses more of the display
- responsive sidebar sizing introduced
- right-side content is no longer forced into tiny columns
- live-ingestion updates were smoothed so polling produces less visible jitter/flicker in the UI

### Data UX Upgrade

- event feed now has search, sort, and pagination
- logs/requests table now has filtering and pagination
- preferences now persist locally

## 9. Current State Of The Project

At the latest saved state:

- ReMorph now behaves like a real product shell instead of a dashboard-only demo
- the app includes intro, auth, platform, dashboard, profile, and settings pages
- Clerk integration is implemented in code and requires the real publishable key in `.env.local`
- the intro page is significantly more premium than earlier versions
- the platform page is now the logged-in product showcase
- the dashboard remains the main observability/control-plane surface
- profile/settings pages exist and are functional at the UI/state level
- pagination/search/filter UX exists on operational surfaces
- the app is much closer to a startup/investor/demo-ready SaaS product

The project is still not visually final yet.
The main remaining work is polish, Clerk instance configuration cleanup, and any further design refinement the user wants.

## 10. Known Remaining Improvement Areas

These are still good targets for future work:

- refine intro-page typography, spacing, and hero balance further
- make the public intro page even more GitHub-grade if requested
- polish the logged-in `/platform` page so it matches the dashboard even more tightly
- tune large-display layout behavior further
- continue auditing text overflow edge cases against longer live backend strings
- wire profile/settings persistence to a real backend if needed beyond local state + Clerk data
- complete Clerk configuration in the dashboard instance if sign-up fields or region-specific auth requirements are blocking user creation
- wire benchmark/training/workflow panels to live backend endpoints once the backend contract is exposed over HTTP

## 10A. Recent Decisions

These are important recent decisions that future sessions should know:

1. The app is now a full ReMorph product shell, not a dashboard-only prototype.
2. Public intro and logged-in platform pages are distinct and should stay distinct.
3. The logo/brand lockup should be just `ReMorph`.
4. Clerk is the chosen auth solution.
5. Mock/local auth should not be reintroduced.
6. The earlier noisy 3D visual direction for the platform page was rejected in favor of a cleaner product-demo style.
7. Premium motion is desired, but only if it remains calm, elegant, and readable.
8. Intro-page aura/glow/morph effects are acceptable as long as they stay subtle and premium.
9. Pagination, search, sort, and filtering are now part of the product quality bar for operational data.
10. Overflow handling and layout balance remain first-class requirements.

## 11. Guardrails For Future LLM Sessions

If a future LLM continues this project, it should follow these rules:

1. Do not revert the app back to a single-page dashboard-only shell.
2. Do not reintroduce mock auth as the primary product experience.
3. Do not reintroduce large dead margins on wide displays.
4. Do not let the platform demo become visually noisy or gimmicky.
5. Keep the architecture modular and typed.
6. Use existing telemetry services and runtime hook instead of inventing a parallel data path.
7. Preserve the premium ReMorph visual direction.
8. Prefer layout balance and readability over flashy but messy visuals.
9. Keep the `ReMorph` brand name consistent in headers/logo lockups.
10. Prefer subtle premium motion and polished UX over loud animation.

## 12. How To Resume In A New Session

Paste something like this into a new LLM session:

`Read dashboard/PROJECT_WORKING_CONTEXT.md first and use it as the source of truth before making changes. Continue from the current ReMorph product shell state without undoing the routed architecture, Clerk auth direction, or premium UI decisions.`

If the UI starts drifting:

`Read dashboard/PROJECT_WORKING_CONTEXT.md and bring the ReMorph product shell back in line with the documented direction.`

## 13. How To Update This File

When the user says `update that document`, update this file with:

- what changed
- what decisions were made
- what problems were found
- what remains unfinished

Do not leave this file stale if the product direction changes in a meaningful way.

## 14. Verification Notes

Latest confirmed local verification:

- `npm run lint` passed
- `npx tsc -b` passed

Clerk-related notes:

- the app now expects `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`
- if that key is missing, the app shows a setup-required screen by design
- Clerk sign-up may require dashboard configuration to disable phone-number requirements if those are not wanted or not supported in the current region/instance setup

There is also a known Windows/Vite sandbox issue where normal build verification sometimes requires unrestricted execution because of `spawn EPERM` during config loading. That is an environment/sandbox issue, not a TypeScript app error.

## 15. Short Resume Summary

If someone wants the shortest version possible:

The ReMorph frontend is now a multi-page product shell with intro, auth, platform, dashboard, profile, and settings pages. It uses Clerk for authentication, a premium dark visual system, and the existing telemetry architecture for dashboard data. The current direction is a startup-grade SaaS experience with subtle premium motion, strong brand consistency, paginated operational data surfaces, and a polished ReMorph control-plane feel. The remaining work is mostly UI polish, Clerk instance configuration cleanup, and deeper live backend integration.
