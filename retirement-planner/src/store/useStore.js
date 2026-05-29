import { create } from 'zustand'
import { LIFE_EXPECTANCY_GENDER, DEFAULT_INFLATION, DEFAULT_RETURNS } from '../data/defaults.js'
import { projectRetirement } from '../calculators/projections.js'
import { runMonteCarlo } from '../calculators/monteCarlo.js'
import { npsProjection } from '../calculators/nps.js'
import { findRetirementAge } from '../calculators/retirementAge.js'
import { computeRetirementGap } from '../calculators/retirementGap.js'

const defaultProfile = {
  firstName: '',
  dob: '',           // ISO date string
  age: 30,           // computed from dob or manual
  gender: 'male',
  workCountry: 'IN',
  retireCountry: 'IN',
  sameCountry: true,
  exchangeRate: 83,
  maritalStatus: 'single',
  lifeExpectancy: 80,
}

const defaultFamily = {
  spouse: null,      // { name, dob, gender, workCountry, retireCountry }
  children: [],      // [{ id, name, dob, educationCost, weddingCost }]
  dependents: [],    // [{ id, currentAge, relation }]
  lifeEvents: [],    // [{ id, type, userAge, amount, ... }]
}

const defaultIncome = {
  // India
  monthlySalary: 80000,
  epfBalance: 0,
  epfMonthly: 0,       // auto 12% of basic
  vpfMonthly: 0,
  ppfMonthly: 0,
  npsBalance: 0,
  npsMonthly: 0,
  mutualFundSIP: 0,
  rentalIncome: 0,
  businessIncome: 0,
  // US
  annualSalary: 0,
  k401Balance: 0,
  k401Monthly: 0,
  employerMatch401k: 0.05,
  iraBalance: 0,
  rothIraMonthly: 0,
  brokerageMonthly: 0,
  // UK
  pensionBalance: 0,
  pensionMonthly: 0,
  employerMatchPension: 0.05,
  isaBalance: 0,
  lisaMonthly: 0,
  // Common
  currentSavings: 500000,
  monthlySavings: 20000, // total monthly investable savings
  stepUpRate: 0.10,
  salaryGrowthRate: 0.08,
  equityRatio: 0.60,
  realEstateWorkCountry: 0,
  realEstateRetireCountry: 0,
  otherAssets: 0,
  monthlyPension: 0,
  otherIncome: 0,
}

const defaultExpenses = {
  // Categories
  housing: 15000,
  food: 8000,
  transport: 5000,
  healthcare: 3000,
  childrenEducation: 0,
  parentSupport: 0,
  lifestyle: 5000,
  other: 4000,
  // Derived
  monthlyExpenses: 40000,
  // Post-retirement
  ownsHomeAtRetirement: false,
  retirementLifestyle: 'comfortable', // frugal | comfortable | lavish
  postRetirementMonthly: 0, // 0 = auto-compute
  // Inflation
  generalInflation: 0.06,
  medicalInflation: 0.13,
  medicalExpenseRatio: 0.20,
  oneTimeExpenses: [],
}

const defaultGoal = {
  retirementMode: 'find',      // 'find' | 'target'
  targetRetirementAge: 60,
  confidenceThreshold: 0.85,   // for 'find' mode
  lifeExpectancyOverride: null,
  // Post-retirement income sources
  annuityMonthly: 0,
  partTimeMonthly: 0,
  rentalAtRetirement: 0,
  socialSecurityMonthly: 0,
}

