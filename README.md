# RetireWise Global

A production-oriented, **tax-aware, cross-border retirement planning** web
application. RetireWise Global answers the questions a real retiree (or
pre-retiree) actually has:

- _Can I retire at age X?_ — and if not, _when can I?_
- _How much corpus do I need, and how much will I have?_
- _What withdrawal rate is safe, and how long will my money last?_
- _What happens if markets crash, inflation runs hot, taxes change, or I move
  countries after retiring?_

> ⚠️ **Not financial advice.** All tax tables, life-expectancy figures and
> return assumptions are simplified, illustrative defaults for modelling and
> education. Verify against current legislation and a qualified adviser before
> relying on any output.

> ℹ️ This repository also contains an earlier prototype in
> [`retirement-planner/`](./retirement-planner). **RetireWise Global** (this
> root project) is the comprehensive build described here.

---

## What's implemented

The heart of the product is a **pure, framework-agnostic financial engine**
(`src/lib/engine`) that is fully unit-tested (78 tests across 11 suites). It is
wrapped by a Next.js App-Router UI with interactive Recharts visualisations and
a server API route.

| Area | Module | Tested |
| --- | --- | --- |
| Inflation (general + category, real returns) | `engine/inflation.ts` | ✅ |
| Tax engine (progressive income, CGT, dividends, pensions, cross-border DTA) | `engine/tax.ts` | ✅ |
| Safe Withdrawal Rate (country-aware, horizon & allocation adjusted) | `engine/swr.ts` | ✅ |
| Portfolio maths (blended return/volatility, risk presets) | `engine/portfolio.ts` | ✅ |
| Market scenarios (normal, immediate/mid/late/multiple crashes, custom) | `engine/scenarios.ts` | ✅ |
| Year-by-year projection (accumulation + decumulation) | `engine/projection.ts` | ✅ |
| Required-corpus calculation (with legacy goal) | `engine/corpus.ts` | ✅ |
| Monte Carlo (seedable, sequence-of-returns risk) | `engine/montecarlo.ts` | ✅ |
| Earliest/recommended retirement-age solver | `engine/retirementAge.ts` | ✅ |
| Readiness score (0–100, Green/Amber/Red) | `engine/readiness.ts` | ✅ |
| Plain-English insights | `engine/insights.ts` | ✅ |
| Orchestrator (full `AnalysisResult`) | `engine/analyze.ts` | ✅ |

### Cross-border support

Working country ≠ retirement country is a first-class concept. The engine ships
country profiles for **UK, USA, Canada, Australia, India, Singapore, UAE,
Portugal and Thailand**, models double-taxation-agreement relief, and surfaces a
plain-English cross-border tax note. Sample plans demonstrate **UK → Portugal**
and **India → UAE**.

---

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS** for styling (lightweight shadcn-style primitives in
  `src/components/ui`)
- **Recharts** for interactive charts
- **Vitest** for unit testing the engine
- **Prisma** + **PostgreSQL** schema for persistence (`prisma/schema.prisma`)
- Auth-ready for **Clerk / Auth.js**; deployable to **Vercel**

---

## Getting started

```bash
npm install

# Run the unit test suite (the financial engine)
npm test

# Type-check
npm run typecheck

# Start the dev server (interactive dashboard at http://localhost:3000)
npm run dev
```

The dashboard loads with two sample cross-border plans and live **sensitivity
sliders** (inflation, expected return, retirement age, life expectancy,
withdrawal stance) that recompute the entire analysis instantly in the browser —
the engine is pure TypeScript, so it runs identically on client and server.

### Database (optional)

```bash
cp .env.example .env        # set DATABASE_URL
npm run prisma:generate
npx prisma migrate dev
```

---

## Project layout

```
src/
  domain/types.ts              # the shared domain model (no behaviour)
  lib/
    engine/                    # the financial engine (pure, unit-tested)
      *.ts  +  *.test.ts
    sample-data.ts             # cross-border sample plans
    utils.ts                   # formatting helpers
  app/
    layout.tsx, page.tsx       # App Router shell + dashboard page
    api/analyze/route.ts       # POST /api/analyze -> AnalysisResult
  components/
    Dashboard.tsx              # the interactive dashboard
    charts/ProjectionCharts.tsx
    ui/                        # Card, Stat primitives
prisma/schema.prisma           # PostgreSQL schema
docs/                          # architecture, API, domain, roadmap
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full design,
[`docs/DOMAIN_MODEL.md`](./docs/DOMAIN_MODEL.md) for the model, and
[`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) for the roadmap
of features still to be built.

---

## Testing philosophy

> _"Financial calculations must be isolated in dedicated services and be fully
> unit tested."_

Every calculation lives in a pure function with no I/O, no React, and no
network. Monte Carlo and the RNG are **seedable**, so simulation tests are
deterministic. Tests assert both exact numbers (tax bands, amortisation,
inflation) and **monotonic properties** (retiring later ⇒ higher success;
lower SWR ⇒ larger required corpus; richer plan ⇒ retire no later).
