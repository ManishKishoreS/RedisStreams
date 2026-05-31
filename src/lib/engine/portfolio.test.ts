import { describe, it, expect } from "vitest";
import {
  normaliseAllocation,
  blendedReturn,
  blendedVolatility,
  resolveReturnModel,
} from "./portfolio";
import type { AssetAllocation, InvestmentConfig } from "@/domain/types";

const alloc: AssetAllocation = {
  stocks: 60,
  bonds: 30,
  cash: 10,
  property: 0,
  alternatives: 0,
};

describe("portfolio", () => {
  it("normalises allocations to sum to 1", () => {
    const n = normaliseAllocation(alloc);
    const sum = n.stocks + n.bonds + n.cash + n.property + n.alternatives;
    expect(sum).toBeCloseTo(1, 8);
    expect(n.stocks).toBeCloseTo(0.6, 8);
  });

  it("defaults to all-cash when allocation is empty", () => {
    const n = normaliseAllocation({ stocks: 0, bonds: 0, cash: 0, property: 0, alternatives: 0 });
    expect(n.cash).toBe(1);
  });

  it("all-stocks return equals the stock asset-class return", () => {
    const r = blendedReturn({ stocks: 1, bonds: 0, cash: 0, property: 0, alternatives: 0 });
    expect(r).toBeCloseTo(0.09, 8);
  });

  it("more equity gives higher blended return and volatility", () => {
    const conservative = { stocks: 0.2, bonds: 0.7, cash: 0.1, property: 0, alternatives: 0 };
    const aggressive = { stocks: 0.9, bonds: 0.1, cash: 0, property: 0, alternatives: 0 };
    expect(blendedReturn(aggressive)).toBeGreaterThan(blendedReturn(conservative));
    expect(blendedVolatility(aggressive)).toBeGreaterThan(blendedVolatility(conservative));
  });

  it("resolveReturnModel uses presets for non-custom profiles", () => {
    const cfg: InvestmentConfig = {
      allocation: alloc,
      riskProfile: "moderate",
      expectedReturn: 0,
      volatility: 0,
    };
    const m = resolveReturnModel(cfg);
    expect(m.expectedReturn).toBeCloseTo(0.06, 8);
    expect(m.volatility).toBeCloseTo(0.11, 8);
  });

  it("resolveReturnModel honours explicit custom values", () => {
    const cfg: InvestmentConfig = {
      allocation: alloc,
      riskProfile: "custom",
      expectedReturn: 0.075,
      volatility: 0.13,
    };
    const m = resolveReturnModel(cfg);
    expect(m.expectedReturn).toBe(0.075);
    expect(m.volatility).toBe(0.13);
  });
});
