/**
 * Earliest / recommended retirement age solver (Journey Option 2).
 *
 * Sweeps candidate retirement ages and, for each, checks whether the plan
 * "survives" — i.e. the corpus is never depleted before life expectancy and
 * the projected corpus covers the required corpus. Different return/SWR stances
 * yield earliest (optimistic), recommended (moderate) and conservative ages.
 */
import type { RetirementAgeAnalysis, RetirementPlan, SwrStance } from "@/domain/types";
import { projectRetirement, resolveLifeExpectancy } from "./projection";
import { computeSwr } from "./swr";
import { computeRequiredCorpus } from "./corpus";
import { resolveReturnModel } from "./portfolio";

export interface SolverOptions {
  /** Lowest age to consider retiring. Defaults to currentAge + 1. */
  minAge?: number;
  /** Highest age to consider. Defaults to life expectancy. */
  maxAge?: number;
}

/** Does the plan succeed if retiring at `age` under the given stance/return? */
export function planSucceedsAt(
  plan: RetirementPlan,
  age: number,
  stance: SwrStance,
  returnOverride?: number,
): boolean {
  const lifeExpectancy = resolveLifeExpectancy(plan);
  const horizon = Math.max(1, lifeExpectancy - age);
  const swr = computeSwr({
    country: plan.country,
    stance,
    horizonYears: horizon,
    allocation: plan.investment.allocation,
  });

  const projection = projectRetirement(plan, {
    retirementAge: age,
    accumulationReturn: returnOverride,
    retirementReturns: returnOverride !== undefined ? () => returnOverride : undefined,
  });

  if (projection.depletionAge !== null) return false;

  const corpus = computeRequiredCorpus({
    plan,
    retirementAge: age,
    safeWithdrawalRate: swr.recommended,
    projectedCorpus: projection.corpusAtRetirement,
  });

  return corpus.shortfall <= 0;
}

/** Find the earliest age >= minAge at which the plan succeeds, else null. */
export function earliestAge(
  plan: RetirementPlan,
  stance: SwrStance,
  opts: SolverOptions = {},
  returnOverride?: number,
): number | null {
  const min = opts.minAge ?? plan.personal.currentAge + 1;
  const max = opts.maxAge ?? resolveLifeExpectancy(plan);
  for (let age = min; age <= max; age++) {
    if (planSucceedsAt(plan, age, stance, returnOverride)) return age;
  }
  return null;
}

export function solveRetirementAges(
  plan: RetirementPlan,
  opts: SolverOptions = {},
): RetirementAgeAnalysis {
  const model = resolveReturnModel(plan.investment);

  return {
    // Optimistic: aggressive SWR + higher returns.
    optimistic: earliestAge(plan, "aggressive", opts, model.expectedReturn + 0.02),
    // Earliest realistic: moderate stance, expected returns.
    earliest: earliestAge(plan, "moderate", opts),
    // Recommended: moderate stance with a small return haircut for safety.
    recommended: earliestAge(plan, "moderate", opts, model.expectedReturn - 0.01),
    // Conservative: conservative SWR + lower returns.
    conservative: earliestAge(plan, "conservative", opts, model.expectedReturn - 0.02),
  };
}
