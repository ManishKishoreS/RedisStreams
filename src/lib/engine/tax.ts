/**
 * Tax engine.
 *
 * Provides progressive income tax, plus flat treatment for capital gains,
 * dividends and pension withdrawals, using per-country reference profiles.
 * Cross-border relief is approximated via double-taxation agreements: when a
 * DTA exists, the taxpayer effectively pays the higher of the two jurisdictions
 * rather than the sum; without a DTA, both may apply.
 */
import type { CountryConfig, CountryTaxProfile } from "@/domain/types";
import { COUNTRY_PROFILES } from "./constants";

/** Progressive income tax on `income` using a profile's brackets. */
export function incomeTax(income: number, profile: CountryTaxProfile): number {
  if (income <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const bracket of profile.incomeTaxBrackets) {
    const upper = bracket.upTo ?? Infinity;
    if (income > lower) {
      const taxableInBand = Math.min(income, upper) - lower;
      tax += taxableInBand * bracket.rate;
    }
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}

/** Effective average income tax rate. */
export function effectiveIncomeTaxRate(income: number, profile: CountryTaxProfile): number {
  if (income <= 0) return 0;
  return incomeTax(income, profile) / income;
}

export function capitalGainsTax(gain: number, profile: CountryTaxProfile): number {
  return Math.max(0, gain) * profile.capitalGainsTaxRate;
}

export function dividendTax(dividends: number, profile: CountryTaxProfile): number {
  return Math.max(0, dividends) * profile.dividendTaxRate;
}

export function pensionWithdrawalTax(amount: number, profile: CountryTaxProfile): number {
  return Math.max(0, amount) * profile.pensionWithdrawalTaxRate;
}

/**
 * Reconcile tax across two jurisdictions for the same income.
 * @returns the combined tax due after DTA relief.
 */
export function crossBorderTax(
  homeTax: number,
  hostTax: number,
  hasDoubleTaxationAgreement: boolean,
): number {
  if (hasDoubleTaxationAgreement) {
    // DTA: relief means you effectively pay the higher of the two.
    return Math.max(homeTax, hostTax);
  }
  // No DTA: worst case both jurisdictions tax the income.
  return homeTax + hostTax;
}

export function workingProfile(country: CountryConfig): CountryTaxProfile {
  return COUNTRY_PROFILES[country.working];
}

export function retirementProfile(country: CountryConfig): CountryTaxProfile {
  return COUNTRY_PROFILES[country.retirement];
}

/**
 * Blended effective tax on a retirement-year withdrawal that is composed of
 * taxable investment drawdown (capital gains) and pension income. This is the
 * decumulation-phase tax used by the projection engine.
 */
export function retirementWithdrawalTax(
  withdrawal: number,
  opts: { pensionPortion: number; profile: CountryTaxProfile },
): number {
  const pensionAmount = withdrawal * clamp01(opts.pensionPortion);
  const investmentAmount = withdrawal - pensionAmount;
  // Investment withdrawals: only the gain portion is taxed. Assume a mature
  // portfolio where ~50% of a withdrawal represents accumulated gains.
  const gainPortion = investmentAmount * 0.5;
  return (
    pensionWithdrawalTax(pensionAmount, opts.profile) +
    capitalGainsTax(gainPortion, opts.profile)
  );
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
