import { projectRetirement } from './projections.js'
import { runMonteCarlo } from './monteCarlo.js'

/**
 * Given target retirement age, compute what's needed and the gap
 * @returns {{ requiredCorpus, projectedCorpus, gap, gapPercent, requiredMonthlySavings, currentMonthlySavings, successRate, monteCarlo, ... }}
 */
export function computeRetirementGap(profile, income, expenses, assumptions, family = null, targetAge) {
  const testProfile = { ...profile, retirementAge: targetAge }
  const currentAge = profile.age || 30
  const lifeExpectancy = profile.lifeExpectancy || 80
  const yearsAccum = Math.max(1, targetAge - currentAge)
  const yearsDecum = Math.max(1, lifeExpectancy - targetAge)

  const proj = projectRetirement(testProfile, income, expenses, assumptions, family)

  const blendedMean = (assumptions.equityReturn || 0.10) * (income.equityRatio || 0.6) +
                      (assumptions.debtReturn || 0.07) * (1 - (income.equityRatio || 0.6))
  const initialCorpus = proj.initialCorpus || (
    (income.currentSavings || 0) + (income.epfBalance || 0) + (income.npsBalance || 0)
  )

  const mc = runMonteCarlo({
    initialCorpus,
    annualContribution: (income.monthlySavings || 0) * 12,
    annualWithdrawal: proj.annualExpensesAtRetirement,
    yearsAccum,
    yearsDecum,
    meanReturn: blendedMean,
    stdDev: 0.12,
    inflationRate: expenses.generalInflation || 0.06,
  }, 1000)

  const gap = proj.projectedCorpus - proj.requiredCorpus
  const gapPercent = proj.requiredCorpus > 0
    ? Math.round((Math.abs(gap) / proj.requiredCorpus) * 100)
    : 0

  // Required monthly savings to close the gap (simple approximation)
  let requiredMonthlySavings = income.monthlySavings || 0
  if (gap < 0) {
    const additionalNeeded = -gap
    // FV of additional monthly savings over accumulation period at blended return
    // PV_needed = PMT * [(1+r)^n - 1] / r  →  PMT = PV_needed * r / [(1+r)^n - 1]
    const r = blendedMean
    const n = yearsAccum
    const fvFactor = r > 0.001 ? (Math.pow(1 + r, n) - 1) / r : n
    const additionalMonthly = Math.round(additionalNeeded / (fvFactor * 12))
    requiredMonthlySavings = (income.monthlySavings || 0) + additionalMonthly
  }

  return {
    requiredCorpus: proj.requiredCorpus,
    projectedCorpus: proj.projectedCorpus,
    gap,
    gapPercent,
    requiredMonthlySavings,
    currentMonthlySavings: income.monthlySavings || 0,
    successRate: mc.successRate,
    monteCarlo: mc,
    accumulation: proj.accumulation,
    decumulation: proj.decumulation,
    annualExpensesAtRetirement: proj.annualExpensesAtRetirement,
    yearsToRetirement: yearsAccum,
    yearsDecum,
    surplus: proj.surplus,
  }
}
