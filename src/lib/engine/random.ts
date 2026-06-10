/**
 * Deterministic pseudo-random number generation.
 *
 * A seedable RNG (mulberry32) plus a Box–Muller normal transform so Monte
 * Carlo runs are reproducible and unit-testable.
 */

export type Rng = () => number;

/** mulberry32 — small, fast, well-distributed seedable PRNG in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draw a standard normal variate from a uniform RNG via Box–Muller. */
export function normal(rng: Rng): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Draw a normal variate with given mean and standard deviation. */
export function normalWith(rng: Rng, mean: number, sd: number): number {
  return mean + sd * normal(rng);
}
