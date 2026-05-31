/**
 * Market scenario generators.
 *
 * Builds the deterministic return sequences used by the projection engine to
 * stress-test a plan: normal markets, immediate crash, mid-retirement crashes,
 * late crash, multiple crashes, and fully custom sequences.
 */
import type { CrashSpec, MarketScenario } from "@/domain/types";

export function normalScenario(baselineReturn: number): MarketScenario {
  return {
    kind: "normal",
    label: "Normal market",
    baselineReturn,
    crashes: [],
  };
}

export function immediateCrashScenario(baselineReturn: number, drop = -0.3): MarketScenario {
  return {
    kind: "immediate-crash",
    label: `Immediate crash (${pct(drop)})`,
    baselineReturn,
    crashes: [{ yearIndex: 0, drop }],
  };
}

export function midCrashScenario(
  baselineReturn: number,
  yearIndex = 10,
  drop = -0.35,
): MarketScenario {
  return {
    kind: "mid-crash",
    label: `Mid-retirement crash (year ${yearIndex}, ${pct(drop)})`,
    baselineReturn,
    crashes: [{ yearIndex, drop }],
  };
}

export function lateCrashScenario(
  baselineReturn: number,
  yearIndex = 22,
  drop = -0.3,
): MarketScenario {
  return {
    kind: "late-crash",
    label: `Late-retirement crash (year ${yearIndex}, ${pct(drop)})`,
    baselineReturn,
    crashes: [{ yearIndex, drop }],
  };
}

export function multipleCrashesScenario(
  baselineReturn: number,
  crashes: CrashSpec[] = [
    { yearIndex: 3, drop: -0.25 },
    { yearIndex: 12, drop: -0.3 },
    { yearIndex: 20, drop: -0.2 },
  ],
): MarketScenario {
  return {
    kind: "multiple-crashes",
    label: "Multiple crashes",
    baselineReturn,
    crashes,
  };
}

export function customSequenceScenario(returns: number[]): MarketScenario {
  return {
    kind: "custom-sequence",
    label: "Custom return sequence",
    baselineReturn: returns.length ? average(returns) : 0,
    crashes: [],
    customReturns: returns,
  };
}

/**
 * Resolve the return for a given retirement year index under a scenario.
 * Crashes override the baseline; custom sequences take precedence entirely.
 */
export function returnForYear(scenario: MarketScenario, yearIndex: number): number {
  if (scenario.customReturns) {
    return scenario.customReturns[yearIndex] ?? scenario.baselineReturn;
  }
  const crash = scenario.crashes.find((c) => c.yearIndex === yearIndex);
  return crash ? crash.drop : scenario.baselineReturn;
}

/** The standard battery of scenarios for a given baseline and horizon. */
export function standardScenarioSet(baselineReturn: number, horizonYears: number): MarketScenario[] {
  const mid = Math.max(1, Math.round(horizonYears * 0.33));
  const late = Math.max(2, Math.round(horizonYears * 0.85));
  return [
    normalScenario(baselineReturn),
    immediateCrashScenario(baselineReturn),
    midCrashScenario(baselineReturn, mid),
    lateCrashScenario(baselineReturn, late),
    multipleCrashesScenario(baselineReturn),
  ];
}

function average(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function pct(x: number): string {
  return `${(x * 100).toFixed(0)}%`;
}
