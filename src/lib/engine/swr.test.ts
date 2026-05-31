import { describe, it, expect } from "vitest";
import { computeSwr, horizonAdjustment, allocationAdjustment } from "./swr";
import type { AssetAllocation, CountryConfig } from "@/domain/types";

const balanced: AssetAllocation = {
  stocks: 0.6,
  bonds: 0.3,
  cash: 0.05,
  property: 0.025,
  alternatives: 0.025,
};

const country: CountryConfig = {
  working: "USA",
  retirement: "USA",
  hasDoubleTaxationAgreement: false,
  annualCurrencyDepreciation: 0,
};

describe("swr", () => {
  it("longer horizon lowers the safe rate", () => {
    expect(horizonAdjustment(40)).toBeLessThan(0);
    expect(horizonAdjustment(20)).toBeGreaterThan(0);
    expect(horizonAdjustment(30)).toBeCloseTo(0, 6);
  });

  it("horizon adjustment is capped", () => {
    expect(horizonAdjustment(200)).toBeGreaterThanOrEqual(-0.012);
    expect(horizonAdjustment(-200)).toBeLessThanOrEqual(0.012);
  });

  it("higher growth allocation raises the safe rate", () => {
    const aggressive: AssetAllocation = { ...balanced, stocks: 0.9, bonds: 0.1, cash: 0 };
    expect(allocationAdjustment(aggressive)).toBeGreaterThan(allocationAdjustment(balanced));
  });

  it("produces ordered conservative < moderate < aggressive rates", () => {
    const r = computeSwr({ country, stance: "moderate", horizonYears: 30, allocation: balanced });
    expect(r.conservative).toBeLessThan(r.moderate);
    expect(r.moderate).toBeLessThan(r.aggressive);
    expect(r.recommended).toBe(r.moderate);
    expect(r.rationale).toContain("United States");
  });

  it("respects stance selection", () => {
    const cons = computeSwr({ country, stance: "conservative", horizonYears: 30, allocation: balanced });
    expect(cons.recommended).toBe(cons.conservative);
    const agg = computeSwr({ country, stance: "aggressive", horizonYears: 30, allocation: balanced });
    expect(agg.recommended).toBe(agg.aggressive);
  });
});
