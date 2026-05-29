/**
 * SWP (Systematic Withdrawal Plan) calculators
 */

/**
 * Returns array of { year, corpus, withdrawal } until corpus=0 or maxYears
 */
export function swpProjection(initialCorpus, annualWithdrawal, annualReturn, inflationRate, maxYears = 40) {
  const result = []
  let corpus = initialCorpus
  for (let year = 1; year <= maxYears; year++) {
    const withdrawal = annualWithdrawal * Math.pow(1 + inflationRate, year - 1)
    corpus = corpus * (1 + annualReturn) - withdrawal
    result.push({ year, corpus: Math.max(0, corpus), withdrawal })
    if (corpus <= 0) break
  }
  return result
}

/**
 * Returns number of years corpus lasts
 */
export function swpDuration(initialCorpus, annualWithdrawal, annualReturn, inflationRate) {
  if (initialCorpus <= 0 || annualWithdrawal <= 0) return 0
  const projection = swpProjection(initialCorpus, annualWithdrawal, annualReturn, inflationRate, 100)
  const depletedYear = projection.find(p => p.corpus <= 0)
  if (depletedYear) return depletedYear.year
  return projection.length // Corpus survives the full period
}

/**
 * Required corpus using present value of annuity formula
 * r = real return = (1 + nominalReturn) / (1 + inflation) - 1
 */
export function requiredCorpus(annualExpenses, yearsInRetirement, nominalReturn, inflationRate) {
  if (yearsInRetirement <= 0 || annualExpenses <= 0) return 0
  const r = (1 + nominalReturn) / (1 + inflationRate) - 1
  if (Math.abs(r) < 0.0001) return annualExpenses * yearsInRetirement
  return annualExpenses * (1 - Math.pow(1 + r, -yearsInRetirement)) / r
}
