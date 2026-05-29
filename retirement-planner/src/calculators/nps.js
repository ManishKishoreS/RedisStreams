/**
 * NPS (National Pension System) calculator
 */
import { sipCorpus } from './sip.js'
import { section80C, section80CCD } from './tax.js'

/**
 * Returns { totalCorpus, lumpsum, annuityPurchase, monthlyPension, taxSaving, netLumpsum }
 */
export function npsProjection({
  currentAge,
  retirementAge,
  monthlyContrib = 0,
  employerContrib = 0,
  currentCorpus = 0,
  annualReturn = 0.10,
  annuityRate = 0.06,
  marginalTaxRate = 0.30,
}) {
  const years = Math.max(0, retirementAge - currentAge)
  if (years <= 0) {
    return {
      totalCorpus: currentCorpus,
      lumpsum: currentCorpus * 0.6,
      annuityPurchase: currentCorpus * 0.4,
      monthlyPension: (currentCorpus * 0.4 * annuityRate) / 12,
      taxSaving: 0,
      netLumpsum: currentCorpus * 0.6,
    }
  }

  const totalMonthly = monthlyContrib + employerContrib
  const growthOfExisting = currentCorpus * Math.pow(1 + annualReturn, years)
  const newContribs = sipCorpus(totalMonthly, years, annualReturn, 0)
  const totalCorpus = growthOfExisting + newContribs

  // NPS rules: 40% must buy annuity, 60% is tax-free lumpsum
  const lumpsum = totalCorpus * 0.6
  const annuityPurchase = totalCorpus * 0.4
  const monthlyPension = (annuityPurchase * annuityRate) / 12

  // Tax saving (annual)
  const annualEmployeeContrib = monthlyContrib * 12
  const deduction80C = section80C(annualEmployeeContrib)
  const deduction80CCD = section80CCD(annualEmployeeContrib)
  const taxSaving = (deduction80C + deduction80CCD) * marginalTaxRate

  return {
    totalCorpus: Math.round(totalCorpus),
    lumpsum: Math.round(lumpsum),
    annuityPurchase: Math.round(annuityPurchase),
    monthlyPension: Math.round(monthlyPension),
    taxSaving: Math.round(taxSaving),
    netLumpsum: Math.round(lumpsum), // lumpsum is tax-free under NPS
  }
}
