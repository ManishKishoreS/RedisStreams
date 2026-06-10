import { describe, it, expect } from "vitest";
import { runMonteCarlo, percentile } from "./montecarlo";
import { samplePlanUKtoPortugal } from "@/lib/sample-data";
import type { RetirementPlan } from "@/domain/types";

const plan = samplePlanUKtoPortugal;

describe("percentile", () => {
  it("returns 0 for empty arrays", () => {
    expect(percentile([], 0.5)).toBe(0);
  });
  it("returns the correct order statistics", () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(sorted, 0)).toBe(1);
    expect(percentile(sorted, 1)).toBe(10);
    expect(percentile(sorted, 0.5)).toBeGreaterThanOrEqual(5);
  });
});

describe("runMonteCarlo", () => {
  it("is deterministic with a fixed seed", () => {
    const a = runMonteCarlo(plan, { retirementAge: 60, runs: 500, seed: 1 });
    const b = runMonteCarlo(plan, { retirementAge: 60, runs: 500, seed: 1 });
    expect(a.successProbability).toBe(b.successProbability);
    expect(a.median).toBe(b.median);
  });

  it("success and depletion probabilities sum to 1", () => {
    const r = runMonteCarlo(plan, { retirementAge: 60, runs: 500, seed: 2 });
    expect(r.successProbability + r.depletionProbability).toBeCloseTo(1, 8);
    expect(r.successProbability).toBeGreaterThanOrEqual(0);
    expect(r.successProbability).toBeLessThanOrEqual(1);
  });

  it("best >= median >= worst", () => {
    const r = runMonteCarlo(plan, { retirementAge: 60, runs: 500, seed: 3 });
    expect(r.best).toBeGreaterThanOrEqual(r.median);
    expect(r.median).toBeGreaterThanOrEqual(r.worst);
  });

  it("retiring later improves success probability", () => {
    const early = runMonteCarlo(plan, { retirementAge: 52, runs: 500, seed: 4 });
    const late = runMonteCarlo(plan, { retirementAge: 68, runs: 500, seed: 4 });
    expect(late.successProbability).toBeGreaterThanOrEqual(early.successProbability);
  });

  it("histogram counts sum to the number of runs", () => {
    const runs = 400;
    const r = runMonteCarlo(plan, { retirementAge: 60, runs, seed: 5 });
    const total = r.histogram.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(runs);
  });

  it("a richer plan has higher success than a poorer one", () => {
    const poor: RetirementPlan = {
      ...plan,
      assets: { ...plan.assets, retirementAccounts: 0, investmentAccounts: 0, pensionValue: 0 },
    };
    const rich = runMonteCarlo(plan, { retirementAge: 60, runs: 400, seed: 6 });
    const poorRes = runMonteCarlo(poor, { retirementAge: 60, runs: 400, seed: 6 });
    expect(rich.successProbability).toBeGreaterThanOrEqual(poorRes.successProbability);
  });
});
