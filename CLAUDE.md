# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build to dist/
npm run lint         # TypeScript type-check only (tsc --noEmit)
npm run preview      # Preview production build
npm run test         # Run Vitest in watch mode
npm run test:run     # Run Vitest once (CI)
```

Tests live in `*.test.ts` files alongside source. Currently covers `services/api.ts` (mock-mode branch).

## Environment

Create `.env.local` with:
```
GEMINI_API_KEY=your_key_here
```

Vite injects this as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build time.

## Architecture

This is a **React 19 + TypeScript + Vite** frontend for a data distribution pipeline management system. The UI is in Hebrew (RTL) with dark mode support.

**Three core domain entities:**

1. **Queries** (`DistributionCollectorQuery`) — SQL query definitions tied to a source system and database
2. **Schedules** (`DistributionSchedulerSchedule`) — Cron-based execution schedules that reference a query
3. **Distributions** (`DistributionDistributerDistribution`) — Delivery methods (Email, SFTP, Kafka) attached to a schedule

Data flows: System → Query → Schedule → Distribution → Delivery

**Key files:**
- `types.ts` — All TypeScript interfaces for the domain model
- `constants.ts` — `APP_CONFIG.USE_MOCK_API` toggle (currently `true`); set to `false` to use real `/api` endpoints
- `services/api.ts` — API service layer (works in both mock and real mode)
- `services/mockData.ts` — Full mock dataset for development
- `App.tsx` — Hash-based routing (`/#/queries`, `/#/schedules`, etc.)

**Pages** (in `pages/`): Dashboard (charts/stats), QueriesView, SchedulesView, DistributionsView, SettingsView

**Path alias:** `@` resolves to the repo root (`@/types`, `@/services/api`, etc.)

## Stack

| Concern | Library |
|---|---|
| UI | React 19, Tailwind CSS 4 |
| Routing | React Router DOM 7 (hash-based) |
| Charts | Recharts 3 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Dates | date-fns 4 |
| Cron labels | cronstrue (Hebrew i18n) |

Tailwind uses class-based dark mode. Custom primary color is indigo `#664FE1`.
