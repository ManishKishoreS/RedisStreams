import { sipCorpus } from './sip.js'
import { swpProjection } from './swp.js'

/**
 * Full year-by-year retirement projection
 * Returns { accumulation: [], decumulation: [], requiredCorpus, projectedCorpus, surplus }
 */
export function projectRetirement(profile, income, expenses, assumptions) {
  const {
    age,
    retirementAge,
    lifeExpectancy,
  } = profile

  const yearsAccum = Math.max(0, retirementAge - age)
  const yearsDecum = Math.max(0, lifeExpectancy - retirementAge)

  const {
    monthlySavings = 0,
    currentSavings = 0,
    stepUpRate = 0,
  } = income

  const {
    monthlyExpenses = 0,
    generalInflation = 0.06,
    medicalInflation = 0.12,
    medicalExpenseRatio = 0.20,
    oneTimeExpenses = [],
  } = expenses

  const {
    equityReturn = 0.10,
    debtReturn = 0.07,
    equityRatio = 0.60,
  } = assumptions

  const blendedReturn = equityReturn * equityRatio + debtReturn * (1 - equityRatio)
  const retirementReturn = blendedReturn * 0.75 // more conservative post-retirement

  // Accumulation phase
  const accumulation = []
  let corpus = currentSavings
  let monthly = monthlySavings
  for (let y = 0; y < yearsAccum; y++) {
    const yearStart = corpus
    // Apply one-time expenses in this year
    const ote = oneTimeExpenses
      .filter(e => e.year === age + y)
      .reduce((s, e) => s + e.amount, 0)

    for (let m = 0; m < 12; m++) {
      corpus = (corpus + monthly) * (1 + blendedReturn / 12)
    }
    corpus -= ote
    if (corpus < 0) corpus = 0
    accumulation.push({
      year: age + y,
      age: age + y,
      corpus,
      contribution: monthly * 12,
      growth: corpus - yearStart - monthly * 12,
    })
    monthly *= (1 + stepUpRate)
  }

  const projectedCorpus = corpus

  // Required corpus at retirement
  const annualExpensesAtRetirement = monthlyExpenses * 12 * Math.pow(1 + generalInflation, yearsAccum)
  const nonMedical = annualExpensesAtRetirement * (1 - medicalExpenseRatio)
  const medical = annualExpensesAtRetirement * medicalExpenseRatio

  // PV of inflation-adjusted withdrawals
  const rReal = (1 + retirementReturn) / (1 + generalInflation) - 1
  const rRealMed = (1 + retirementReturn) / (1 + medicalInflation) - 1
  const pvAnnuity = (r, n) => {
    if (Math.abs(r) < 0.0001) return n
    return (1 - Math.pow(1 + r, -n)) / r
  }
  const requiredCorpus = nonMedical * pvAnnuity(rReal, yearsDecum) + medical * pvAnnuity(rRealMed, yearsDecum)

  // Decumulation phase
  const decumulation = swpProjection(
    projectedCorpus,
    annualExpensesAtRetirement,
    retirementReturn,
    generalInflation,
    yearsDecum + 5
  )

  return {
    accumulation,
    decumulation,
    projectedCorpus: Math.round(projectedCorpus),
    requiredCorpus: Math.round(requiredCorpus),
    surplus: Math.round(projectedCorpus - requiredCorpus),
    blendedReturn,
    annualExpensesAtRetirement: Math.round(annualExpensesAtRetirement),
  }
}
