/**
 * Monte Carlo simulation engine.
 *
 * Runs N independent projections, drawing each retirement year's return from a
 * normal distribution parameterised by the portfolio's expected return and
 * volatility. Captures sequence-of-returns risk (the order of returns matters
 * because withdrawals happen each year). Returns success/depletion probability
 * and a distribution of terminal balances.
 */
import type { MonteCarloResult, RetirementPlan } from "@/domain/types";
import { mulberry32, normalWith, type Rng } from "./random";
import { projectRetirement } from "./projection";
import { resolveReturnModel } from "./portfolio";

export interface MonteCarloOptions {
  retirementAge: number;
  runs: number;
  seed?: number;
}

export function runMonteCarlo(
  plan: RetirementPlan,
  options: MonteCarloOptions,
): MonteCarloResult {
  const { retirementAge, runs } = options;
  const model = resolveReturnModel(plan.investment);
  const rng: Rng = mulberry32(options.seed ?? 0x9e3779b9);

  const terminals: number[] = [];
  let successes = 0;

  for (let i = 0; i < runs; i++) {
    // Pre-draw a return sequence for this run.
    const seq: number[] = [];
    const result = projectRetirement(plan, {
      retirementAge,
      retirementReturns: (yearIndex) => {
        if (seq[yearIndex] === undefined) {
          seq[yearIndex] = normalWith(rng, model.expectedReturn, model.volatility);
        }
        return seq[yearIndex];
      },
    });

    const terminal = result.finalCorpus;
    terminals.push(terminal);
    // Success = never depleted before death AND meets legacy intent (>= 0).
    if (result.depletionAge === null && terminal >= 0) {
      successes++;
    }
  }

  terminals.sort((a, b) => a - b);
  const successProbability = runs > 0 ? successes / runs : 0;

  return {
    runs,
    successProbability,
    depletionProbability: 1 - successProbability,
    median: percentile(terminals, 0.5),
    best: terminals[terminals.length - 1] ?? 0,
    worst: terminals[0] ?? 0,
    percentiles: {
      p10: percentile(terminals, 0.1),
      p25: percentile(terminals, 0.25),
      p50: percentile(terminals, 0.5),
      p75: percentile(terminals, 0.75),
      p90: percentile(terminals, 0.9),
    },
    histogram: buildHistogram(terminals, 12),
  };
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

function buildHistogram(sorted: number[], buckets: number): { bucket: number; count: number }[] {
  if (sorted.length === 0) return [];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min || 1;
  const width = range / buckets;
  const hist = Array.from({ length: buckets }, (_, i) => ({
    bucket: Math.round(min + width * (i + 0.5)),
    count: 0,
  }));
  for (const v of sorted) {
    let idx = Math.floor((v - min) / width);
    if (idx >= buckets) idx = buckets - 1;
    if (idx < 0) idx = 0;
    hist[idx].count++;
  }
  return hist;
}
