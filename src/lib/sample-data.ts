/**
 * Sample retirement plans used by the demo dashboard and the test-suite.
 * These illustrate the cross-border use cases called out in the spec.
 */
import type { RetirementPlan } from "@/domain/types";

/** A UK professional intending to retire in Portugal. */
export const samplePlanUKtoPortugal: RetirementPlan = {
  personal: {
    firstName: "Alex",
    lastName: "Taylor",
    currentAge: 40,
    gender: "female",
    maritalStatus: "married",
    healthStatus: "good",
  },
  spouse: { currentAge: 42, retirementAge: 62, lifeExpectancy: 88 },
  dependents: [
    {
      relationship: "child",
      currentAge: 10,
      supportEndAge: 22,
      annualSupportCost: 8000,
    },
  ],
  country: {
    working: "UK",
    retirement: "PRT",
    hasDoubleTaxationAgreement: true,
    annualCurrencyDepreciation: 0.005,
  },
  assets: {
    cash: 25000,
    fixedDeposits: 15000,
    pensionValue: 120000,
    investmentAccounts: 90000,
    retirementAccounts: 160000,
    realEstatePrimary: 450000,
    realEstateInvestment: 0,
    businessEquity: 0,
    alternatives: 20000,
  },
  liabilities: {
    mortgage: { outstanding: 220000, interestRate: 0.045, remainingTermYears: 18 },
    personalLoans: 0,
    educationLoans: 0,
    creditCardDebt: 3000,
    businessDebt: 0,
  },
  income: {
    salary: 85000,
    bonus: 10000,
    rentalIncome: 0,
    businessIncome: 0,
    dividendIncome: 1500,
    interestIncome: 800,
    sideIncome: 0,
    annualSalaryGrowth: 0.03,
    annualBonusGrowth: 0.02,
    savingsRate: 0.25,
  },
  expenses: {
    monthly: {
      housing: 1400,
      utilities: 250,
      food: 600,
      transportation: 350,
      healthcare: 150,
      insurance: 200,
      travel: 300,
      entertainment: 250,
      education: 200,
      other: 300,
    },
    additionalAnnual: 6000,
    additionalRetirementAnnual: 6000,
    oneTimeRetirementCost: 30000,
  },
  lifeEvents: [
    { description: "Child university", yearsFromNow: 8, cost: 60000, inflationAdjusted: true },
    { description: "Home renovation", yearsFromNow: 5, cost: 25000, inflationAdjusted: true },
  ],
  inflation: {
    general: 0.03,
    healthcare: 0.05,
    education: 0.05,
    housing: 0.035,
    travel: 0.03,
  },
  investment: {
    allocation: { stocks: 0.6, bonds: 0.25, cash: 0.05, property: 0.05, alternatives: 0.05 },
    riskProfile: "moderate",
    expectedReturn: 0.06,
    volatility: 0.11,
  },
  retirementIncome: [
    {
      description: "UK State Pension",
      startAge: 67,
      endAge: 95,
      annualAmount: 11500,
      inflationLinked: true,
      taxable: true,
    },
  ],
  goals: {
    targetRetirementAge: 60,
    legacyGoal: 50000,
    withdrawalStrategy: "fixed-real",
    swrStance: "moderate",
    lifeExpectancyMode: "statistical",
    lifeExpectancyScenario: "average",
    emergencyFundMonths: 6,
  },
};

/** An India professional intending to retire in the UAE (tax-free). */
export const samplePlanIndiaToUAE: RetirementPlan = {
  ...samplePlanUKtoPortugal,
  personal: {
    firstName: "Ravi",
    lastName: "Kumar",
    currentAge: 35,
    gender: "male",
    maritalStatus: "married",
    healthStatus: "good",
  },
  country: {
    working: "IND",
    retirement: "UAE",
    hasDoubleTaxationAgreement: true,
    annualCurrencyDepreciation: 0.02,
  },
  goals: {
    ...samplePlanUKtoPortugal.goals,
    targetRetirementAge: undefined,
    swrStance: "conservative",
  },
};
