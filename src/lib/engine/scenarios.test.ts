import { describe, it, expect } from "vitest";
import {
  normalScenario,
  immediateCrashScenario,
  midCrashScenario,
  multipleCrashesScenario,
  customSequenceScenario,
  returnForYear,
  standardScenarioSet,
} from "./scenarios";

describe("scenarios", () => {
  it("normal scenario returns baseline every year", () => {
    const s = normalScenario(0.06);
    expect(returnForYear(s, 0)).toBe(0.06);
    expect(returnForYear(s, 25)).toBe(0.06);
  });

  it("immediate crash hits year 0 only", () => {
    const s = immediateCrashScenario(0.06, -0.3);
    expect(returnForYear(s, 0)).toBe(-0.3);
    expect(returnForYear(s, 1)).toBe(0.06);
  });

  it("mid crash hits the configured year", () => {
    const s = midCrashScenario(0.06, 10, -0.35);
    expect(returnForYear(s, 9)).toBe(0.06);
    expect(returnForYear(s, 10)).toBe(-0.35);
    expect(returnForYear(s, 11)).toBe(0.06);
  });

  it("multiple crashes apply at each configured year", () => {
    const s = multipleCrashesScenario(0.06, [
      { yearIndex: 2, drop: -0.2 },
      { yearIndex: 8, drop: -0.3 },
    ]);
    expect(returnForYear(s, 2)).toBe(-0.2);
    expect(returnForYear(s, 8)).toBe(-0.3);
    expect(returnForYear(s, 5)).toBe(0.06);
  });

  it("custom sequence overrides and falls back to baseline past the end", () => {
    const s = customSequenceScenario([0.12, -0.18, 0.08]);
    expect(returnForYear(s, 0)).toBe(0.12);
    expect(returnForYear(s, 1)).toBe(-0.18);
    expect(returnForYear(s, 2)).toBe(0.08);
    // Past the sequence -> baseline (average of provided returns).
    expect(returnForYear(s, 3)).toBeCloseTo((0.12 - 0.18 + 0.08) / 3, 8);
  });

  it("standard scenario set covers the five market regimes", () => {
    const set = standardScenarioSet(0.06, 30);
    const kinds = set.map((s) => s.kind);
    expect(kinds).toContain("normal");
    expect(kinds).toContain("immediate-crash");
    expect(kinds).toContain("mid-crash");
    expect(kinds).toContain("late-crash");
    expect(kinds).toContain("multiple-crashes");
  });
});
