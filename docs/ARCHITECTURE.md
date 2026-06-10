# RetireWise Global — Architecture

## Guiding principles

RetireWise Global follows **Clean Architecture** / **Domain-Driven Design**: the
financial modelling is the core domain and is kept completely free of frameworks
and I/O. UI, persistence, and transport are outer layers that depend inward.

```
            ┌─────────────────────────────────────────────┐
            │                    UI layer                   │
            │   Next.js App Router · React · Recharts        │
            │   (src/app, src/components)                    │
            └───────────────▲───────────────▲──────────────┘
                            │ calls          │ renders
            ┌───────────────┴───────────────┴──────────────┐
            │              Application layer                 │
            │   API routes / server actions                 │
            │   (src/app/api/analyze)                        │
            └───────────────▲──────────────────────────────┘
                            │ orchestrates
            ┌───────────────┴──────────────────────────────┐
            │            Domain: Financial Engine            │
            │   Pure TypeScript, no framework, unit-tested   │
            │   (src/lib/engine, src/domain)                 │
            └───────────────▲──────────────────────────────┘
                            │ persisted via
            ┌───────────────┴──────────────────────────────┐
            │             Infrastructure layer               │
            │   Prisma + PostgreSQL · Clerk/Auth.js · Vercel │
            └───────────────────────────────────────────────┘
```

**Dependency rule:** the engine knows nothing about React, Next, Prisma or HTTP.
It accepts a `RetirementPlan` and returns an `AnalysisResult`. This is what makes
it trivially unit-testable and reusable (server, client, worker, or future
mobile client).

## Layers

### 1. Domain model (`src/domain/types.ts`)

Pure data shapes describing the problem: people, countries/tax, assets,
liabilities, income, expenses, life events, inflation, investments, retirement
income streams, goals — and the engine's output types
(`ProjectionResult`, `MonteCarloResult`, `AnalysisResult`, …). No behaviour.

### 2. Financial engine (`src/lib/engine`)

A set of small, composable, pure modules. The orchestrator `analyze.ts` wires
them into the full pipeline:

```
analyzePlan(plan)
  ├─ solveRetirementAges()           # earliest / recommended / conservative / optimistic
  ├─ computeSwr()                    # country + horizon + allocation aware
  ├─ projectRetirement()            # deterministic year-by-year base case
  ├─ computeRequiredCorpus()        # required vs projected, shortfall, legacy
  ├─ runMonteCarlo()                # success probability + distribution
  ├─ standardScenarioSet() ⨯ project # crash stress tests
  ├─ computeReadiness()             # 0–100 score, Green/Amber/Red
  ├─ tax & inflation summaries
  └─ generateInsights()             # plain-English narrative
```

#### The projection engine

`projectRetirement` is the spine. For every year from `currentAge` to life
expectancy it computes: starting corpus → investment return (scenario- or
Monte-Carlo-driven) → contributions (accumulation) or grossed-up withdrawals
(decumulation) → taxes → inflation-adjusted expenses → life-event costs →
ending corpus. A pluggable `ReturnProvider` lets the same code run normal
markets, deterministic crash scenarios, or random Monte Carlo draws — which is
how **sequence-of-returns risk** is captured (the order of returns matters
because withdrawals happen every year).

### 3. Application layer (`src/app/api`)

Thin transport. `POST /api/analyze` validates the body and calls `analyzePlan`.
Because the engine is isomorphic, the dashboard also calls it directly in the
browser for instant sensitivity-slider feedback — no round trip required.

### 4. UI layer (`src/app`, `src/components`)

App-Router pages, a client `Dashboard`, Recharts visualisations, and minimal
Tailwind UI primitives. Charts: corpus growth/depletion, expenses vs
withdrawals vs income, asset allocation, Monte Carlo distribution, and scenario
comparison.

### 5. Infrastructure (`prisma/schema.prisma`)

PostgreSQL via Prisma. `User → Plan → AnalysisSnapshot`. The evolving plan
inputs live in a typed JSON column (mirroring `RetirementPlan`); headline
outputs are denormalised onto `AnalysisSnapshot` for fast reads and history.

## Determinism & testing

- The RNG (`engine/random.ts`, mulberry32 + Box–Muller) is **seedable**, so
  Monte Carlo runs are reproducible and assertable.
- Tests mix **exact-value** assertions (tax bands, amortisation, inflation
  compounding) with **property/monotonicity** assertions (retire later ⇒ higher
  success probability; lower SWR ⇒ larger required corpus).

## Key modelling decisions

| Decision | Rationale |
| --- | --- |
| Withdrawals are **grossed up** for tax | The SWR is applied to what the portfolio must actually deliver, post-tax. |
| Primary residence **excluded** from investable corpus | You can't spend the house you live in; investment property is included. |
| Non-mortgage debt **settled up front** from corpus | Guarantees all liabilities are reflected. |
| Category-specific inflation | Healthcare/education inflate faster than general CPI. |
| DTA relief = pay the **higher** of two jurisdictions | Standard tax-treaty credit behaviour, simplified. |
| Blended return assumes **zero correlation** | Stable, monotonic; conservative on volatility. |
