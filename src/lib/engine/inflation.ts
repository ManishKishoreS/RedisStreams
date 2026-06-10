/**
 * Inflation modelling.
 *
 * Supports a general inflation rate plus category-specific rates (healthcare,
 * education, housing, travel). Expenses inflate year-by-year via compounding.
 */
import type { ExpenseCategory, InflationConfig } from "@/domain/types";

/** Compounding inflation factor after `years` at annual `rate`. */
export function inflationFactor(rate: number, years: number): number {
  if (years < 0) throw new Error("years must be >= 0");
  return Math.pow(1 + rate, years);
}

/** Inflate a present-day amount forward `years` at annual `rate`. */
export function inflate(amount: number, rate: number, years: number): number {
  return amount * inflationFactor(rate, years);
}

/** Discount a future amount back to today's money at annual `rate`. */
export function presentValue(amount: number, rate: number, years: number): number {
  return amount / inflationFactor(rate, years);
}

/**
 * Resolve the inflation rate applicable to a given expense category. Falls back
 * to the general rate for categories without a specific override.
 */
export function rateForCategory(config: InflationConfig, category: ExpenseCategory): number {
  switch (category) {
    case "healthcare":
      return config.healthcare;
    case "education":
      return config.education;
    case "housing":
      return config.housing;
    case "travel":
      return config.travel;
    default:
      return config.general;
  }
}

/**
 * The real (inflation-adjusted) return given a nominal return and inflation.
 * Uses the exact Fisher relation rather than the (nominal - inflation)
 * approximation.
 */
export function realReturn(nominal: number, inflation: number): number {
  return (1 + nominal) / (1 + inflation) - 1;
}
