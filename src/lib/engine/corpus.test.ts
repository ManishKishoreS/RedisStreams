import { describe, it, expect } from "vitest";
import { computeRequiredCorpus, firstYearRetirementExpenses } from "./corpus";
import { samplePlanUKtoPortugal } from "@/lib/sample-data";

const plan = samplePlanUKtoPortugal;

describe("firstYearRetirementExpenses", () => {
  it("inflates expenses to the retirement year", () => {
    const atNow = firstYearRetirementExpenses(
      { ...plan, personal: { ...plan.personal, currentAge: 60 } },
      60,
    );
    const at60from40 = firstYearRetirementExpenses(plan, 60);
    // Retiring 20 years out should require more nominal spend than retiring now.
    expect(at60from40).toBeGreaterThan(atNow);
  });

  it("is reduced by guaranteed retirement income", () => {
    const withPension = firstYearRetirementExpenses(plan, 67); // state pension active at 67
    const noPension = firstYearRetirementExpenses(
      { ...plan, retirementIncome: [] },
      67,
    );
    expect(withPension).toBeLessThan(noPension);
  });
});

describe("computeRequiredCorpus", () => {
  it("required corpus = first-year expenses / SWR plus legacy allowance", () => {
    const swr = 0.035;
    const r = computeRequiredCorpus({
      plan: { ...plan, goals: { ...plan.goals, legacyGoal: 0 } },
      retirementAge: 60,
      safeWithdrawalRate: swr,
      projectedCorpus: 1_000_000,
    });
    expect(r.requiredCorpus).toBeCloseTo(r.firstYearRetirementExpenses / swr, 4);
  });

  it("a legacy goal increases the required corpus", () => {
    const noLegacy = computeRequiredCorpus({
      plan: { ...plan, goals: { ...plan.goals, legacyGoal: 0 } },
      retirementAge: 60,
      safeWithdrawalRate: 0.035,
      projectedCorpus: 1_000_000,
    });
    const withLegacy = computeRequiredCorpus({
      plan: { ...plan, goals: { ...plan.goals, legacyGoal: 200000 } },
      retirementAge: 60,
      safeWithdrawalRate: 0.035,
      projectedCorpus: 1_000_000,
    });
    expect(withLegacy.requiredCorpus).toBeGreaterThan(noLegacy.requiredCorpus);
  });

  it("shortfall is positive when projected < required", () => {
    const r = computeRequiredCorpus({
      plan,
      retirementAge: 55,
      safeWithdrawalRate: 0.03,
      projectedCorpus: 100_000,
    });
    expect(r.shortfall).toBeGreaterThan(0);
  });

  it("lower SWR requires a larger corpus", () => {
    const low = computeRequiredCorpus({
      plan,
      retirementAge: 60,
      safeWithdrawalRate: 0.025,
      projectedCorpus: 0,
    });
    const high = computeRequiredCorpus({
      plan,
      retirementAge: 60,
      safeWithdrawalRate: 0.05,
      projectedCorpus: 0,
    });
    expect(low.requiredCorpus).toBeGreaterThan(high.requiredCorpus);
  });
});
