# RetireWise Global — Domain Model

All types live in [`src/domain/types.ts`](../src/domain/types.ts). This document
summarises the model and the relationships between entities.

## Aggregate root: `RetirementPlan`

A single object that fully describes one household's situation. It is the only
input the engine needs.

```
RetirementPlan
├── personal:  PersonalInfo            # name, age, gender, marital, health
├── spouse?:   Spouse                  # age, retirement age, life expectancy
├── dependents: Dependent[]            # child/parent/disabled — support window + cost
├── country:   CountryConfig           # working vs retirement country, DTA, FX risk
├── assets:    Assets                  # cash, FD, pension, investments, property, alts
├── liabilities: Liabilities           # mortgage (+ amortisation), loans, cards, business
├── income:    Income                  # salary/bonus/rental/... + growth + savings rate
├── expenses:  Expenses                # monthly categories + annual + retirement extras
├── lifeEvents: LifeEvent[]            # one-off costs at a future year (inflation-adj?)
├── inflation: InflationConfig         # general + healthcare/education/housing/travel
├── investment: InvestmentConfig       # allocation, risk profile, return, volatility
├── retirementIncome: RetirementIncomeStream[]  # pensions / social security
└── goals:     RetirementGoals         # target age?, legacy, withdrawal strategy, SWR stance, life-expectancy mode, emergency fund
```

## Supported countries (`CountryCode`)

`UK · USA · CAN · AUS · IND · SGP · UAE · PRT · THA`

Each has a `CountryTaxProfile` (progressive income brackets + flat CGT,
dividend, pension, wealth, inheritance rates) and a baseline SWR band. See
[`src/lib/engine/constants.ts`](../src/lib/engine/constants.ts).

## Output: `AnalysisResult`

```
AnalysisResult
├── readinessScore: 0–100        status: green | amber | red
├── retirementAge                ages: { earliest, conservative, recommended, optimistic }
├── corpus: { requiredCorpus, projectedCorpus, shortfall, firstYearRetirementExpenses, safeWithdrawalRate }
├── swr:    { conservative, moderate, aggressive, recommended, rationale }
├── baseProjection: ProjectionResult        # year-by-year rows
├── monteCarlo: MonteCarloResult            # success prob, percentiles, histogram
├── scenarioProjections: { scenario, result }[]   # crash stress tests
├── tax: TaxImpactSummary                   # accumulation/retirement tax, effective rate, cross-border note
├── inflation: InflationImpactSummary       # first/last-year expenses, cumulative factor, real return
├── yearsMoneyWillLast
└── insights: string[]                      # plain-English narrative
```

## Life-expectancy resolution

- **Manual mode:** user-supplied number.
- **Statistical mode:** `BASE_LIFE_EXPECTANCY[retirementCountry]` adjusted for
  gender, health status, and the chosen scenario (conservative / average /
  optimistic).

## Two user journeys

| Journey | Input | Engine behaviour |
| --- | --- | --- |
| **1 — "I know my retirement age"** | `goals.targetRetirementAge` | Projects at that age; reports readiness, corpus gap, success probability. |
| **2 — "When can I retire?"** | no target age | `solveRetirementAges()` sweeps ages to find earliest / conservative / recommended / optimistic. |
