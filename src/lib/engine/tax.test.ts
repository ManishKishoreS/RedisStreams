import { describe, it, expect } from "vitest";
import {
  incomeTax,
  effectiveIncomeTaxRate,
  capitalGainsTax,
  dividendTax,
  crossBorderTax,
  retirementWithdrawalTax,
} from "./tax";
import { COUNTRY_PROFILES } from "./constants";

const uk = COUNTRY_PROFILES.UK;
const uae = COUNTRY_PROFILES.UAE;

describe("incomeTax", () => {
  it("is zero below the personal allowance (UK)", () => {
    expect(incomeTax(10000, uk)).toBe(0);
  });

  it("taxes only income above the allowance in the basic band", () => {
    // £20,000 -> 20% on (20000 - 12570) = 7430 * 0.2 = 1486
    expect(incomeTax(20000, uk)).toBeCloseTo(1486, 6);
  });

  it("applies progressive bands at higher income", () => {
    // £60,000: 20% on (50270-12570)=37700 -> 7540; 40% on (60000-50270)=9730 -> 3892
    expect(incomeTax(60000, uk)).toBeCloseTo(7540 + 3892, 6);
  });

  it("returns zero for non-positive income", () => {
    expect(incomeTax(0, uk)).toBe(0);
    expect(incomeTax(-100, uk)).toBe(0);
  });

  it("UAE has no income tax at any level", () => {
    expect(incomeTax(500000, uae)).toBe(0);
  });

  it("effective rate is below marginal rate due to bands", () => {
    const eff = effectiveIncomeTaxRate(60000, uk);
    expect(eff).toBeLessThan(0.4);
    expect(eff).toBeGreaterThan(0.15);
  });
});

describe("flat taxes", () => {
  it("capital gains tax applies only to positive gains", () => {
    expect(capitalGainsTax(10000, uk)).toBeCloseTo(2000, 6);
    expect(capitalGainsTax(-5000, uk)).toBe(0);
  });

  it("dividend tax", () => {
    expect(dividendTax(1000, uk)).toBeCloseTo(337.5, 6);
  });
});

describe("crossBorderTax", () => {
  it("with DTA pays the higher of the two", () => {
    expect(crossBorderTax(1000, 1500, true)).toBe(1500);
    expect(crossBorderTax(2000, 1500, true)).toBe(2000);
  });
  it("without DTA pays both", () => {
    expect(crossBorderTax(1000, 1500, false)).toBe(2500);
  });
});

describe("retirementWithdrawalTax", () => {
  it("blends pension tax and capital gains tax", () => {
    // 100% pension portion -> pure pension tax
    const pureP = retirementWithdrawalTax(10000, { pensionPortion: 1, profile: uk });
    expect(pureP).toBeCloseTo(10000 * uk.pensionWithdrawalTaxRate, 6);

    // 0% pension -> only gains (50% of withdrawal) taxed at CGT
    const pureInv = retirementWithdrawalTax(10000, { pensionPortion: 0, profile: uk });
    expect(pureInv).toBeCloseTo(10000 * 0.5 * uk.capitalGainsTaxRate, 6);
  });

  it("is zero in a tax-free retirement country", () => {
    expect(retirementWithdrawalTax(50000, { pensionPortion: 0.5, profile: uae })).toBe(0);
  });
});
