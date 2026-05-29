/**
 * Monte Carlo simulation for retirement planning
 */

function normalRandom(mean, std) {
  // Box-Muller transform
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return mean + std * z
}

/**
 * Run Monte Carlo simulation
 * params: { initialCorpus, annualContribution, annualWithdrawal, yearsAccum, yearsDecum, meanReturn, stdDev }
 * Returns { successRate, percentiles: { p10, p50, p90 } }
 */
export function runMonteCarlo(params, runs = 1000) {
  const {
    initialCorpus = 0,
    annualContribution = 0,
    annualWithdrawal = 0,
    yearsAccum = 0,
    yearsDecum = 20,
    meanReturn = 0.10,
    stdDev = 0.15,
    inflationRate = 0.06,
  } = params

  const totalYears = yearsAccum + yearsDecum
  const allPaths = []
  let successCount = 0

  for (let run = 0; run < runs; run++) {
    const path = []
    let corpus = initialCorpus

    // Accumulation phase
    for (let y = 0; y < yearsAccum; y++) {
      const ret = normalRandom(meanReturn, stdDev)
      corpus = corpus * (1 + ret) + annualContribution
      path.push(Math.max(0, corpus))
    }

    // Decumulation phase
    for (let y = 0; y < yearsDecum; y++) {
      const ret = normalRandom(meanReturn * 0.7, stdDev * 0.8) // more conservative in retirement
      const withdrawal = annualWithdrawal * Math.pow(1 + inflationRate, y)
      corpus = corpus * (1 + ret) - withdrawal
      path.push(Math.max(0, corpus))
    }

    allPaths.push(path)
    if (corpus > 0) successCount++
  }

  // Calculate percentiles at each year
  const p10 = []
  const p50 = []
  const p90 = []

  for (let y = 0; y < totalYears; y++) {
    const vals = allPaths.map(p => p[y] || 0).sort((a, b) => a - b)
    p10.push(vals[Math.floor(runs * 0.10)])
    p50.push(vals[Math.floor(runs * 0.50)])
    p90.push(vals[Math.floor(runs * 0.90)])
  }

  return {
    successRate: successCount / runs,
    percentiles: { p10, p50, p90 },
    totalYears,
  }
}
