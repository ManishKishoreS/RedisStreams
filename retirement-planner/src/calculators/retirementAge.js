import { projectRetirement } from './projections.js'
import { runMonteCarlo } from './monteCarlo.js'

/**
 * Binary search for earliest retirement age where MC success >= threshold
 * @param {object} profile - user profile (without retirementAge)
 * @param {object} income
 * @param {object} expenses
 * @param {object} assumptions
 * @param {object|null} family
 * @param {number} threshold - 0..1, e.g. 0.85
 * @returns {{ age, successRate, projectedCorpus, requiredCorpus, yearsToRetirement }}
 */
export function findRetirementAge(profile, income, expenses, assumptions, family = null, threshold = 0.85) {
  const currentAge = profile.age || 30
  const lifeExpectancy = profile.lifeExpectancy || 80

  let bestResult = null
  // Try ages from currentAge+5 to 75 in steps of 1
  const minAge = currentAge + 5
  const maxAge = 75

  for (let tryAge = minAge; tryAge <= maxAge; tryAge++) {
    const testProfile = { ...profile, retirementAge: tryAge }
    const yearsAccum = tryAge - currentAge
    const yearsDecum = Math.max(1, lifeExpectancy - tryAge)

    const proj = projectRetirement(testProfile, income, expenses, assumptions, family)

    const annualContrib = (income.monthlySavings || 0) * 12
    const annualWithdrawal = proj.annualExpensesAtRetirement
    const blendedMean = (assumptions.equityReturn || 0.10) * (income.equityRatio || 0.6) +
                        (assumptions.debtReturn || 0.07) * (1 - (income.equityRatio || 0.6))
    const initialCorpus = proj.initialCorpus || (
      (income.currentSavings || 0) + (income.epfBalance || 0) + (income.npsBalance || 0)
    )

    const mc = runMonteCarlo({
      initialCorpus,
      annualContribution: annualContrib,
      annualWithdrawal,
      yearsAccum,
      yearsDecum,
      meanReturn: blendedMean,
      stdDev: 0.12,
      inflationRate: expenses.generalInflation || 0.06,
    }, 500) // 500 runs per age for performance

    if (mc.successRate >= threshold) {
      bestResult = {
        age: tryAge,
        successRate: mc.successRate,
        projectedCorpus: proj.projectedCorpus,
        requiredCorpus: proj.requiredCorpus,
        surplus: proj.surplus,
        yearsToRetirement: yearsAccum,
        monteCarlo: mc,
        accumulation: proj.accumulation,
        decumulation: proj.decumulation,
        annualExpensesAtRetirement: proj.annualExpensesAtRetirement,
      }
      break
    }

    // Track best we could achieve even if below threshold
    if (!bestResult || mc.successRate > (bestResult.successRate || 0)) {
      bestResult = {
        age: tryAge,
        successRate: mc.successRate,
        projectedCorpus: proj.projectedCorpus,
        requiredCorpus: proj.requiredCorpus,
        surplus: proj.surplus,
        yearsToRetirement: yearsAccum,
        monteCarlo: mc,
        accumulation: proj.accumulation,
        decumulation: proj.decumulation,
        annualExpensesAtRetirement: proj.annualExpensesAtRetirement,
        belowThreshold: true,
      }
    }
  }

  return bestResult
}
