/**
 * Retirement projection engine.
 *
 * Produces a deterministic year-by-year cash-flow projection across both the
 * accumulation phase (working, saving, compounding) and the decumulation phase
 * (retired, withdrawing). It honours inflation (general + category), taxes
 * (accumulation tax drag + retirement withdrawal tax), liabilities, dependents,
 * life events, and external retirement income streams (pensions / social
 * security). A pluggable return provider lets the same engine run normal
 * markets, crash scenarios, or Monte Carlo draws.
 */
import type {
  ExpenseCategory,
  ProjectionResult,
  RetirementPlan,
  YearProjection,
} from "@/domain/types";
import { inflate, rateForCategory } from "./inflation";
import { resolveReturnModel } from "./portfolio";
import { retirementProfile, workingProfile, incomeTax, retirementWithdrawalTax } from "./tax";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "housing",
  "utilities",
  "food",
  "transportation",
  "healthcare",
  "insurance",
  "travel",
  "entertainment",
  "education",
  "other",
];

/** A function returning the nominal investment return for a retirement year. */
export type ReturnProvider = (yearIndexIntoRetirement: number) => number;

export interface ProjectionOptions {
  retirementAge: number;
  /** Return provider for the retirement phase (scenarios / Monte Carlo). */
  retirementReturns?: ReturnProvider;
  /** Override the accumulation-phase nominal return. */
  accumulationReturn?: number;
}

/** Sum of liquid + invested assets that can fund retirement. */
export function investableCorpus(plan: RetirementPlan): number {
  const a = plan.assets;
  return (
    a.cash +
    a.fixedDeposits +
    a.pensionValue +
    a.investmentAccounts +
    a.retirementAccounts +
    a.realEstateInvestment +
    a.alternatives
  );
}

/** Non-mortgage debts that are settled from the corpus up front. */
export function nonMortgageDebt(plan: RetirementPlan): number {
  const l = plan.liabilities;
  return l.personalLoans + l.educationLoans + l.creditCardDebt + l.businessDebt;
}

/** Annual mortgage payment via standard amortisation. */
export function annualMortgagePayment(plan: RetirementPlan): number {
  const m = plan.liabilities.mortgage;
  if (m.outstanding <= 0 || m.remainingTermYears <= 0) return 0;
  const r = m.interestRate;
  if (r === 0) return m.outstanding / m.remainingTermYears;
  const factor = Math.pow(1 + r, m.remainingTermYears);
  return (m.outstanding * r * factor) / (factor - 1);
}

/** Base annual living expenses today (excl. mortgage and retirement extras). */
export function baseAnnualExpenses(plan: RetirementPlan): number {
  const monthly = EXPENSE_CATEGORIES.reduce((sum, c) => sum + (plan.expenses.monthly[c] ?? 0), 0);
  return monthly * 12 + plan.expenses.additionalAnnual;
}

/** Inflation-adjusted living expense for a given year offset from now. */
function expensesForYear(plan: RetirementPlan, yearOffset: number, retired: boolean): number {
  let total = 0;
  for (const cat of EXPENSE_CATEGORIES) {
    const monthlyAmount = plan.expenses.monthly[cat] ?? 0;
    total += inflate(monthlyAmount * 12, rateForCategory(plan.inflation, cat), yearOffset);
  }
  total += inflate(plan.expenses.additionalAnnual, plan.inflation.general, yearOffset);
  if (retired) {
    total += inflate(plan.expenses.additionalRetirementAnnual, plan.inflation.general, yearOffset);
  }
  return total;
}

/** Dependent support cost active in a given year. */
function dependentCostForYear(plan: RetirementPlan, yearOffset: number): number {
  let total = 0;
  for (const d of plan.dependents) {
    const depAge = d.currentAge + yearOffset;
    if (depAge <= d.supportEndAge) {
      total += inflate(d.annualSupportCost, plan.inflation.general, yearOffset);
    }
  }
  return total;
}

/** Life-event cost occurring exactly in a given year. */
function lifeEventCostForYear(plan: RetirementPlan, yearOffset: number): number {
  let total = 0;
  for (const e of plan.lifeEvents) {
    if (e.yearsFromNow === yearOffset) {
      total += e.inflationAdjusted
        ? inflate(e.cost, plan.inflation.general, yearOffset)
        : e.cost;
    }
  }
  return total;
}

