import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { COUNTRIES, RISK_PROFILES } from '../data/countries.js'

// Guest sessions live in sessionStorage (cleared when the browser session
// ends). Registering copies the plan to localStorage so it persists.
const ACCOUNT_FLAG = 'rw-registered'
const hybridStorage = {
  getItem: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  setItem: (k, v) =>
    (localStorage.getItem(ACCOUNT_FLAG) ? localStorage : sessionStorage).setItem(k, v),
  removeItem: (k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  },
}

export const WIZARD = ['profile', 'income', 'assets', 'pensions', 'lifestyle', 'goals', 'risk']

const initialPlan = {
  profile: { country: 'UK', age: 35, retirementAge: 66, maritalStatus: 'single', dependents: 0 },
  income: { salary: 45000, growth: 2.5, otherRetirementIncome: 0 },
  assets: { cash: 10000, investments: 25000, property: 0, liabilities: 0 },
  pensions: { pots: {}, contribs: {}, statePensionFraction: 100 },
  savingsRate: 10, // % of salary saved outside pensions
  lifestyle: 'comfortable',
  customExpenses: null,
  goals: [],
  riskAnswers: {},
  riskProfile: 'balanced',
  quick: null, // quick-check result snapshot
  history: [], // [{date, score}] for registered monitoring
}

export const useStore = create(
  persist(
    (set, get) => ({
      screen: 'landing',
      account: null,
      ...initialPlan,

      go: (screen) => {
        set({ screen })
        window.scrollTo(0, 0)
      },
      next: () => {
        const i = WIZARD.indexOf(get().screen)
        set({ screen: i === WIZARD.length - 1 ? 'results' : WIZARD[i + 1] })
        window.scrollTo(0, 0)
      },
      back: () => {
        const i = WIZARD.indexOf(get().screen)
        set({ screen: i <= 0 ? 'landing' : WIZARD[i - 1] })
        window.scrollTo(0, 0)
      },

      setProfile: (patch) =>
        set((s) => {
          const profile = { ...s.profile, ...patch }
          if (patch.country && patch.country !== s.profile.country) {
            const c = COUNTRIES[patch.country]
            profile.retirementAge = c.defaultRetirementAge
            return { profile, income: { ...s.income, salary: c.defaultSalary }, customExpenses: null }
          }
          return { profile }
        }),
      setIncome: (patch) => set((s) => ({ income: { ...s.income, ...patch } })),
      setAssets: (patch) => set((s) => ({ assets: { ...s.assets, ...patch } })),
      setPension: (key, field, value) =>
        set((s) => ({ pensions: { ...s.pensions, [field]: { ...s.pensions[field], [key]: value } } })),
      setStatePensionFraction: (v) =>
        set((s) => ({ pensions: { ...s.pensions, statePensionFraction: v } })),
      setSavingsRate: (v) => set({ savingsRate: v }),
      setLifestyle: (lifestyle) => set({ lifestyle, customExpenses: null }),
      setCustomExpenses: (v) => set({ customExpenses: v }),
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, { id: Date.now(), ...goal }] })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      setRiskAnswer: (qid, value) =>
        set((s) => ({ riskAnswers: { ...s.riskAnswers, [qid]: value } })),
      setRiskProfile: (riskProfile) => set({ riskProfile }),
      setQuick: (quick) => set({ quick }),

      recordScore: (score) =>
        set((s) => {
          if (!s.account) return {}
          const today = new Date().toISOString().slice(0, 10)
          if (s.history.at(-1)?.date === today && s.history.at(-1)?.score === score) return {}
          return { history: [...s.history.filter((h) => h.date !== today), { date: today, score }] }
        }),

      register: ({ name, email }) => {
        localStorage.setItem(ACCOUNT_FLAG, '1')
        set({ account: { name, email, since: new Date().toISOString() } })
      },
    }),
    {
      name: 'retirewise-plan',
      storage: createJSONStorage(() => hybridStorage),
      partialize: ({ screen: _s, ...rest }) => rest,
    }
  )
)

// Assemble engine inputs from app state.
export function buildInputs(s) {
  const c = COUNTRIES[s.profile.country]
  const rp = RISK_PROFILES[s.riskProfile]
  const pensionPots = Object.values(s.pensions.pots).reduce((a, b) => a + (Number(b) || 0), 0)
  const pensionContribs =
    Object.values(s.pensions.contribs).reduce((a, b) => a + (Number(b) || 0), 0) * 12
  const annualExpenses = s.customExpenses ?? c.lifestyles[s.lifestyle]

  return {
    currentAge: s.profile.age,
    retirementAge: s.profile.retirementAge,
    lifeExpectancy: c.lifeExpectancy,
    liquidAssets: s.assets.cash + s.assets.investments + pensionPots,
    annualContribution: (s.income.salary * s.savingsRate) / 100 + pensionContribs,
    contributionGrowth: s.income.growth,
    preReturn: rp.preReturn,
    postReturn: rp.postReturn,
    inflation: c.inflation,
    annualExpenses,
    statePensionAnnual: (c.statePensionAnnual * s.pensions.statePensionFraction) / 100,
    statePensionAge: c.statePensionAge,
    otherRetirementIncome: s.income.otherRetirementIncome,
    goals: s.goals,
    salary: s.income.salary,
    cash: s.assets.cash,
  }
}
