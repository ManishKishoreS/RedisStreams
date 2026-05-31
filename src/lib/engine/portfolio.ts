/**
 * Portfolio maths: derive a blended expected return and volatility from an
 * asset allocation, and normalise allocations that don't sum to 1.
 */
import type { AssetAllocation, InvestmentConfig } from "@/domain/types";
import { ASSET_CLASS_RETURNS, ASSET_CLASS_VOL, RISK_PRESETS } from "./constants";

export function normaliseAllocation(a: AssetAllocation): AssetAllocation {
  const total = a.stocks + a.bonds + a.cash + a.property + a.alternatives;
  if (total <= 0) {
    return { stocks: 0, bonds: 0, cash: 1, property: 0, alternatives: 0 };
  }
  return {
    stocks: a.stocks / total,
    bonds: a.bonds / total,
    cash: a.cash / total,
    property: a.property / total,
    alternatives: a.alternatives / total,
  };
}

/** Weighted blended nominal expected return from the allocation. */
export function blendedReturn(a: AssetAllocation): number {
  const n = normaliseAllocation(a);
  return (
    n.stocks * ASSET_CLASS_RETURNS.stocks +
    n.bonds * ASSET_CLASS_RETURNS.bonds +
    n.cash * ASSET_CLASS_RETURNS.cash +
    n.property * ASSET_CLASS_RETURNS.property +
    n.alternatives * ASSET_CLASS_RETURNS.alternatives
  );
}

/**
 * Blended volatility. We assume zero cross-correlation as a simplification,
 * giving portfolio variance = sum(w_i^2 * vol_i^2). This understates real
 * volatility slightly but is stable and monotonic for modelling.
 */
export function blendedVolatility(a: AssetAllocation): number {
  const n = normaliseAllocation(a);
  const variance =
    Math.pow(n.stocks * ASSET_CLASS_VOL.stocks, 2) +
    Math.pow(n.bonds * ASSET_CLASS_VOL.bonds, 2) +
    Math.pow(n.cash * ASSET_CLASS_VOL.cash, 2) +
    Math.pow(n.property * ASSET_CLASS_VOL.property, 2) +
    Math.pow(n.alternatives * ASSET_CLASS_VOL.alternatives, 2);
  return Math.sqrt(variance);
}

/**
 * Resolve the effective expected return and volatility from an investment
 * config: explicit values for custom risk profiles, presets otherwise, but
 * always respecting an explicit non-zero expectedReturn override.
 */
export function resolveReturnModel(config: InvestmentConfig): {
  expectedReturn: number;
  volatility: number;
} {
  if (config.riskProfile === "custom") {
    return {
      expectedReturn: config.expectedReturn,
      volatility: config.volatility > 0 ? config.volatility : blendedVolatility(config.allocation),
    };
  }
  const preset = RISK_PRESETS[config.riskProfile];
  return {
    expectedReturn: config.expectedReturn > 0 ? config.expectedReturn : preset.expectedReturn,
    volatility: config.volatility > 0 ? config.volatility : preset.volatility,
  };
}
