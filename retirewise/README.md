# RetireWise

Retirement planning and guidance platform for the UK, US and India. Answers the
primary question: **"Will I have enough money to retire comfortably?"**

Built from `RetireWise_Requirements.xlsx` and `RetireWise_UI_UX_Blueprint.xlsx`.

## Features

- **Anonymous by default** — full assessment, score, scenarios and
  recommendations with no registration (PP-001, FR-000–FR-002). Guest plans
  live in `sessionStorage` for the browser session (FR-001); registering moves
  the plan to `localStorage` for save/resume and score tracking (PP-002, FR-003).
- **Retirement Safety Engine** — deterministic lifetime projection producing a
  0–100 Retirement Safety Score classified as Very Safe / Safe / Moderate Risk /
  High Risk / Critical (FR-007, FR-008).
- **Risk analytics** — longevity, inflation, sequence-of-returns and liquidity
  stress tests, each re-running the engine (FR-009–FR-012).
- **Scenario Lab** — retire at 55/60/65 side by side with adjustable
  contributions, returns and inflation (FR-013–FR-015).
- **AI Coach** — rule-based chat that simulates "what if" questions against
  your real plan (FR-016, FR-017).
- **Income planning** — retirement income streams and a binary-search
  sustainable withdrawal calculation (FR-019, FR-020).
- **Dashboard** — Safety Score as primary KPI, top actions, wealth forecast,
  score history and deterioration alerts for registered users (FR-021, FR-022,
  FR-024, FR-025).
- **Recommendations** — candidate actions are re-simulated to measure their
  real score impact, then ranked by impact and effort (FR-018).
- **16-screen journey** per the UI/UX blueprint: Landing → Quick Check →
  Profile → Income → Assets → Pensions → Lifestyle → Goals → Risk → Results →
  AI Coach → Scenario Lab → Timeline → Dashboard → Recommendations → Register.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Stack

React 19 · Vite · Tailwind CSS 4 · Zustand (persisted) · Recharts

> RetireWise provides guidance and education only — not regulated financial advice.
