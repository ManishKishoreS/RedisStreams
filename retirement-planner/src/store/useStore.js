import { create } from 'zustand'
import { LIFE_EXPECTANCY, DEFAULT_INFLATION, DEFAULT_RETURNS } from '../data/defaults.js'
import { projectRetirement } from '../calculators/projections.js'
import { runMonteCarlo } from '../calculators/monteCarlo.js'
import { npsProjection } from '../calculators/nps.js'

const defaultProfile = {
  age: 30,
  gender: 'male',
  country: 'IN',
  maritalStatus: 'single',
  spouseAge: 28,
  retirementAge: 60,
  lifeExpectancy: 80,
}

const defaultIncome = {
  monthlySalary: 80000,
  monthlyPension: 0,
  rentalIncome: 0,
  otherIncome: 0,
  currentSavings: 500000,
  epfBalance: 0,
  npsBalance: 0,
  npsMonthly: 0,
  accountType401k: 0,
  isaBalance: 0,
  monthlySavings: 20000,
  stepUpRate: 0.10,
  equityRatio: 0.60,
}

const defaultExpenses = {
  monthlyExpenses: 40000,
  generalInflation: 0.06,
  medicalInflation: 0.13,
  medicalExpenseRatio: 0.20,
  oneTimeExpenses: [],
}

const defaultScenario = (name, overrides = {}) => ({
  id: Date.now() + Math.random(),
  name,
  profile: { ...defaultProfile, ...overrides.profile },
  income: { ...defaultIncome, ...overrides.income },
  expenses: { ...defaultExpenses, ...overrides.expenses },
  assumptions: {
    equityReturn: DEFAULT_RETURNS.equity,
    debtReturn: DEFAULT_RETURNS.debt,
    ...overrides.assumptions,
  },
})

export const useStore = create((set, get) => ({
  // UI state
  currentStep: 0,
  darkMode: false,

  // Main inputs
  profile: { ...defaultProfile },
  income: { ...defaultIncome },
  expenses: { ...defaultExpenses },
  assumptions: {
    equityReturn: DEFAULT_RETURNS.equity,
    debtReturn: DEFAULT_RETURNS.debt,
  },

  // Scenarios
  scenarios: [],

  // Results
  results: null,

  // Actions
  setStep: (step) => set({ currentStep: step }),
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

  setProfile: (updates) => set(s => ({
    profile: { ...s.profile, ...updates },
  })),

  setIncome: (updates) => set(s => ({
    income: { ...s.income, ...updates },
  })),

  setExpenses: (updates) => set(s => ({
    expenses: { ...s.expenses, ...updates },
  })),

  setAssumptions: (updates) => set(s => ({
    assumptions: { ...s.assumptions, ...updates },
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

  addScenario: (name, overrides) => set(s => ({
    scenarios: [...s.scenarios, defaultScenario(name, overrides)],
  })),

  removeScenario: (id) => set(s => ({
    scenarios: s.scenarios.filter(sc => sc.id !== id),
  })),

  updateCountry: (country) => set(s => ({
    profile: {
      ...s.profile,
      country,
      lifeExpectancy: LIFE_EXPECTANCY[country] || 80,
    },
    expenses: {
      ...s.expenses,
      generalInflation: DEFAULT_INFLATION[country]?.general || 0.06,
      medicalInflation: DEFAULT_INFLATION[country]?.medical || 0.12,
    },
  })),

  compute: () => {
    const { profile, income, expenses, assumptions } = get()

    const proj = projectRetirement(profile, income, expenses, assumptions)

    const yearsAccum = Math.max(0, profile.retirementAge - profile.age)
    const yearsDecum = Math.max(0, profile.lifeExpectancy - profile.retirementAge)
    const annualContrib = income.monthlySavings * 12
    const annualWithdrawal = expenses.monthlyExpenses * 12 * Math.pow(1 + expenses.generalInflation, yearsAccum)

    const mc = runMonteCarlo({
      initialCorpus: income.currentSavings + income.epfBalance + income.npsBalance,
      annualContribution: annualContrib,
      annualWithdrawal,
      yearsAccum,
      yearsDecum,
      meanReturn: assumptions.equityReturn * income.equityRatio + assumptions.debtReturn * (1 - income.equityRatio),
      stdDev: 0.12,
      inflationRate: expenses.generalInflation,
    }, 1000)

    let nps = null
    if (profile.country === 'IN' && (income.npsBalance > 0 || income.npsMonthly > 0)) {
      nps = npsProjection({
        currentAge: profile.age,
        retirementAge: profile.retirementAge,
        monthlyContrib: income.npsMonthly,
        employerContrib: income.npsMonthly * 0.1,
        currentCorpus: income.npsBalance,
        annualReturn: assumptions.equityReturn,
        marginalTaxRate: 0.30,
      })
    }

    // Compute score (0-100)
    const surplusRatio = proj.projectedCorpus / Math.max(1, proj.requiredCorpus)
    const mcScore = mc.successRate
    const score = Math.min(100, Math.round((surplusRatio * 0.5 + mcScore / 100 * 0.5) * 100))

    // Suggestions
    const suggestions = []
    if (proj.surplus < 0) {
      const gap = -proj.surplus
      const monthlyBoost = Math.round(gap / (yearsAccum * 12 * 1.5))
      suggestions.push(`Increase monthly savings by ${monthlyBoost.toLocaleString()} to close the gap`)
      suggestions.push(`Delaying retirement by 2 years could improve your score significantly`)
    }
    if (mc.successRate < 80) {
      suggestions.push(`Your plan has only ${mc.successRate.toFixed(0)}% success rate — consider a more conservative withdrawal plan`)
    }
    if (income.equityRatio < 0.5 && profile.age < 45) {
      suggestions.push(`Increasing equity allocation to 60-70% could improve long-term returns`)
    }
    if (proj.surplus > 0 && mc.successRate > 90) {
      suggestions.push(`Your plan looks strong! Consider increasing lifestyle spend or retiring earlier`)
    }

    set({
      results: {
        ...proj,
        monteCarlo: mc,
        nps,
        score,
        suggestions,
        yearsAccum,
        yearsDecum,
      },
    })
  },
}))
