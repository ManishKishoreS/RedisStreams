# RetireWise Global — Implementation Plan & Roadmap

This document is an honest status report: what is built and verified, and what
remains to reach the full product vision.

## Status legend
✅ Done & unit-tested  ·  🟦 Done (UI/infra, not unit-tested)  ·  🟨 Partial  ·  ⬜ Planned

## Phase 1 — Financial engine (core domain) ✅

| Feature | Status |
| --- | --- |
| Domain model (`RetirementPlan`, `AnalysisResult`, …) | ✅ |
| Inflation: general, category, real-return (Fisher) | ✅ |
| Tax engine: progressive income, CGT, dividends, pension withdrawals | ✅ |
| Cross-border tax with double-taxation-agreement relief | ✅ |
| Safe Withdrawal Rate engine (country/horizon/allocation aware) | ✅ |
| Portfolio blended return & volatility, risk presets | ✅ |
| Year-by-year projection (accumulation + decumulation) | ✅ |
| Liabilities (mortgage amortisation, debt settlement) | ✅ |
| Dependents, life events, retirement income streams | ✅ |
| Required-corpus calc incl. legacy goal | ✅ |
| Market scenarios (normal / immediate / mid / late / multiple / custom) | ✅ |
| Monte Carlo (seedable, sequence-of-returns risk) | ✅ |
| Earliest/recommended retirement-age solver | ✅ |
| Readiness score (0–100, Green/Amber/Red) | ✅ |
| Plain-English insights | ✅ |
| **78 unit tests across 11 suites** | ✅ |

## Phase 2 — Application & UI 🟦

| Feature | Status |
| --- | --- |
| Next.js App Router shell + Tailwind | 🟦 |
| Interactive dashboard with headline KPIs | 🟦 |
| Charts: corpus, expenses/withdrawals, allocation, Monte Carlo, scenarios | 🟦 |
| Live sensitivity sliders (inflation/return/age/longevity/SWR) | 🟦 |
| `POST /api/analyze` route | 🟦 |
| Two cross-border sample plans (UK→PT, IN→AE) | 🟦 |

## Phase 3 — Persistence & auth ⬜/🟨

| Feature | Status |
| --- | --- |
| Prisma schema (User/Plan/AnalysisSnapshot) | 🟨 (schema written) |
| CRUD API for plans & snapshots | ⬜ |
| Clerk / Auth.js integration | ⬜ |
| Multi-step onboarding wizard (capturing every input from the spec) | ⬜ |

## Phase 4 — Advanced modelling (the "missing from most calculators" list)

Already covered by the engine: sequence-of-returns risk, longevity risk,
inflation & healthcare inflation, cross-border taxation, tax drag, real returns,
pension/social-security income, legacy goals, emergency-fund analysis, stress
testing & black-swan scenarios, currency depreciation field.

Planned enhancements:

| Feature | Status |
| --- | --- |
| Dynamic withdrawal strategies (guardrails, RMD, fixed-%) — types exist | 🟨 |
| Tax-efficient withdrawal ordering (taxable → tax-deferred → tax-free) | ⬜ |
| Required Minimum Distributions by country | ⬜ |
| Survivor-spouse / joint-life modelling | ⬜ |
| Portfolio rebalancing & glide-path strategy | ⬜ |
| Property downsizing scenario | ⬜ |
| Phased / part-time retirement income | ⬜ |
| Historical backtesting (e.g. 1929/1973/2000/2008 sequences) | ⬜ |
| Estate / inheritance-tax planning module | ⬜ |
| Currency-depreciation impact wired into projections | 🟨 (field captured) |

## Phase 5 — Productionisation ⬜

- E2E tests (Playwright), CI on every PR
- Accessibility & i18n / multi-currency display
- PDF export of the plan & dashboard
- Vercel deployment + managed Postgres
- Observability (errors, performance)

## Suggested next steps

1. Wire the persistence layer (Prisma client + CRUD routes + auth).
2. Build the multi-step onboarding wizard so users enter their own data instead
   of the sample plans.
3. Implement dynamic withdrawal strategies and historical backtesting in the
   engine (with unit tests), then surface them as dashboard toggles.
