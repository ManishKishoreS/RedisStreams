import { describe, it, expect } from "vitest";
import { mulberry32, normal, normalWith } from "./random";

describe("random", () => {
  it("mulberry32 is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b());
    }
  });

  it("produces values in [0,1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("normal distribution has approximately zero mean and unit variance", () => {
    const rng = mulberry32(123);
    const n = 20000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const x = normal(rng);
      sum += x;
      sumSq += x * x;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    expect(Math.abs(mean)).toBeLessThan(0.05);
    expect(Math.abs(variance - 1)).toBeLessThan(0.1);
  });

  it("normalWith shifts mean and scales sd", () => {
    const rng = mulberry32(99);
    const n = 20000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += normalWith(rng, 0.06, 0.11);
    expect(Math.abs(sum / n - 0.06)).toBeLessThan(0.01);
  });
});
