# RetireWise Global — API Design

The engine is isomorphic, so the same `analyzePlan(plan, options)` function backs
both the HTTP API and the in-browser dashboard. The HTTP surface is intentionally
small; richer CRUD endpoints are listed under "Planned".

## `POST /api/analyze`

Run the full analysis pipeline for a plan.

**Request body:** a [`RetirementPlan`](../src/domain/types.ts), optionally with
analysis options:

```jsonc
{
  "personal": { "firstName": "Alex", "currentAge": 40, /* ... */ },
  "country":  { "working": "UK", "retirement": "PRT", "hasDoubleTaxationAgreement": true, "annualCurrencyDepreciation": 0.005 },
  // ...full plan...
  "_runs": 5000,        // optional: Monte Carlo runs (1000 | 5000 | 10000)
  "_seed": 12345        // optional: deterministic seed
}
```

**Response:** `200 OK` with an [`AnalysisResult`](../src/domain/types.ts):

```jsonc
{
  "readinessScore": 82,
  "status": "green",
  "retirementAge": 60,
  "ages": { "earliest": 57, "conservative": 63, "recommended": 59, "optimistic": 55 },
  "corpus": { "requiredCorpus": 1250000, "projectedCorpus": 1380000, "shortfall": -130000, "safeWithdrawalRate": 0.037 },
  "swr": { "conservative": 0.032, "moderate": 0.037, "aggressive": 0.042, "recommended": 0.037, "rationale": "..." },
  "monteCarlo": { "runs": 5000, "successProbability": 0.91, "median": 420000, "percentiles": { /* ... */ }, "histogram": [ /* ... */ ] },
  "baseProjection": { "rows": [ /* year-by-year */ ], "depletionAge": null },
  "scenarioProjections": [ { "scenario": { "label": "Immediate crash (-30%)" }, "result": { /* ... */ } } ],
  "tax": { "effectiveRetirementTaxRate": 0.11, "crossBorderNote": "..." },
  "inflation": { "firstYearExpenses": 48000, "lastYearExpenses": 96000, "cumulativeInflationFactor": 2.43, "realReturn": 0.029 },
  "yearsMoneyWillLast": 32,
  "insights": [ "You are on track to retire at age 60 with a 91% probability ..." ]
}
```

**Errors:** `400 Bad Request` `{ "error": "..." }` for an invalid plan.

## Planned endpoints (persistence layer)

Backed by the Prisma schema (`User → Plan → AnalysisSnapshot`):

| Method | Path | Purpose |
| --- | --- | --- |
| `GET`  | `/api/plans` | List the authenticated user's plans |
| `POST` | `/api/plans` | Create a plan |
| `GET`  | `/api/plans/:id` | Fetch a plan |
| `PUT`  | `/api/plans/:id` | Update a plan |
| `DELETE` | `/api/plans/:id` | Delete a plan |
| `POST` | `/api/plans/:id/snapshots` | Run analysis and persist an `AnalysisSnapshot` |
| `GET`  | `/api/plans/:id/snapshots` | History / comparison |

Authentication via Clerk or Auth.js middleware; `authId` on `User` maps to the
external subject.
