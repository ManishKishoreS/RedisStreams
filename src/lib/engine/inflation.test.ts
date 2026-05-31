import { describe, it, expect } from "vitest";
import {
  inflate,
  inflationFactor,
  presentValue,
  rateForCategory,
  realReturn,
} from "./inflation";
import type { InflationConfig } from "@/domain/types";

const cfg: InflationConfig = {
  general: 0.03,
  healthcare: 0.05,
  education: 0.06,
  housing: 0.04,
  travel: 0.03,
};

describe("inflation", () => {
  it("inflationFactor compounds correctly", () => {
    expect(inflationFactor(0.03, 0)).toBe(1);
    expect(inflationFactor(0.03, 1)).toBeCloseTo(1.03, 6);
    expect(inflationFactor(0.03, 10)).toBeCloseTo(1.343916, 5);
  });

  it("inflate and presentValue are inverses", () => {
    const future = inflate(1000, 0.04, 12);
    expect(presentValue(future, 0.04, 12)).toBeCloseTo(1000, 6);
  });

  it("rejects negative years", () => {
    expect(() => inflationFactor(0.03, -1)).toThrow();
  });

  it("rateForCategory routes to category-specific rates", () => {
    expect(rateForCategory(cfg, "healthcare")).toBe(0.05);
    expect(rateForCategory(cfg, "education")).toBe(0.06);
    expect(rateForCategory(cfg, "housing")).toBe(0.04);
    expect(rateForCategory(cfg, "travel")).toBe(0.03);
    expect(rateForCategory(cfg, "food")).toBe(0.03); // falls back to general
  });

  it("realReturn uses the Fisher relation", () => {
    expect(realReturn(0.06, 0.03)).toBeCloseTo((1.06 / 1.03) - 1, 8);
    expect(realReturn(0.03, 0.03)).toBeCloseTo(0, 8);
  });
});
