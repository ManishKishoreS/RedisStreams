/**
 * RetireWise Global — Domain Model
 *
 * Pure, framework-agnostic types describing the retirement planning problem.
 * These types are shared by the financial engine (src/lib/engine), the API
 * layer, and the UI. They contain no behaviour — only data shapes.
 */

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

export type Gender = "male" | "female" | "other" | "unspecified";

export type MaritalStatus = "single" | "married" | "partnered" | "divorced" | "widowed";

export type HealthStatus = "poor" | "average" | "good" | "excellent";

export type LifeExpectancyMode = "manual" | "statistical";

export type LifeExpectancyScenario = "conservative" | "average" | "optimistic";

export type RiskProfile = "conservative" | "moderate" | "aggressive" | "custom";

export type SwrStance = "conservative" | "moderate" | "aggressive";

export type RetirementStatus = "green" | "amber" | "red";

/** ISO-ish country codes supported by the country reference data. */
export type CountryCode =
  | "UK"
  | "USA"
  | "CAN"
  | "AUS"
  | "IND"
  | "SGP"
  | "UAE"
  | "PRT"
  | "THA";

export type ExpenseCategory =
  | "housing"
  | "utilities"
  | "food"
  | "transportation"
  | "healthcare"
  | "insurance"
  | "travel"
  | "entertainment"
  | "education"
  | "other";

/** Withdrawal strategy used during the decumulation phase. */
export type WithdrawalStrategy =
  | "fixed-real" // inflation-adjusted fixed amount (the "4% rule" classic)
  | "fixed-percent" // fixed % of current balance each year
  | "guardrails" // Guyton-Klinger style guardrails
  | "rmd"; // required-minimum-distribution style (age based)

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  currentAge: number;
  gender: Gender;
  maritalStatus: MaritalStatus;
  healthStatus: HealthStatus;
}

export interface Spouse {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
}

export interface Dependent {
  relationship: "child" | "parent" | "disabled-dependent" | "other";
  currentAge: number;
  /** Age (of the dependent) at which financial support is expected to end. */
  supportEndAge: number;
  /** Annual support cost in base currency, today's money. */
  annualSupportCost: number;
}

// ---------------------------------------------------------------------------
// Countries / tax
// ---------------------------------------------------------------------------

export interface TaxBracket {
  /** Upper bound of the bracket in local currency; null => no upper bound. */
  upTo: number | null;
  rate: number; // marginal rate as a fraction (0.20 = 20%)
}

export interface CountryTaxProfile {
  code: CountryCode;
  name: string;
  currency: string;
  /** Progressive income tax brackets (annual). */
  incomeTaxBrackets: TaxBracket[];
  capitalGainsTaxRate: number;
  dividendTaxRate: number;
  /** Flat effective tax applied to pension/retirement-account withdrawals. */
  pensionWithdrawalTaxRate: number;
  wealthTaxRate: number;
  inheritanceTaxRate: number;
  /** Suggested safe withdrawal rate band for this market. */
  swr: { conservative: number; moderate: number; aggressive: number };
}

export interface CountryConfig {
  working: CountryCode;
  retirement: CountryCode;
  /** Whether a double-taxation agreement relieves double taxation on income. */
  hasDoubleTaxationAgreement: boolean;
  /**
   * Expected FX depreciation per year of the working-country currency vs the
   * retirement-country currency after migration (currency risk). 0 if same.
   */
  annualCurrencyDepreciation: number;
}

// ---------------------------------------------------------------------------
// Financial position
// ---------------------------------------------------------------------------

export interface Assets {
  cash: number;
  fixedDeposits: number;
  pensionValue: number;
  investmentAccounts: number; // stocks/ETFs/mutual/index (taxable)
  retirementAccounts: number; // ISA/SIPP/401k/IRA/NPS/Super (tax-advantaged)
  realEstatePrimary: number;
  realEstateInvestment: number;
  businessEquity: number;
  alternatives: number; // gold/crypto/collectibles
}

export interface Mortgage {
  outstanding: number;
  interestRate: number;
  remainingTermYears: number;
}

export interface Liabilities {
  mortgage: Mortgage;
  personalLoans: number;
  educationLoans: number;
  creditCardDebt: number;
  businessDebt: number;
}

export interface Income {
  salary: number; // annual
  bonus: number; // annual
  rentalIncome: number;
  businessIncome: number;
  dividendIncome: number;
  interestIncome: number;
  sideIncome: number;
  annualSalaryGrowth: number; // fraction
  annualBonusGrowth: number; // fraction
  /** Annual savings rate applied to net income before retirement (fraction). */
  savingsRate: number;
}

export type MonthlyExpenses = Record<ExpenseCategory, number>;

export interface Expenses {
  monthly: MonthlyExpenses;
  /** Extra annual lump expenses today (holidays, property tax, etc.). */
  additionalAnnual: number;
  /** Recurring new annual expenses that begin at retirement. */
  additionalRetirementAnnual: number;
  /** One-off spend at retirement (relocation, RV, etc.). */
  oneTimeRetirementCost: number;
}

export interface LifeEvent {
  description: string;
  /** Calendar offset: years from now when the event occurs. */
  yearsFromNow: number;
  cost: number; // today's money
  inflationAdjusted: boolean;
}

// ---------------------------------------------------------------------------
// Inflation & investing
// ---------------------------------------------------------------------------

export interface InflationConfig {
  general: number; // fraction, e.g. 0.03
  healthcare: number;
  education: number;
  housing: number;
  travel: number;
}

export interface AssetAllocation {
  stocks: number; // fractions, should sum ~1
  bonds: number;
  cash: number;
  property: number;
  alternatives: number;
}

