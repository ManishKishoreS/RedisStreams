/**
 * Retirement readiness scoring.
 *
 * Blends four signals into a 0–100 score:
 *   1. Funding ratio (projected vs required corpus)      — 45%
 *   2. Monte Carlo success probability                    — 35%
 *   3. Longevity buffer (years money lasts vs needed)     — 15%
 *   4. Emergency-fund coverage                            — 5%
 * The score maps to a Green / Amber / Red status.
 */
import type {
  CorpusAnalysis,
  MonteCarloResult,
  RetirementPlan,
  RetirementStatus,
} from "@/domain/types";
import { baseAnnualExpenses } from "./projection";

export interface ReadinessInputs {
  plan: RetirementPlan;
  corpus: CorpusAnalysis;
  monteCarlo: MonteCarloResult;
  /** Years the corpus lasted in the base projection. */
  yearsMoneyLasts: number;
  /** Years that need funding (life expectancy − retirement age). */
  yearsNeeded: number;
}

export function fundingRatio(corpus: CorpusAnalysis): number {
  if (corpus.requiredCorpus <= 0) return 1;
  return corpus.projectedCorpus / corpus.requiredCorpus;
}

export function emergencyFundCoverage(plan: RetirementPlan): number {
  const monthlyExpenses = baseAnnualExpenses(plan) / 12;
  if (monthlyExpenses <= 0) return 1;
  const targetMonths = Math.max(1, plan.goals.emergencyFundMonths);
  const liquid = plan.assets.cash + plan.assets.fixedDeposits;
  const monthsCovered = liquid / monthlyExpenses;
  return clamp01(monthsCovered / targetMonths);
}

export function computeReadiness(inputs: ReadinessInputs): {
  score: number;
  status: RetirementStatus;
} {
  const funding = clamp01(fundingRatio(inputs.corpus));
  const success = clamp01(inputs.monteCarlo.successProbability);
  const longevity = clamp01(
    inputs.yearsNeeded > 0 ? inputs.yearsMoneyLasts / inputs.yearsNeeded : 1,
  );
  const emergency = emergencyFundCoverage(inputs.plan);

  const score = Math.round(
    100 * (0.45 * funding + 0.35 * success + 0.15 * longevity + 0.05 * emergency),
  );

  const status: RetirementStatus = score >= 75 ? "green" : score >= 50 ? "amber" : "red";
  return { score: clampScore(score), status };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
function clampScore(x: number): number {
  return Math.max(0, Math.min(100, x));
}
