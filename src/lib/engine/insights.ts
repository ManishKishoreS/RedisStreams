/**
 * Plain-English insight generation.
 *
 * Turns the numeric analysis into the kind of natural-language guidance a
 * planner would give ("You can retire at 58 with a 92% success probability").
 * Pure and deterministic — no LLM call required — so it is fully testable.
 */
import type { AnalysisResult, RetirementPlan } from "@/domain/types";

export function generateInsights(plan: RetirementPlan, r: AnalysisResult): string[] {
  const out: string[] = [];

  // Headline readiness.
  out.push(
    r.status === "green"
      ? `You are on track to retire at age ${r.retirementAge} with a ${pct(r.monteCarlo.successProbability)} probability of your money lasting.`
      : r.status === "amber"
        ? `Retiring at age ${r.retirementAge} is borderline: a ${pct(r.monteCarlo.successProbability)} success probability suggests tightening the plan.`
        : `Retiring at age ${r.retirementAge} looks unlikely to succeed (${pct(r.monteCarlo.successProbability)} success probability). Consider working longer or saving more.`,
  );

  // Corpus gap / surplus.
  if (r.corpus.shortfall > 0) {
    out.push(
      `You are projected to fall short of the required corpus by ${money(r.corpus.shortfall)}. ` +
        `Required ${money(r.corpus.requiredCorpus)} vs projected ${money(r.corpus.projectedCorpus)}.`,
    );
  } else {
    out.push(
      `You are projected to exceed the required corpus by ${money(-r.corpus.shortfall)} — a healthy buffer.`,
    );
  }

  // Earliest age guidance.
  if (r.ages.earliest && r.ages.earliest < r.retirementAge) {
    out.push(`Based on your finances you could realistically retire as early as age ${r.ages.earliest}.`);
  } else if (r.ages.recommended) {
    out.push(`A recommended (safety-buffered) retirement age is ${r.ages.recommended}.`);
  }

  // Longevity / depletion.
  if (r.baseProjection.depletionAge !== null) {
    out.push(
      `In the base scenario your corpus runs out at age ${r.baseProjection.depletionAge}. ` +
        `Reducing your withdrawal rate by 0.5% typically extends portfolio life by several years.`,
    );
  } else {
    out.push(`Your corpus is projected to last through your full life expectancy without depleting.`);
  }

  // Inflation sensitivity.
  out.push(
    `Inflation compounds your spending: first-year retirement expenses of ${money(r.inflation.firstYearExpenses)} ` +
      `grow to ${money(r.inflation.lastYearExpenses)} by the end of retirement (×${r.inflation.cumulativeInflationFactor.toFixed(2)}).`,
  );

  // Tax.
  out.push(
    `Estimated effective tax in retirement is ${pct(r.tax.effectiveRetirementTaxRate)}. ${r.tax.crossBorderNote}`,
  );

  // SWR.
  out.push(
    `Your safe withdrawal rate is ${pct(r.swr.recommended)} (band ${pct(r.swr.conservative)}–${pct(r.swr.aggressive)}).`,
  );

  // Worst-case stress.
  const worstScenario = [...r.scenarioProjections].sort(
    (a, b) => (a.result.depletionAge ?? 999) - (b.result.depletionAge ?? 999),
  )[0];
  if (worstScenario && worstScenario.result.depletionAge !== null) {
    out.push(
      `Stress test — under "${worstScenario.scenario.label}", your corpus would deplete at age ${worstScenario.result.depletionAge}.`,
    );
  }

  return out;
}

function pct(x: number): string {
  return `${(x * 100).toFixed(0)}%`;
}
function money(x: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(Math.round(x));
}