/** Net (after-tax) external retirement income for an age in a given year. */
function retirementIncomeForYear(
  plan: RetirementPlan,
  age: number,
  yearOffset: number,
): { gross: number; net: number; tax: number } {
  const profile = retirementProfile(plan.country);
  let gross = 0;
  let taxableGross = 0;
  for (const s of plan.retirementIncome) {
    if (age >= s.startAge && age <= s.endAge) {
      const amount = s.inflationLinked
        ? inflate(s.annualAmount, plan.inflation.general, yearOffset)
        : s.annualAmount;
      gross += amount;
      if (s.taxable) taxableGross += amount;
    }
  }
  const tax = incomeTax(taxableGross, profile);
  return { gross, net: gross - tax, tax };
}

/** Resolve the retirement life expectancy (manual or statistical scenario). */
export function resolveLifeExpectancy(plan: RetirementPlan): number {
  if (plan.goals.lifeExpectancyMode === "manual" && plan.goals.manualLifeExpectancy) {
    return plan.goals.manualLifeExpectancy;
  }
  return statisticalLifeExpectancy(plan);
}

import { BASE_LIFE_EXPECTANCY } from "./constants";

/** Statistical life expectancy from country + gender + health + scenario. */
export function statisticalLifeExpectancy(plan: RetirementPlan): number {
  const base = BASE_LIFE_EXPECTANCY[plan.country.retirement];
  const genderAdj =
    plan.personal.gender === "female" ? 3 : plan.personal.gender === "male" ? -1 : 1;
  const healthAdj =
    plan.personal.healthStatus === "excellent"
      ? 4
      : plan.personal.healthStatus === "good"
        ? 2
        : plan.personal.healthStatus === "poor"
          ? -4
          : 0;
  const scenarioAdj =
    plan.goals.lifeExpectancyScenario === "optimistic"
      ? 5
      : plan.goals.lifeExpectancyScenario === "conservative"
        ? -3
        : 0;
  return base + genderAdj + healthAdj + scenarioAdj;
}

/**
 * Run the full year-by-year projection.
 */
