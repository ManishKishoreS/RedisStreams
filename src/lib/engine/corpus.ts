/**
 * Required-corpus calculation.
 *
 *   Required Corpus = Inflation-Adjusted First-Year Net Expenses / Safe WR
 *
 * with an added present-value allowance for the desired legacy goal. The
 * first-year expense figure is net of guaranteed retirement income (pensions /
 * social security) and grossed up for withdrawal tax, so the safe-withdrawal
 * rate is applied to the amount the portfolio must actually deliver.
 */
import type { CorpusAnalysis, RetirementPlan } from "@/domain/types";
import { inflate, presentValue } from "./inflation";
import { retirementWithdrawalTax, retirementProfile, incomeTax } from "./tax";
import {
  baseAnnualExpenses,
  resolveLifeExpectancy,
  annualMortgagePayment,
} from "./projection";

export interface RequiredCorpusInputs {
  plan: RetirementPlan;
  retirementAge: number;
  safeWithdrawalRate: number;
  /** Projected corpus at retirement (from the projection engine). */
  projectedCorpus: number;
}

/** Net (after guaranteed income) first-year retirement spend, grossed for tax. */
export function firstYearRetirementExpenses(
  plan: RetirementPlan,
  retirementAge: number,
): number {
  const yearsToRetirement = retirementAge - plan.personal.currentAge;
  const base = baseAnnualExpenses(plan) + plan.expenses.additionalRetirementAnnual;
  const inflated = inflate(base, plan.inflation.general, yearsToRetirement);

  // Mortgage still running at retirement?
  const mortgageRemaining =
    plan.liabilities.mortgage.remainingTermYears > yearsToRetirement
      ? annualMortgagePayment(plan)
      : 0;

  // Subtract guaranteed retirement income active at retirement age (net).
  const profile = retirementProfile(plan.country);
  let guaranteedGross = 0;
  let taxableGross = 0;
  for (const s of plan.retirementIncome) {
    if (retirementAge >= s.startAge && retirementAge <= s.endAge) {
      const amount = s.inflationLinked
        ? inflate(s.annualAmount, plan.inflation.general, yearsToRetirement)
        : s.annualAmount;
      guaranteedGross += amount;
      if (s.taxable) taxableGross += amount;
    }
  }
  const guaranteedNet = guaranteedGross - incomeTax(taxableGross, profile);

  const netNeed = Math.max(0, inflated + mortgageRemaining - guaranteedNet);
  const tax = retirementWithdrawalTax(netNeed, {
    pensionPortion: 0.4,
    profile,
  });
  return netNeed + tax;
}

export function computeRequiredCorpus(inputs: RequiredCorpusInputs): CorpusAnalysis {
  const { plan, retirementAge, safeWithdrawalRate, projectedCorpus } = inputs;
  const firstYear = firstYearRetirementExpenses(plan, retirementAge);

  const baseRequired = safeWithdrawalRate > 0 ? firstYear / safeWithdrawalRate : Infinity;

  // Legacy goal: present value (at retirement) of the desired bequest, inflated
  // to the death year then discounted back to retirement via real return proxy.
  const lifeExpectancy = resolveLifeExpectancy(plan);
  const yearsToRetirement = retirementAge - plan.personal.currentAge;
  const legacyAtDeath = inflate(
    plan.goals.legacyGoal,
    plan.inflation.general,
    lifeExpectancy - plan.personal.currentAge,
  );
  const legacyAtRetirement = presentValue(
    legacyAtDeath,
    plan.investment.expectedReturn || 0.05,
    Math.max(0, lifeExpectancy - retirementAge),
  );

  const requiredCorpus = baseRequired + legacyAtRetirement;
  const shortfall = requiredCorpus - projectedCorpus;

  return {
    requiredCorpus,
    projectedCorpus,
    shortfall,
    firstYearRetirementExpenses: firstYear,
    safeWithdrawalRate,
  };
}

export { yearsToRetirement };
function yearsToRetirement(plan: RetirementPlan, retirementAge: number): number {
  return Math.max(0, retirementAge - plan.personal.currentAge);
}
