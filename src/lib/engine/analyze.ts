/**
 * Top-level analysis orchestrator.
 *
 * Runs the full pipeline and assembles the AnalysisResult consumed by the API
 * and UI: SWR → base projection → required corpus → Monte Carlo → scenario
 * stress tests → readiness score → tax/inflation summaries → insights, plus the
 * earliest/recommended retirement age sweep.
 */
import type {
  AnalysisResult,
  InflationImpactSummary,
  RetirementPlan,
  TaxImpactSummary,
} from "@/domain/types";
import { computeSwr } from "./swr";
import {
  projectRetirement,
  resolveLifeExpectancy,
  baseAnnualExpenses,
} from "./projection";
import { computeRequiredCorpus, firstYearRetirementExpenses } from "./corpus";
import { runMonteCarlo } from "./montecarlo";
import { standardScenarioSet, returnForYear } from "./scenarios";
import { solveRetirementAges } from "./retirementAge";
import { computeReadiness } from "./readiness";
import { generateInsights } from "./insights";
import { resolveReturnModel } from "./portfolio";
import { realReturn, inflationFactor } from "./inflation";
import { COUNTRY_PROFILES } from "./constants";

export interface AnalyzeOptions {
  /** Monte Carlo runs (1000 / 5000 / 10000). Default 1000. */
  monteCarloRuns?: number;
  monteCarloSeed?: number;
}

export function analyzePlan(plan: RetirementPlan, opts: AnalyzeOptions = {}): AnalysisResult {
  const model = resolveReturnModel(plan.investment);
  const lifeExpectancy = resolveLifeExpectancy(plan);

  // Determine the retirement age to analyse.
  const ages = solveRetirementAges(plan);
  const retirementAge =
    plan.goals.targetRetirementAge ??
    ages.recommended ??
    ages.earliest ??
    Math.min(lifeExpectancy - 1, plan.personal.currentAge + 30);

  const horizon = Math.max(1, lifeExpectancy - retirementAge);

  // Safe withdrawal rate.
  const swr = computeSwr({
    country: plan.country,
    stance: plan.goals.swrStance,
    horizonYears: horizon,
    allocation: plan.investment.allocation,
  });

  // Base (normal-market) projection.
  const baseProjection = projectRetirement(plan, { retirementAge });

  // Required corpus.
  const corpus = computeRequiredCorpus({
    plan,
    retirementAge,
    safeWithdrawalRate: swr.recommended,
    projectedCorpus: baseProjection.corpusAtRetirement,
  });

  // Monte Carlo.
  const monteCarlo = runMonteCarlo(plan, {
    retirementAge,
    runs: opts.monteCarloRuns ?? 1000,
    seed: opts.monteCarloSeed,
  });

  // Scenario stress tests.
  const scenarios = standardScenarioSet(model.expectedReturn, horizon);
  const scenarioProjections = scenarios.map((scenario) => ({
    scenario,
    result: projectRetirement(plan, {
      retirementAge,
      retirementReturns: (yearIndex) => returnForYear(scenario, yearIndex),
    }),
  }));

  // Years money will last (from retirement age).
  const yearsMoneyWillLast =
    baseProjection.depletionAge !== null
      ? baseProjection.depletionAge - retirementAge
      : lifeExpectancy - retirementAge;

  // Readiness score.
  const { score, status } = computeReadiness({
    plan,
    corpus,
    monteCarlo,
    yearsMoneyLasts: yearsMoneyWillLast,
    yearsNeeded: lifeExpectancy - retirementAge,
  });

  // Tax & inflation summaries.
  const tax = buildTaxSummary(plan, baseProjection, model.expectedReturn);
  const inflation = buildInflationSummary(plan, retirementAge, lifeExpectancy, model.expectedReturn);

  const result: AnalysisResult = {
    readinessScore: score,
    status,
    retirementAge,
    ages,
    corpus,
    swr,
    baseProjection,
    monteCarlo,
    scenarioProjections,
    tax,
    inflation,
    yearsMoneyWillLast,
    insights: [],
  };

  result.insights = generateInsights(plan, result);
  return result;
}

function buildTaxSummary(
  plan: RetirementPlan,
  projection: ReturnType<typeof projectRetirement>,
  expectedReturn: number,
): TaxImpactSummary {
  let accumTax = 0;
  let retireTax = 0;
  let retireWithdrawals = 0;
  for (const row of projection.rows) {
    if (row.phase === "accumulation") accumTax += row.taxesPaid;
    else {
      retireTax += row.taxesPaid;
      retireWithdrawals += row.withdrawals;
    }
  }
  const effectiveRetirementTaxRate = retireWithdrawals > 0 ? retireTax / retireWithdrawals : 0;
  const cgRate = COUNTRY_PROFILES[plan.country.working].capitalGainsTaxRate;
  const taxDrag = expectedReturn * 0.02 * cgRate; // matches projection drag model

  const crossBorder =
    plan.country.working !== plan.country.retirement
      ? plan.country.hasDoubleTaxationAgreement
        ? `Working in ${COUNTRY_PROFILES[plan.country.working].name} and retiring in ${COUNTRY_PROFILES[plan.country.retirement].name}; a double-taxation agreement limits double taxation to the higher jurisdiction's rate.`
        : `Working in ${COUNTRY_PROFILES[plan.country.working].name} and retiring in ${COUNTRY_PROFILES[plan.country.retirement].name} with no double-taxation agreement — income may be taxed in both jurisdictions.`
      : `Working and retiring in ${COUNTRY_PROFILES[plan.country.retirement].name}.`;

  return {
    totalTaxesPaidAccumulation: accumTax,
    totalTaxesPaidRetirement: retireTax,
    effectiveRetirementTaxRate,
    taxDragOnReturns: taxDrag,
    crossBorderNote: crossBorder,
  };
}

function buildInflationSummary(
  plan: RetirementPlan,
  retirementAge: number,
  lifeExpectancy: number,
  expectedReturn: number,
): InflationImpactSummary {
  const totalYears = lifeExpectancy - plan.personal.currentAge;
  const firstYear = firstYearRetirementExpenses(plan, retirementAge);
  const base = baseAnnualExpenses(plan) + plan.expenses.additionalRetirementAnnual;
  const lastYear = base * inflationFactor(plan.inflation.general, totalYears);
  const cumulative = inflationFactor(plan.inflation.general, totalYears);

  return {
    firstYearExpenses: firstYear,
    lastYearExpenses: lastYear,
    cumulativeInflationFactor: cumulative,
    realReturn: realReturn(expectedReturn, plan.inflation.general),
  };
}
