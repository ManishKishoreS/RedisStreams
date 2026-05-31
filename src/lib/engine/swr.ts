/**
 * Safe Withdrawal Rate (SWR) engine.
 *
 * Produces country-aware conservative / moderate / aggressive withdrawal rates
 * and adjusts them for retirement horizon and asset allocation. Longer horizons
 * and higher cash/bond weightings pull the safe rate down.
 */
import type { AssetAllocation, CountryConfig, SwrAnalysis, SwrStance } from "@/domain/types";
import { retirementProfile } from "./tax";

export interface SwrInputs {
  country: CountryConfig;
  stance: SwrStance;
  /** Expected number of years in retirement. */
  horizonYears: number;
  allocation: AssetAllocation;
}

/**
 * Horizon adjustment: the classic 4% rule assumes a 30-year horizon. Longer
 * horizons require a lower rate, shorter horizons permit a higher one.
 */
export function horizonAdjustment(horizonYears: number): number {
  const baseline = 30;
  // ~0.05 percentage points per year deviation, capped.
  const delta = (baseline - horizonYears) * 0.0005;
  return clamp(delta, -0.012, 0.012);
}

/**
 * Allocation adjustment: more equity supports a marginally higher SWR, more
 * cash drags it down (lower expected real return).
 */
export function allocationAdjustment(allocation: AssetAllocation): number {
  const growthWeight = allocation.stocks + 0.5 * allocation.property + 0.5 * allocation.alternatives;
  // Centre at 60% growth assets -> 0 adjustment.
  return clamp((growthWeight - 0.6) * 0.01, -0.006, 0.006);
}

export function computeSwr(inputs: SwrInputs): SwrAnalysis {
  const profile = retirementProfile(inputs.country);
  const band = profile.swr;
  const adj = horizonAdjustment(inputs.horizonYears) + allocationAdjustment(inputs.allocation);

  const conservative = round4(Math.max(0.01, band.conservative + adj));
  const moderate = round4(Math.max(0.01, band.moderate + adj));
  const aggressive = round4(Math.max(0.01, band.aggressive + adj));

  const recommended =
    inputs.stance === "conservative"
      ? conservative
      : inputs.stance === "aggressive"
        ? aggressive
        : moderate;

  const rationale =
    `${profile.name} baseline SWR band is ${pct(band.conservative)}–${pct(band.aggressive)}. ` +
    `Adjusted by ${signedPct(adj)} for a ${inputs.horizonYears}-year horizon and ` +
    `${pct(growthShare(inputs.allocation))} growth-asset allocation. ` +
    `Selected ${inputs.stance} stance => ${pct(recommended)} withdrawal rate.`;

  return { conservative, moderate, aggressive, recommended, rationale };
}

function growthShare(a: AssetAllocation): number {
  return a.stocks + 0.5 * a.property + 0.5 * a.alternatives;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}
function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}
function signedPct(x: number): string {
  return `${x >= 0 ? "+" : ""}${(x * 100).toFixed(2)}pp`;
}
