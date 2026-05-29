/**
 * SIP (Systematic Investment Plan) calculators
 */

/**
 * Monthly SIP needed to accumulate `target` over `years` at `annualReturn`, with annual step-up `stepUpRate`
 */
export function sipNeeded(target, years, annualReturn, stepUpRate = 0) {
  if (years <= 0 || target <= 0) return 0
  const r = annualReturn / 12
  if (stepUpRate === 0) {
    // Standard SIP formula: FV = SIP * ((1+r)^n - 1) / r * (1+r)
    const n = years * 12
    if (r === 0) return target / n
    const fvFactor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
    return target / fvFactor
  }
  // Step-up SIP: binary search
  let lo = 0, hi = target, mid
  for (let i = 0; i < 50; i++) {
    mid = (lo + hi) / 2
    const corpus = sipCorpus(mid, years, annualReturn, stepUpRate)
    if (corpus < target) lo = mid
    else hi = mid
  }
  return mid
}

/**
 * Corpus from monthly SIP of `sip` over `years` at `annualReturn` with annual step-up `stepUpRate`
 */
export function sipCorpus(sip, years, annualReturn, stepUpRate = 0) {
  if (sip <= 0 || years <= 0) return 0
  const r = annualReturn / 12
  if (stepUpRate === 0) {
    const n = years * 12
    if (r === 0) return sip * n
    return sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  }
  // Year-by-year calculation for step-up SIP
  let corpus = 0
  let monthlySip = sip
  for (let y = 0; y < years; y++) {
    // Accumulate this year's SIP contributions
    for (let m = 0; m < 12; m++) {
      corpus = (corpus + monthlySip) * (1 + r)
    }
    monthlySip *= (1 + stepUpRate)
  }
  return corpus
}
