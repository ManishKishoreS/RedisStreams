import { EDUCATION_COST_DEFAULTS, WEDDING_COST_DEFAULTS, PARENT_CARE_MONTHLY } from '../data/defaults.js'

/**
 * Returns year-by-year cash flow impact of family events
 * Returns a Map<age, { income: number, expense: number, label: string[] }>
 * where age is user's age in that year
 */
export function familyEventsCashFlow(family, profile) {
  const { spouse, children = [], dependents = [], lifeEvents = [] } = family || {}
  const { age: currentAge, workCountry = 'IN', retireCountry = 'IN' } = profile

  const country = workCountry || 'IN'
  const retireCtry = retireCountry || workCountry || 'IN'
  const map = new Map()

  const add = (userAge, income, expense, label) => {
    const prev = map.get(userAge) || { income: 0, expense: 0, labels: [] }
    map.set(userAge, {
      income: prev.income + (income || 0),
      expense: prev.expense + (expense || 0),
      labels: [...prev.labels, label].filter(Boolean),
    })
  }

  // Children education costs (age 18–22 of child = user's age + offset)
  children.forEach(child => {
    if (!child.dob) return
    const birthYear = new Date(child.dob).getFullYear()
    const currentYear = new Date().getFullYear()
    const childAgeNow = currentYear - birthYear
    const yearsToChildAge18 = 18 - childAgeNow
    const userAgeAtChildAge18 = currentAge + yearsToChildAge18

    const educCost = child.educationCost ?? EDUCATION_COST_DEFAULTS[country] ?? 2500000
    // Spread over 4 years
    for (let y = 0; y < 4; y++) {
      add(userAgeAtChildAge18 + y, 0, educCost / 4, `${child.name || 'Child'}'s education`)
    }

    // Wedding cost
    const weddingAge = 25
    const userAgeAtChildWedding = currentAge + (weddingAge - childAgeNow)
    const weddingCost = child.weddingCost ?? WEDDING_COST_DEFAULTS[retireCtry] ?? 2000000
    add(userAgeAtChildWedding, 0, weddingCost, `${child.name || 'Child'}'s wedding`)
  })

  // Dependent parent care costs
  ;(dependents || []).forEach(dep => {
    const careAge = dep.currentAge || 65
    const yearsUntilCare = Math.max(0, 70 - careAge) // assume care starts at parent age 70
    const startUserAge = currentAge + yearsUntilCare
    const monthlyCare = PARENT_CARE_MONTHLY[retireCtry] || 15000
    const annualCare = monthlyCare * 12
    // Care lasts until parent is ~85 (15 years max)
    const careDuration = Math.min(15, Math.max(0, 85 - careAge - yearsUntilCare))
    for (let y = 0; y < careDuration; y++) {
      add(startUserAge + y, 0, annualCare, 'Parent care')
    }
  })

  // Life events
  ;(lifeEvents || []).forEach(event => {
    const userAge = event.userAge || (currentAge + (event.yearOffset || 5))
    switch (event.type) {
      case 'career_break': {
        const duration = event.duration || 1
        const incomePct = event.incomePct ?? 0
        const annualSalary = (profile.monthlySalary || 0) * 12
        const lostIncome = annualSalary * (1 - incomePct / 100)
        for (let y = 0; y < duration; y++) {
          add(userAge + y, -lostIncome, 0, 'Career break')
        }
        break
      }
      case 'property_purchase':
        add(userAge, 0, event.amount || 0, 'Property purchase')
        break
      case 'windfall':
      case 'business_exit':
        add(userAge, event.amount || 0, 0, event.type === 'windfall' ? 'Windfall' : 'Business exit')
        break
      case 'inheritance':
        add(userAge, event.amount || 0, 0, 'Inheritance')
        break
      case 'disability_buffer':
        add(userAge, 0, event.amount || 500000, 'Disability buffer')
        break
      case 'parent_caregiving': {
        const monthlyCost = event.monthlyCost || PARENT_CARE_MONTHLY[retireCtry] || 15000
        const dur = event.duration || 10
        for (let y = 0; y < dur; y++) {
          add(userAge + y, 0, monthlyCost * 12, 'Parent caregiving')
        }
        break
      }
      case 'child_education': {
        const edCost = event.amount || EDUCATION_COST_DEFAULTS[country] || 2500000
        for (let y = 0; y < 4; y++) {
          add(userAge + y, 0, edCost / 4, 'Child education')
        }
        break
      }
      case 'child_wedding':
        add(userAge, 0, event.amount || WEDDING_COST_DEFAULTS[retireCtry] || 2000000, 'Child wedding')
        break
      default:
        break
    }
  })

  return map
}

/**
 * Convert the cash flow map into an array sorted by age
 */
export function cashFlowArray(family, profile) {
  const map = familyEventsCashFlow(family, profile)
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([age, data]) => ({ age, ...data }))
}
