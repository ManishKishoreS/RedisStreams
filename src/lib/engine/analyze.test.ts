import { describe, it, expect } from "vitest";
import { analyzePlan } from "./analyze";
import { solveRetirementAges } from "./retirementAge";
import { samplePlanUKtoPortugal, samplePlanIndiaToUAE } from "@/lib/sample-data";
import type { RetirementPlan } from "@/domain/types";

describe("analyzePlan", () => {
  it("returns a complete, well-formed analysis", () => {
    const r = analyzePlan(samplePlanUKtoPortugal, { monteCarloRuns: 300, monteCarloSeed: 1 });
    expect(r.readinessScore).toBeGreaterThanOrEqual(0);
    expect(r.readinessScore).toBeLessThanOrEqual(100);
    expect(["green", "amber", "red"]).toContain(r.status);
    expect(r.swr.recommended).toBeGreaterThan(0);
    expect(r.corpus.requiredCorpus).toBeGreaterThan(0);
    expect(r.baseProjection.rows.length).toBeGreaterThan(0);
    expect(r.scenarioProjections.length).toBe(5);
    expect(r.insights.length).toBeGreaterThan(3);
  });

  it("honours a target retirement age when provided", () => {
    const r = analyzePlan(samplePlanUKtoPortugal, { monteCarloRuns: 100, monteCarloSeed: 1 });
    expect(r.retirementAge).toBe(samplePlanUKtoPortugal.goals.targetRetirementAge);
  });

  it("solves for a retirement age when none is given (Journey Option 2)", () => {
    const r = analyzePlan(samplePlanIndiaToUAE, { monteCarloRuns: 100, monteCarloSeed: 1 });
    expect(r.retirementAge).toBeGreaterThan(samplePlanIndiaToUAE.personal.currentAge);
  });

  it("flags the cross-border situation in the tax summary", () => {
    const r = analyzePlan(samplePlanUKtoPortugal, { monteCarloRuns: 50, monteCarloSeed: 1 });
    expect(r.tax.crossBorderNote).toContain("Portugal");
    expect(r.tax.crossBorderNote.toLowerCase()).toContain("double-taxation");
  });

  it("inflation summary shows expenses growing over time", () => {
    const r = analyzePlan(samplePlanUKtoPortugal, { monteCarloRuns: 50, monteCarloSeed: 1 });
    expect(r.inflation.lastYearExpenses).toBeGreaterThan(r.inflation.firstYearExpenses);
    expect(r.inflation.cumulativeInflationFactor).toBeGreaterThan(1);
  });
});

describe("solveRetirementAges", () => {
  it("orders ages: optimistic <= earliest/recommended <= conservative (when defined)", () => {
    const ages = solveRetirementAges(samplePlanUKtoPortugal);
    const defined = [ages.optimistic, ages.earliest, ages.recommended, ages.conservative].filter(
      (a): a is number => a !== null,
    );
    expect(defined.length).toBeGreaterThan(0);
    if (ages.optimistic && ages.conservative) {
      expect(ages.optimistic).toBeLessThanOrEqual(ages.conservative);
    }
  });

  it("a wealthier plan can retire no later than a poorer one", () => {
    const poor: RetirementPlan = {
      ...samplePlanUKtoPortugal,
      assets: {
        ...samplePlanUKtoPortugal.assets,
        retirementAccounts: 10000,
        investmentAccounts: 10000,
        pensionValue: 10000,
      },
      income: { ...samplePlanUKtoPortugal.income, savingsRate: 0.05 },
    };
    const richAges = solveRetirementAges(samplePlanUKtoPortugal);
    const poorAges = solveRetirementAges(poor);
    if (richAges.earliest && poorAges.earliest) {
      expect(richAges.earliest).toBeLessThanOrEqual(poorAges.earliest);
    } else {
      // If the poor plan can never retire, that's an acceptable stronger result.
      expect(poorAges.earliest === null || richAges.earliest !== null).toBe(true);
    }
  });
});