export function projectRetirement(
  plan: RetirementPlan,
  options: ProjectionOptions,
): ProjectionResult {
  const { retirementAge } = options;
  const lifeExpectancy = resolveLifeExpectancy(plan);
  const startAge = plan.personal.currentAge;
  const model = resolveReturnModel(plan.investment);
  const accReturn = options.accumulationReturn ?? model.expectedReturn;

  // Tax drag on taxable investment returns during accumulation.
  const taxableShare = taxableInvestmentShare(plan);
  const cgRate = workingProfile(plan.country).capitalGainsTaxRate;
  const dividendYield = 0.02; // assume 2% of taxable assets realised/taxed yearly
  const taxDragRate = taxableShare * dividendYield * cgRate;

  const mortgagePay = annualMortgagePayment(plan);
  const mortgageTermYears = plan.liabilities.mortgage.remainingTermYears;

  let corpus = investableCorpus(plan) - nonMortgageDebt(plan);
  const rows: YearProjection[] = [];
  let corpusAtRetirement = 0;
  let depletionAge: number | null = null;

  // Annual gross income (grows year on year during accumulation).
  let salary = plan.income.salary;
  let bonus = plan.income.bonus;
  const otherWorkIncome =
    plan.income.rentalIncome +
    plan.income.businessIncome +
    plan.income.dividendIncome +
    plan.income.interestIncome +
    plan.income.sideIncome;

  for (let age = startAge; age <= lifeExpectancy; age++) {
    const yearOffset = age - startAge;
    const retired = age >= retirementAge;
    const startingCorpus = corpus;

    let contributions = 0;
    let withdrawals = 0;
    let taxesPaid = 0;
    let otherIncomeNet = 0;

    // ---- Investment return (applied to starting corpus) ----
    const grossReturnRate = retired
      ? (options.retirementReturns
          ? options.retirementReturns(age - retirementAge)
          : model.expectedReturn)
      : accReturn;
    let investmentReturn = startingCorpus > 0 ? startingCorpus * grossReturnRate : 0;

    const expense = expensesForYear(plan, yearOffset, retired);
    const dependentCost = dependentCostForYear(plan, yearOffset);
    const lifeEvent = lifeEventCostForYear(plan, yearOffset);
    const mortgageThisYear = yearOffset < mortgageTermYears ? mortgagePay : 0;

    if (!retired) {
      // -------- Accumulation phase --------
      const grossIncome = salary + bonus + otherWorkIncome;
      const tax = incomeTax(grossIncome, workingProfile(plan.country));
      const netIncome = grossIncome - tax;
      contributions = Math.max(0, netIncome * plan.income.savingsRate);

      // Tax drag reduces effective return on taxable holdings.
      const drag = startingCorpus > 0 ? startingCorpus * taxDragRate : 0;
      investmentReturn -= drag;
      taxesPaid = tax + Math.max(0, drag);

      // Pre-retirement life events / dependent costs draw from savings/corpus.
      const preRetirementOutflow = lifeEvent + dependentCost + mortgageThisYear;
      corpus = startingCorpus + investmentReturn + contributions - preRetirementOutflow;

      otherIncomeNet = 0;
      rows.push({
        year: yearOffset,
        age,
        phase: "accumulation",
        startingCorpus,
        contributions,
        investmentReturn,
        otherIncome: 0,
        withdrawals: 0,
        taxesPaid,
        expenses: 0, // funded from salary, not corpus, during accumulation
        lifeEventCost: lifeEvent,
        endingCorpus: corpus,
      });

      // Grow income for next year.
      salary *= 1 + plan.income.annualSalaryGrowth;
      bonus *= 1 + plan.income.annualBonusGrowth;
      continue;
    }

    // -------- Decumulation (retirement) phase --------
    if (corpusAtRetirement === 0 && age === retirementAge) {
      corpusAtRetirement = startingCorpus + investmentReturn;
    }

    const income = retirementIncomeForYear(plan, age, yearOffset);
    otherIncomeNet = income.net;

    // One-time retirement spend in the first retirement year.
    const oneTime =
      age === retirementAge
        ? inflate(plan.expenses.oneTimeRetirementCost, plan.inflation.general, yearOffset)
        : 0;

    const spendNeed = expense + dependentCost + lifeEvent + mortgageThisYear + oneTime;
    const netNeedFromCorpus = Math.max(0, spendNeed - otherIncomeNet);

    // Gross up the withdrawal so the net (post-tax) covers the need.
    let grossWithdrawal = netNeedFromCorpus;
    let withdrawalTax = retirementWithdrawalTax(grossWithdrawal, {
      pensionPortion: pensionPortion(plan),
      profile: retirementProfile(plan.country),
    });
    grossWithdrawal = netNeedFromCorpus + withdrawalTax;

    const available = Math.max(0, startingCorpus + investmentReturn);
    if (grossWithdrawal > available) {
      grossWithdrawal = available;
      withdrawalTax = retirementWithdrawalTax(grossWithdrawal, {
        pensionPortion: pensionPortion(plan),
        profile: retirementProfile(plan.country),
      });
      if (depletionAge === null) depletionAge = age;
    }

    withdrawals = grossWithdrawal;
    taxesPaid = withdrawalTax + income.tax;
    corpus = startingCorpus + investmentReturn - withdrawals;
    if (corpus <= 0) {
      corpus = 0;
      if (depletionAge === null) depletionAge = age;
    }

    rows.push({
      year: yearOffset,
      age,
      phase: "retirement",
      startingCorpus,
      contributions: 0,
      investmentReturn,
      otherIncome: income.net,
      withdrawals,
      taxesPaid,
      expenses: spendNeed,
      lifeEventCost: lifeEvent,
      endingCorpus: corpus,
    });
  }

  if (corpusAtRetirement === 0) {
    // Retirement age at/after life expectancy — use last accumulation corpus.
    corpusAtRetirement = rows.length ? rows[rows.length - 1].endingCorpus : corpus;
  }

  return {
    retirementAge,
    rows,
    corpusAtRetirement,
    depletionAge,
    finalCorpus: rows.length ? rows[rows.length - 1].endingCorpus : corpus,
  };
}

/** Share of investable assets held in taxable (non-advantaged) accounts. */
function taxableInvestmentShare(plan: RetirementPlan): number {
  const taxable = plan.assets.investmentAccounts + plan.assets.alternatives;
  const advantaged = plan.assets.retirementAccounts + plan.assets.pensionValue;
  const total = taxable + advantaged;
  return total > 0 ? taxable / total : 0;
}

/** Share of withdrawals assumed to come from pension/retirement accounts. */
function pensionPortion(plan: RetirementPlan): number {
  const pension = plan.assets.retirementAccounts + plan.assets.pensionValue;
  const total = pension + plan.assets.investmentAccounts + plan.assets.alternatives;
  return total > 0 ? pension / total : 0;
}
