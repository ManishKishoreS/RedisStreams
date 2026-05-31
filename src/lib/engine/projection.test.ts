import { describe, it, expect } from "vitest";
import {
  projectRetirement,
  investableCorpus,
  nonMortgageDebt,
  annualMortgagePayment,
  baseAnnualExpenses,
  statisticalLifeExpectancy,
  resolveLifeExpectancy,
} from "./projection";
import { samplePlanUKtoPortugal } from "@/lib/sample-data";
import type { RetirementPlan } from "@/domain/types";

const plan = samplePlanUKtoPortugal;

describe("projection helpers", () => {
  it("investableCorpus sums liquid + invested assets and excludes primary home", () => {
    const c = investableCorpus(plan);
    expect(c).toBe(
      plan.assets.cash +
        plan.assets.fixedDeposits +
        plan.assets.pensionValue +
        plan.assets.investmentAccounts +
        plan.assets.retirementAccounts +
        plan.assets.realEstateInvestment +
        plan.assets.alternatives,
    );
    // Primary residence is excluded from the investable corpus.
    expect(c).toBeLessThan(c + plan.assets.realEstatePrimary);
  });

  it("nonMortgageDebt sums non-mortgage liabilities", () => {
    expect(nonMortgageDebt(plan)).toBe(3000);
  });

  it("annualMortgagePayment is positive and amortises", () => {
    const pay = annualMortgagePayment(plan);
    expect(pay).toBeGreaterThan(0);
    // Total payments should exceed the principal (interest is paid).
    expect(pay * plan.liabilities.mortgage.remainingTermYears).toBeGreaterThan(
      plan.liabilities.mortgage.outstanding,
    );
  });

  it("zero-interest mortgage divides principal evenly", () => {
    const p2: RetirementPlan = {
      ...plan,
      liabilities: {
        ...plan.liabilities,
        mortgage: { outstanding: 120000, interestRate: 0, remainingTermYears: 10 },
      },
    };
    expect(annualMortgagePayment(p2)).toBeCloseTo(12000, 6);
  });

  it("baseAnnualExpenses sums monthly*12 plus additional annual", () => {
    const monthlySum = Object.values(plan.expenses.monthly).reduce((a, b) => a + b, 0);
    expect(baseAnnualExpenses(plan)).toBeCloseTo(monthlySum * 12 + plan.expenses.additionalAnnual, 6);
  });
});

describe("statisticalLifeExpectancy", () => {
  it("adjusts for gender, health and scenario", () => {
    const base = statisticalLifeExpectancy(plan); // PRT base 81, female +3, good +2, average 0
    expect(base).toBe(81 + 3 + 2);
  });

  it("manual mode overrides the statistical estimate", () => {
    const p: RetirementPlan = {
      ...plan,
      goals: { ...plan.goals, lifeExpectancyMode: "manual", manualLifeExpectancy: 100 },
    };
    expect(resolveLifeExpectancy(p)).toBe(100);
  });
});

describe("projectRetirement", () => {
  it("produces a row for every year from current age to life expectancy", () => {
    const le = resolveLifeExpectancy(plan);
    const result = projectRetirement(plan, { retirementAge: 60 });
    expect(result.rows[0].age).toBe(plan.personal.currentAge);
    expect(result.rows[result.rows.length - 1].age).toBe(le);
    expect(result.rows.length).toBe(le - plan.personal.currentAge + 1);
  });

  it("starting corpus equals investable corpus minus non-mortgage debt", () => {
    const result = projectRetirement(plan, { retirementAge: 60 });
    expect(result.rows[0].startingCorpus).toBeCloseTo(
      investableCorpus(plan) - nonMortgageDebt(plan),
      6,
    );
  });

  it("accumulation phase contributes and grows the corpus", () => {
    const result = projectRetirement(plan, { retirementAge: 60 });
    const accRows = result.rows.filter((r) => r.phase === "accumulation");
    expect(accRows.length).toBeGreaterThan(0);
    expect(accRows[0].contributions).toBeGreaterThan(0);
    // Corpus at retirement should exceed the starting corpus given saving + growth.
    expect(result.corpusAtRetirement).toBeGreaterThan(result.rows[0].startingCorpus);
  });

  it("retirement phase draws down via withdrawals", () => {
    const result = projectRetirement(plan, { retirementAge: 60 });
    const retRows = result.rows.filter((r) => r.phase === "retirement");
    expect(retRows.length).toBeGreaterThan(0);
    expect(retRows.some((r) => r.withdrawals > 0)).toBe(true);
  });

  it("a severe permanent crash causes earlier depletion than normal markets", () => {
    const normal = projectRetirement(plan, { retirementAge: 55 });
    const crash = projectRetirement(plan, {
      retirementAge: 55,
      retirementReturns: () => -0.05, // persistent negative returns
    });
    const normalEnd = normal.depletionAge ?? 999;
    const crashEnd = crash.depletionAge ?? 999;
    expect(crashEnd).toBeLessThanOrEqual(normalEnd);
  });

  it("corpus never goes negative and records depletion age", () => {
    const result = projectRetirement(plan, {
      retirementAge: 50,
      retirementReturns: () => -0.1,
    });
    for (const row of result.rows) {
      expect(row.endingCorpus).toBeGreaterThanOrEqual(0);
    }
    expect(result.depletionAge).not.toBeNull();
  });
});