export interface InvestmentConfig {
  allocation: AssetAllocation;
  riskProfile: RiskProfile;
  /** Expected real-world nominal return; if custom this is used directly. */
  expectedReturn: number;
  /** Annualised volatility (std dev of returns) for Monte Carlo. */
  volatility: number;
}

// ---------------------------------------------------------------------------
// Income streams in retirement (pensions / social security)
// ---------------------------------------------------------------------------

export interface RetirementIncomeStream {
  description: string;
  /** Age at which this income begins. */
  startAge: number;
  /** Age at which it ends (e.g. life expectancy). */
  endAge: number;
  annualAmount: number; // today's money
  inflationLinked: boolean;
  taxable: boolean;
}

// ---------------------------------------------------------------------------
// Strategy / preferences
// ---------------------------------------------------------------------------

export interface RetirementGoals {
  /** If set, user "knows" their target retirement age (Journey Option 1). */
  targetRetirementAge?: number;
  /** Desired inheritance / legacy left at death (today's money). */
  legacyGoal: number;
  withdrawalStrategy: WithdrawalStrategy;
  swrStance: SwrStance;
  lifeExpectancyMode: LifeExpectancyMode;
  /** Used when mode === "manual". */
  manualLifeExpectancy?: number;
  /** Used when mode === "statistical". */
  lifeExpectancyScenario: LifeExpectancyScenario;
  /** Emergency fund target in months of expenses. */
  emergencyFundMonths: number;
}

// ---------------------------------------------------------------------------
// Top-level plan: everything the engine needs
// ---------------------------------------------------------------------------

export interface RetirementPlan {
  personal: PersonalInfo;
  spouse?: Spouse;
  dependents: Dependent[];
  country: CountryConfig;
  assets: Assets;
  liabilities: Liabilities;
  income: Income;
  expenses: Expenses;
  lifeEvents: LifeEvent[];
  inflation: InflationConfig;
  investment: InvestmentConfig;
  retirementIncome: RetirementIncomeStream[];
  goals: RetirementGoals;
}

// ---------------------------------------------------------------------------
// Market simulation scenarios
// ---------------------------------------------------------------------------

export type ScenarioKind =
  | "normal"
  | "immediate-crash"
  | "mid-crash"
  | "late-crash"
  | "multiple-crashes"
  | "custom-sequence";

export interface CrashSpec {
  /** Year index into retirement (0 = retirement year). */
  yearIndex: number;
  /** Magnitude of drawdown as a negative fraction, e.g. -0.30. */
  drop: number;
}

export interface MarketScenario {
  kind: ScenarioKind;
  label: string;
  /** Baseline annual return when not crashing. */
  baselineReturn: number;
  crashes: CrashSpec[];
  /** For custom-sequence: explicit yearly returns (fractions). */
  customReturns?: number[];
}

// ---------------------------------------------------------------------------
// Engine outputs
// ---------------------------------------------------------------------------

export interface YearProjection {
  year: number; // calendar offset (0 = now)
  age: number;
  phase: "accumulation" | "retirement";
  startingCorpus: number;
  contributions: number;
  investmentReturn: number;
  otherIncome: number; // pensions, social security, rental in retirement
  withdrawals: number;
  taxesPaid: number;
  expenses: number; // inflation-adjusted spend that year
  lifeEventCost: number;
  endingCorpus: number;
}

export interface ProjectionResult {
  retirementAge: number;
  rows: YearProjection[];
  /** Corpus at the moment of retirement. */
  corpusAtRetirement: number;
  /** Age at which corpus hit zero, or null if it never depleted. */
  depletionAge: number | null;
  /** Final corpus at death age (could be negative pre-clamp internally). */
  finalCorpus: number;
}

export interface MonteCarloResult {
  runs: number;
  successProbability: number; // fraction 0..1
  depletionProbability: number;
  median: number;
  best: number;
  worst: number;
  /** Percentile terminal balances for charting. */
  percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number };
  /** Histogram of terminal balances for distribution chart. */
  histogram: { bucket: number; count: number }[];
}

export interface SwrAnalysis {
  conservative: number;
  moderate: number;
  aggressive: number;
  recommended: number;
  rationale: string;
}

export interface CorpusAnalysis {
  requiredCorpus: number;
  projectedCorpus: number;
  shortfall: number; // positive => short, negative => surplus
  firstYearRetirementExpenses: number;
  safeWithdrawalRate: number;
}

export interface RetirementAgeAnalysis {
  earliest: number | null;
  conservative: number | null;
  recommended: number | null;
  optimistic: number | null;
}

export interface TaxImpactSummary {
  totalTaxesPaidAccumulation: number;
  totalTaxesPaidRetirement: number;
  effectiveRetirementTaxRate: number;
  taxDragOnReturns: number;
  crossBorderNote: string;
}

export interface InflationImpactSummary {
  firstYearExpenses: number;
  lastYearExpenses: number;
  cumulativeInflationFactor: number;
  realReturn: number;
}

export interface AnalysisResult {
  readinessScore: number; // 0..100
  status: RetirementStatus;
  retirementAge: number;
  ages: RetirementAgeAnalysis;
  corpus: CorpusAnalysis;
  swr: SwrAnalysis;
  baseProjection: ProjectionResult;
  monteCarlo: MonteCarloResult;
  scenarioProjections: { scenario: MarketScenario; result: ProjectionResult }[];
  tax: TaxImpactSummary;
  inflation: InflationImpactSummary;
  yearsMoneyWillLast: number;
  insights: string[];
}
