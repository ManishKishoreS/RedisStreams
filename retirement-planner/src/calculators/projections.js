import { sipCorpus } from './sip.js'
import { swpProjection } from './swp.js'
import { familyEventsCashFlow } from './familyEvents.js'

/**
 * Full year-by-year retirement projection with family events support
 * Returns { accumulation: [], decumulation: [], requiredCorpus, projectedCorpus, surplus }
 */
export function projectRetirement(profile, income, expenses, assumptions, family = null) {
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
    epfBalance = 0,
    npsBalance = 0,
    accountType401k = 0,
    isaBalance = 0,
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

  // Get family events cash flow
  const familyCashFlow = family ? familyEventsCashFlow(family, profile) : new Map()

  // Initial corpus across all account types
  const initialCorpus = currentSavings + epfBalance + npsBalance + accountType401k + isaBalance

  // Accumulation phase
  const accumulation = []
  let corpus = initialCorpus
  let monthly = monthlySavings
  for (let y = 0; y < yearsAccum; y++) {
    const yearStart = corpus
    const currentAge = age + y

    // Apply one-time expenses in this year (from Step 4)
    const ote = oneTimeExpenses
      .filter(e => e.year === currentAge)
      .reduce((s, e) => s + e.amount, 0)

    // Apply family events in this year
    const fc = familyCashFlow.get(currentAge) || { income: 0, expense: 0, labels: [] }

    for (let m = 0; m < 12; m++) {
      corpus = (corpus + monthly) * (1 + blendedReturn / 12)
    }
    corpus -= ote
    corpus += fc.income - fc.expense
    if (corpus < 0) corpus = 0

    accumulation.push({
      year: currentAge,
      age: currentAge,
      corpus,
      contribution: monthly * 12,
      growth: corpus - yearStart - monthly * 12,
      familyEventLabels: fc.labels,
      familyImpact: fc.income - fc.expense,
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
    initialCorpus: Math.round(initialCorpus),
  }
}
