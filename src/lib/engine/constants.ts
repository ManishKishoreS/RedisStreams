/**
 * Reference data for the financial engine.
 *
 * NOTE: These figures are illustrative defaults suitable for modelling and
 * education. They are NOT tax advice and should be reviewed against current
 * legislation before being relied upon. Each country profile is intentionally
 * simplified to a tractable model (progressive income brackets + flat rates
 * for the other heads of tax).
 */
import type { CountryCode, CountryTaxProfile, RiskProfile } from "@/domain/types";

export const COUNTRY_PROFILES: Record<CountryCode, CountryTaxProfile> = {
  UK: {
    code: "UK",
    name: "United Kingdom",
    currency: "GBP",
    incomeTaxBrackets: [
      { upTo: 12570, rate: 0 },
      { upTo: 50270, rate: 0.2 },
      { upTo: 125140, rate: 0.4 },
      { upTo: null, rate: 0.45 },
    ],
    capitalGainsTaxRate: 0.2,
    dividendTaxRate: 0.3375,
    pensionWithdrawalTaxRate: 0.15, // blended, accounting for 25% tax-free lump
    wealthTaxRate: 0,
    inheritanceTaxRate: 0.4,
    swr: { conservative: 0.032, moderate: 0.037, aggressive: 0.042 },
  },
  USA: {
    code: "USA",
    name: "United States",
    currency: "USD",
    incomeTaxBrackets: [
      { upTo: 11600, rate: 0.1 },
      { upTo: 47150, rate: 0.12 },
      { upTo: 100525, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243725, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
    capitalGainsTaxRate: 0.15,
    dividendTaxRate: 0.15,
    pensionWithdrawalTaxRate: 0.22,
    wealthTaxRate: 0,
    inheritanceTaxRate: 0.4,
    swr: { conservative: 0.035, moderate: 0.04, aggressive: 0.045 },
  },
  CAN: {
    code: "CAN",
    name: "Canada",
    currency: "CAD",
    incomeTaxBrackets: [
      { upTo: 55867, rate: 0.15 },
      { upTo: 111733, rate: 0.205 },
      { upTo: 173205, rate: 0.26 },
      { upTo: 246752, rate: 0.29 },
      { upTo: null, rate: 0.33 },
    ],
    capitalGainsTaxRate: 0.165, // ~50% inclusion at marginal
    dividendTaxRate: 0.25,
    pensionWithdrawalTaxRate: 0.2,
    wealthTaxRate: 0,
    inheritanceTaxRate: 0,
    swr: { conservative: 0.033, moderate: 0.038, aggressive: 0.043 },
  },
  AUS: {
    code: "AUS",
    name: "Australia",
    currency: "AUD",
    incomeTaxBrackets: [
      { upTo: 18200, rate: 0 },
      { upTo: 45000, rate: 0.19 },
      { upTo: 135000, rate: 0.325 },
      { upTo: 190000, rate: 0.37 },
      { upTo: null, rate: 0.45 },
    ],
    capitalGainsTaxRate: 0.235,
    dividendTaxRate: 0.3,
    pensionWithdrawalTaxRate: 0, // superannuation pension phase largely tax-free 60+
    wealthTaxRate: 0,
    inheritanceTaxRate: 0,
    swr: { conservative: 0.033, moderate: 0.038, aggressive: 0.043 },
  },
  IND: {
    code: "IND",
    name: "India",
    currency: "INR",
    incomeTaxBrackets: [
      { upTo: 300000, rate: 0 },
      { upTo: 700000, rate: 0.05 },
      { upTo: 1000000, rate: 0.1 },
      { upTo: 1200000, rate: 0.15 },
      { upTo: 1500000, rate: 0.2 },
      { upTo: null, rate: 0.3 },
    ],
    capitalGainsTaxRate: 0.125, // LTCG on equity
    dividendTaxRate: 0.3,
    pensionWithdrawalTaxRate: 0.1,
    wealthTaxRate: 0,
    inheritanceTaxRate: 0,
    swr: { conservative: 0.025, moderate: 0.03, aggressive: 0.035 },
  },
  SGP: {
    code: "SGP",
    name: "Singapore",
    currency: "SGD",
    incomeTaxBrackets: [
      { upTo: 20000, rate: 0 },
      { upTo: 40000, rate: 0.02 },
      { upTo: 80000, rate: 0.07 },
      { upTo: 120000, rate: 0.115 },
      { upTo: 160000, rate: 0.15 },
      { upTo: 320000, rate: 0.2 },
      { upTo: null, rate: 0.22 },
    ],
    capitalGainsTaxRate: 0,
    dividendTaxRate: 0,
    pensionWithdrawalTaxRate: 0,
    wealthTaxRate: 0,
    inheritanceTaxRate: 0,
    swr: { conservative: 0.034, moderate: 0.039, aggressive: 0.044 },
  },
  UAE: {
    code: "UAE",
    name: "United Arab Emirates",
    currency: "AED",
    incomeTaxBrackets: [{ upTo: null, rate: 0 }],
    capitalGainsTaxRate: 0,
    dividendTaxRate: 0,
    pensionWithdrawalTaxRate: 0,
    wealthTaxRate: 0,
    inheritanceTaxRate: 0,
    swr: { conservative: 0.035, moderate: 0.04, aggressive: 0.045 },
  },
  PRT: {
    code: "PRT",
    name: "Portugal",
    currency: "EUR",
    incomeTaxBrackets: [
      { upTo: 7703, rate: 0.1325 },
      { upTo: 11623, rate: 0.18 },
      { upTo: 16472, rate: 0.23 },
      { upTo: 21321, rate: 0.26 },
      { upTo: 27146, rate: 0.3275 },
      { upTo: 39791, rate: 0.37 },
      { upTo: 51997, rate: 0.435 },
      { upTo: 81199, rate: 0.45 },
      { upTo: null, rate: 0.48 },
    ],
    capitalGainsTaxRate: 0.28,
    dividendTaxRate: 0.28,
    pensionWithdrawalTaxRate: 0.1, // NHR-style favourable regime assumption
    wealthTaxRate: 0,
    inheritanceTaxRate: 0,
    swr: { conservative: 0.032, moderate: 0.037, aggressive: 0.042 },
  },
  THA: {
    code: "THA",
    name: "Thailand",
    currency: "THB",
    incomeTaxBrackets: [
      { upTo: 150000, rate: 0 },
      { upTo: 300000, rate: 0.05 },
      { upTo: 500000, rate: 0.1 },
      { upTo: 750000, rate: 0.15 },
      { upTo: 1000000, rate: 0.2 },
      { upTo: 2000000, rate: 0.25 },
      { upTo: 5000000, rate: 0.3 },
      { upTo: null, rate: 0.35 },
    ],
    capitalGainsTaxRate: 0,
    dividendTaxRate: 0.1,
    pensionWithdrawalTaxRate: 0.1,
    wealthTaxRate: 0,
    inheritanceTaxRate: 0.1,
    swr: { conservative: 0.03, moderate: 0.035, aggressive: 0.04 },
  },
};

/**
 * Base statistical life expectancy by country (period life expectancy at
 * birth, rounded), before gender/health/scenario adjustments.
 */
export const BASE_LIFE_EXPECTANCY: Record<CountryCode, number> = {
  UK: 81,
  USA: 78,
  CAN: 82,
  AUS: 83,
  IND: 70,
  SGP: 84,
  UAE: 79,
  PRT: 81,
  THA: 77,
};

/** Expected nominal return / volatility presets by risk profile. */
export const RISK_PRESETS: Record<
  Exclude<RiskProfile, "custom">,
  { expectedReturn: number; volatility: number }
> = {
  conservative: { expectedReturn: 0.04, volatility: 0.07 },
  moderate: { expectedReturn: 0.06, volatility: 0.11 },
  aggressive: { expectedReturn: 0.08, volatility: 0.16 },
};

/** Per-asset-class long-run nominal return assumptions used for blended return. */
export const ASSET_CLASS_RETURNS = {
  stocks: 0.09,
  bonds: 0.04,
  cash: 0.02,
  property: 0.06,
  alternatives: 0.07,
} as const;

/** Per-asset-class volatility used to derive a blended portfolio volatility. */
export const ASSET_CLASS_VOL = {
  stocks: 0.18,
  bonds: 0.06,
  cash: 0.01,
  property: 0.12,
  alternatives: 0.25,
} as const;
