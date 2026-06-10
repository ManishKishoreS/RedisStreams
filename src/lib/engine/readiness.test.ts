import { describe, it, expect } from "vitest";
import { computeReadiness, fundingRatio, emergencyFundCoverage } from "./readiness";
import { samplePlanUKtoPortugal } from "@/lib/sample-data";
import type { CorpusAnalysis, MonteCarloResult } from "@/domain/types";

const plan = samplePlanUKtoPortugal;

function corpus(projected: number, required: number): CorpusAnalysis {
  return {
    requiredCorpus: required,
    projectedCorpus: projected,
    shortfall: required - projected,
    firstYearRetirementExpenses: 40000,
    safeWithdrawalRate: 0.035,
  };
}

function mc(success: number): MonteCarloResult {
  return {
    runs: 1000,
    successProbability: success,
    depletionProbability: 1 - success,
    median: 0,
    best: 0,
    worst: 0,
    percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
    histogram: [],
  };
}

describe("fundingRatio", () => {
  it("is the ratio of projected to required corpus", () => {
    expect(fundingRatio(corpus(500000, 1000000))).toBeCloseTo(0.5, 6);
  });
  it("is 1 when nothing is required", () => {
    expect(fundingRatio(corpus(0, 0))).toBe(1);
  });
});

describe("emergencyFundCoverage", () => {
  it("is between 0 and 1", () => {
    const c = emergencyFundCoverage(plan);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(1);
  });
});

describe("computeReadiness", () => {
  it("a fully funded high-probability plan scores green", () => {
    const { score, status } = computeReadiness({
      plan,
      corpus: corpus(1_200_000, 1_000_000),
      monteCarlo: mc(0.95),
      yearsMoneyLasts: 30,
      yearsNeeded: 30,
    });
    expect(score).toBeGreaterThanOrEqual(75);
    expect(status).toBe("green");
  });

  it("an underfunded low-probability plan scores red", () => {
    const { score, status } = computeReadiness({
      plan,
      corpus: corpus(150_000, 1_000_000),
      monteCarlo: mc(0.2),
      yearsMoneyLasts: 8,
      yearsNeeded: 30,
    });
    expect(score).toBeLessThan(50);
    expect(status).toBe("red");
  });

  it("score is bounded to 0..100", () => {
    const { score } = computeReadiness({
      plan,
      corpus: corpus(10_000_000, 1_000_000),
      monteCarlo: mc(1),
      yearsMoneyLasts: 60,
      yearsNeeded: 30,
    });
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
