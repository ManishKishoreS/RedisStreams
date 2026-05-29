/**
 * Tax calculators for India, US, UK
 */
import { TAX_BRACKETS } from '../data/defaults.js'

function applyBrackets(income, brackets) {
  if (!income || income <= 0) return 0
  let tax = 0
  for (const bracket of brackets) {
    if (income <= bracket.min) break
    const taxable = Math.min(income, bracket.max) - bracket.min
    tax += taxable * bracket.rate
  }
  return tax
}

export function calcIncomeTax(income, country, regime = 'new') {
  if (!income || income <= 0) return 0
  if (country === 'IN') {
    const brackets = TAX_BRACKETS.IN[regime] || TAX_BRACKETS.IN.new
    let tax = applyBrackets(income, brackets)
    // Rebate u/s 87A for income up to 7L (new regime)
    if (regime === 'new' && income <= 700000) tax = 0
    // 4% health & education cess
    tax = tax * 1.04
    return Math.round(tax)
  }
  if (country === 'US') {
    return Math.round(applyBrackets(income, TAX_BRACKETS.US))
  }
  if (country === 'UK') {
    return Math.round(applyBrackets(income, TAX_BRACKETS.UK))
  }
  return 0
}

export function calcLTCG(gains, country) {
  if (!gains || gains <= 0) return 0
  if (country === 'IN') {
    // LTCG on equity: 10% above 1L
    const taxable = Math.max(0, gains - 100000)
    return Math.round(taxable * 0.10)
  }
  if (country === 'US') {
    // Simplified 15% LTCG
    return Math.round(gains * 0.15)
  }
  if (country === 'UK') {
    // 10% basic, 20% higher (simplified)
    return Math.round(gains * 0.10)
  }
  return 0
}

export function calcNPSTax(lumpsum, annuityIncome, marginalRate) {
  // 60% lumpsum is tax-free, 40% annuity income is taxable as per slab
  const taxOnAnnuity = annuityIncome * (marginalRate || 0)
  return Math.round(taxOnAnnuity)
}

export function section80C(contributions) {
  // Max deduction under Section 80C
  return Math.min(contributions || 0, 150000)
}

export function section80CCD(npsContrib) {
  // Additional NPS deduction under 80CCD(1B)
  return Math.min(npsContrib || 0, 50000)
}

export function getMarginalRate(income, country, regime = 'new') {
  if (!income || income <= 0) return 0
  if (country === 'IN') {
    const brackets = TAX_BRACKETS.IN[regime] || TAX_BRACKETS.IN.new
    for (let i = brackets.length - 1; i >= 0; i--) {
      if (income > brackets[i].min) return brackets[i].rate
    }
    return 0
  }
  if (country === 'US') {
    for (let i = TAX_BRACKETS.US.length - 1; i >= 0; i--) {
      if (income > TAX_BRACKETS.US[i].min) return TAX_BRACKETS.US[i].rate
    }
    return 0
  }
  if (country === 'UK') {
    for (let i = TAX_BRACKETS.UK.length - 1; i >= 0; i--) {
      if (income > TAX_BRACKETS.UK[i].min) return TAX_BRACKETS.UK[i].rate
    }
    return 0
  }
  return 0
}