export const useStore = create((set, get) => ({
  // UI state
  currentStep: 0,

  // Main inputs
  profile: { ...defaultProfile },
  family: { ...defaultFamily },
  income: { ...defaultIncome },
  expenses: { ...defaultExpenses },
  assumptions: {
    equityReturn: DEFAULT_RETURNS.equity,
    debtReturn: DEFAULT_RETURNS.debt,
  },
  goal: { ...defaultGoal },

  // Scenarios
  scenarios: [],

  // Results
  results: null,
  computing: false,

  // Actions
  setStep: (step) => set({ currentStep: step }),

  setProfile: (updates) => set(s => {
    const newProfile = { ...s.profile, ...updates }
    // Auto-compute age from dob if provided
    if (updates.dob) {
      const birth = new Date(updates.dob)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
      newProfile.age = Math.max(18, Math.min(80, age))
    }
    // Auto life expectancy from gender+retireCountry
    if (updates.gender || updates.retireCountry) {
      const country = newProfile.retireCountry || 'IN'
      const gender = newProfile.gender || 'male'
      const le = LIFE_EXPECTANCY_GENDER[country]?.[gender] || 80
      if (!s.profile.lifeExpectancyOverridden) {
        newProfile.lifeExpectancy = le
      }
    }
    // sameCountry logic
    if (updates.workCountry && !updates.retireCountry) {
      if (newProfile.sameCountry) {
        newProfile.retireCountry = updates.workCountry
      }
    }
    return { profile: newProfile }
  }),

  setFamily: (updates) => set(s => ({
    family: { ...s.family, ...updates },
  })),

  addChild: (child) => set(s => ({
    family: {
      ...s.family,
      children: [...s.family.children, { id: Date.now(), ...child }],
    },
  })),

  removeChild: (id) => set(s => ({
    family: {
      ...s.family,
      children: s.family.children.filter(c => c.id !== id),
    },
  })),

  updateChild: (id, updates) => set(s => ({
    family: {
      ...s.family,
      children: s.family.children.map(c => c.id === id ? { ...c, ...updates } : c),
    },
  })),

  addLifeEvent: (event) => set(s => ({
    family: {
      ...s.family,
      lifeEvents: [...s.family.lifeEvents, { id: Date.now(), ...event }],
    },
  })),

  removeLifeEvent: (id) => set(s => ({
    family: {
      ...s.family,
      lifeEvents: s.family.lifeEvents.filter(e => e.id !== id),
    },
  })),

  setIncome: (updates) => set(s => {
    const newIncome = { ...s.income, ...updates }
    // Auto-compute total monthly savings for India
    if (s.profile.workCountry === 'IN') {
      const epfAuto = Math.round((newIncome.monthlySalary || 0) * 0.12)
      if (!updates.epfMonthly) {
        newIncome.epfMonthly = epfAuto
      }
    }
    return { income: newIncome }
  }),

  setExpenses: (updates) => set(s => {
    const newExp = { ...s.expenses, ...updates }
    // Auto-compute total from categories
    if (updates.housing !== undefined || updates.food !== undefined ||
        updates.transport !== undefined || updates.healthcare !== undefined ||
        updates.childrenEducation !== undefined || updates.parentSupport !== undefined ||
        updates.lifestyle !== undefined || updates.other !== undefined) {
      newExp.monthlyExpenses = (newExp.housing || 0) + (newExp.food || 0) +
        (newExp.transport || 0) + (newExp.healthcare || 0) +
        (newExp.childrenEducation || 0) + (newExp.parentSupport || 0) +
        (newExp.lifestyle || 0) + (newExp.other || 0)
    }
    return { expenses: newExp }
  }),

  setAssumptions: (updates) => set(s => ({
    assumptions: { ...s.assumptions, ...updates },
  })),

  setGoal: (updates) => set(s => ({
    goal: { ...s.goal, ...updates },
  })),

  addOneTimeExpense: (expense) => set(s => ({
    expenses: {
      ...s.expenses,
      oneTimeExpenses: [...s.expenses.oneTimeExpenses, { id: Date.now(), ...expense }],
    },
  })),

  removeOneTimeExpense: (id) => set(s => ({
    expenses: {
      ...s.expenses,
      oneTimeExpenses: s.expenses.oneTimeExpenses.filter(e => e.id !== id),
    },
  })),

  addScenario: (name, overrides) => set(s => {
    const scenario = {
      id: Date.now() + Math.random(),
      name,
      profile: { ...s.profile, ...overrides?.profile },
      income: { ...s.income, ...overrides?.income },
      expenses: { ...s.expenses, ...overrides?.expenses },
      assumptions: { ...s.assumptions, ...overrides?.assumptions },
    }
    return { scenarios: [...s.scenarios, scenario] }
  }),

  removeScenario: (id) => set(s => ({
    scenarios: s.scenarios.filter(sc => sc.id !== id),
  })),

  updateCountry: (country) => set(s => ({
    profile: {
      ...s.profile,
      workCountry: country,
      retireCountry: s.profile.sameCountry ? country : s.profile.retireCountry,
      lifeExpectancy: LIFE_EXPECTANCY_GENDER[country]?.[s.profile.gender] || 80,
    },
    expenses: {
      ...s.expenses,
      generalInflation: DEFAULT_INFLATION[country]?.general || 0.06,
      medicalInflation: DEFAULT_INFLATION[country]?.medical || 0.12,
    },
  })),

  compute: () => {
    const { profile, income, expenses, assumptions, family, goal } = get()
    set({ computing: true })

    setTimeout(() => {
      try {
        const mode = goal.retirementMode || 'find'
        let results

        if (mode === 'find') {
          const threshold = goal.confidenceThreshold || 0.85
          const found = findRetirementAge(profile, income, expenses, assumptions, family, threshold)
          const retirementAge = found?.age || (profile.age + 30)

          // Full MC with 1000 runs at found age
          const testProfile = { ...profile, retirementAge }
          const proj = projectRetirement(testProfile, income, expenses, assumptions, family)
          const blendedMean = (assumptions.equityReturn || 0.10) * (income.equityRatio || 0.6) +
                              (assumptions.debtReturn || 0.07) * (1 - (income.equityRatio || 0.6))
          const mc = runMonteCarlo({
            initialCorpus: proj.initialCorpus || income.currentSavings || 0,
            annualContribution: (income.monthlySavings || 0) * 12,
            annualWithdrawal: proj.annualExpensesAtRetirement,
            yearsAccum: retirementAge - profile.age,
            yearsDecum: Math.max(1, profile.lifeExpectancy - retirementAge),
            meanReturn: blendedMean,
            stdDev: 0.12,
            inflationRate: expenses.generalInflation || 0.06,
          }, 1000)

          results = {
            mode: 'find',
            retirementAge,
            successRate: mc.successRate,
            projectedCorpus: proj.projectedCorpus,
            requiredCorpus: proj.requiredCorpus,
            surplus: proj.surplus,
            monteCarlo: mc,
            accumulation: proj.accumulation,
            decumulation: proj.decumulation,
            annualExpensesAtRetirement: proj.annualExpensesAtRetirement,
            yearsToRetirement: retirementAge - profile.age,
            belowThreshold: found?.belowThreshold || false,
            threshold,
          }
        } else {
          const targetAge = goal.targetRetirementAge || 60
          const gap = computeRetirementGap(profile, income, expenses, assumptions, family, targetAge)

          results = {
            mode: 'target',
            retirementAge: targetAge,
            ...gap,
          }
        }

        // Compute tax savings (India-specific)
        let taxSavings = 0
        if (profile.workCountry === 'IN') {
          const epf = (income.epfMonthly || Math.round((income.monthlySalary || 0) * 0.12)) * 12
          const nps = (income.npsMonthly || 0) * 12
          const ppf = (income.ppfMonthly || 0) * 12
          const deductible = Math.min(150000, epf + nps + ppf) + Math.min(50000, nps) // 80C + 80CCD(1B)
          taxSavings = Math.round(deductible * 0.30)
        }

        // Suggestions
        const suggestions = []
        if (results.surplus < 0) {
          const gap = -results.surplus
          const years = results.yearsToRetirement || 20
          const monthlyBoost = Math.round(gap / (years * 12 * 1.5))
          suggestions.push(`Increase monthly savings by ${monthlyBoost.toLocaleString()} to close the gap`)
          suggestions.push(`Delaying retirement by 2 years could improve your success rate significantly`)
        }
        if ((results.successRate || 0) < 0.80) {
          suggestions.push(`Your plan has ${((results.successRate || 0) * 100).toFixed(0)}% success rate — consider more conservative withdrawal`)
        }
        if ((income.equityRatio || 0.6) < 0.5 && profile.age < 45) {
          suggestions.push(`Increasing equity allocation to 60–70% could improve long-term returns`)
        }
        if (results.surplus > 0 && (results.successRate || 0) > 0.90) {
          suggestions.push(`Your plan looks strong! Consider retiring earlier or increasing lifestyle spend`)
        }
        if (profile.workCountry === 'IN' && !(income.npsMonthly > 0)) {
          suggestions.push(`Starting NPS contributions gives extra ₹50,000 deduction under 80CCD(1B)`)
        }

        set({
          results: { ...results, taxSavings, suggestions },
          computing: false,
        })
      } catch (e) {
        console.error('Compute error:', e)
        set({ computing: false })
      }
    }, 50)
  },
}))
