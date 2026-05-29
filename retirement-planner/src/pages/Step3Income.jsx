import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

export function Step3Income({ onNext, onBack }) {
  const { income, setIncome, profile } = useStore()
  const workCountry = profile.workCountry || 'IN'
  const sym = CURRENCY_SYMBOLS[workCountry] || '₹'
  const isIN = workCountry === 'IN'
  const isUS = workCountry === 'US'
  const isUK = workCountry === 'UK'
  const crossBorder = !profile.sameCountry && profile.workCountry !== profile.retireCountry

  // Auto-compute EPF for India
  const epfAuto = isIN ? Math.round((income.monthlySalary || 0) * 0.12) : 0

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Money In — Income & Assets</h2>
        <p className="text-slate-400 mt-1">
          {isIN && 'India-specific fields: EPF, NPS, PPF, SIP'}
          {isUS && 'US-specific fields: 401(k), IRA, Roth IRA, Brokerage'}
          {isUK && 'UK-specific fields: Pension, ISA, LISA'}
        </p>
      </div>

      {/* Salary */}
      <Section icon="💰" title="Salary & Active Income" subtitle="Your current earnings">
        <div className="grid sm:grid-cols-2 gap-4">
          {isIN && (
            <>
              <CurrencyField label="Monthly CTC (Gross)" htmlFor="salary" sym={sym}
                hint="Your total cost to company per month"
                value={income.monthlySalary}
                onChange={v => setIncome({ monthlySalary: v })} />
              <CurrencyField label="Rental Income (monthly)" htmlFor="rental" sym={sym}
                value={income.rentalIncome || 0}
                onChange={v => setIncome({ rentalIncome: v })} />
              <CurrencyField label="Business / Freelance Income (monthly)" htmlFor="biz" sym={sym}
                value={income.businessIncome || 0}
                onChange={v => setIncome({ businessIncome: v })} />
            </>
          )}
          {isUS && (
            <>
              <CurrencyField label="Annual Salary" htmlFor="annualSalary" sym="$"
                value={income.annualSalary || 0}
                onChange={v => setIncome({ annualSalary: v, monthlySalary: Math.round(v / 12) })} />
              <CurrencyField label="Rental Income (monthly)" htmlFor="rental" sym="$"
                value={income.rentalIncome || 0}
                onChange={v => setIncome({ rentalIncome: v })} />
            </>
          )}
          {isUK && (
            <>
              <CurrencyField label="Annual Salary" htmlFor="annualSalary" sym="£"
                value={income.annualSalary || 0}
                onChange={v => setIncome({ annualSalary: v, monthlySalary: Math.round(v / 12) })} />
              <CurrencyField label="Rental Income (monthly)" htmlFor="rental" sym="£"
                value={income.rentalIncome || 0}
                onChange={v => setIncome({ rentalIncome: v })} />
            </>
          )}
          <PercentField label="Salary Growth Rate (annual)" htmlFor="salaryGrowth"
            hint="Expected % raise per year"
            value={(income.salaryGrowthRate || 0.08) * 100}
            onChange={v => setIncome({ salaryGrowthRate: v / 100 })} />
        </div>
      </Section>

      {/* Country-specific retirement accounts */}
      {isIN && (
        <Section icon="🏦" title="India Retirement Accounts" subtitle="Tax-advantaged savings">
          <div className="grid sm:grid-cols-2 gap-4">
            <CurrencyField label="EPF Balance (current)" htmlFor="epfBal" sym={sym}
              value={income.epfBalance || 0}
              onChange={v => setIncome({ epfBalance: v })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-300">EPF Monthly (Employee)</label>
              <p className="text-xs text-slate-500">Auto: 12% of basic = {sym}{epfAuto.toLocaleString()}</p>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500">
                <span className="px-3 py-3 text-slate-400 font-medium text-sm border-r border-slate-700 bg-slate-800">{sym}</span>
                <input
                  type="number"
                  min={0}
                  value={income.epfMonthly ?? epfAuto}
                  onChange={e => setIncome({ epfMonthly: Number(e.target.value) })}
                  className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none tabular-nums"
                />
              </div>
            </div>
            <CurrencyField label="VPF Monthly (Voluntary PF)" htmlFor="vpf" sym={sym}
              value={income.vpfMonthly || 0}
              onChange={v => setIncome({ vpfMonthly: v })} />
            <CurrencyField label="PPF Monthly" htmlFor="ppf" sym={sym}
              hint="Max ₹1.5L / year"
              value={income.ppfMonthly || 0}
              onChange={v => setIncome({ ppfMonthly: v })} />
            <CurrencyField label="NPS Balance (Tier I)" htmlFor="npsBal" sym={sym}
              value={income.npsBalance || 0}
              onChange={v => setIncome({ npsBalance: v })} />
            <CurrencyField label="NPS Monthly (Tier I)" htmlFor="npsMo" sym={sym}
              hint="Extra ₹50,000 deduction via 80CCD(1B)"
              value={income.npsMonthly || 0}
              onChange={v => setIncome({ npsMonthly: v })} />
            <CurrencyField label="Mutual Fund SIP (monthly)" htmlFor="mfSip" sym={sym}
              value={income.mutualFundSIP || 0}
              onChange={v => setIncome({ mutualFundSIP: v })} />
          </div>
        </Section>
      )}

      {isUS && (
        <Section icon="🏦" title="US Retirement & Investment Accounts" subtitle="Tax-advantaged savings">
          <div className="grid sm:grid-cols-2 gap-4">
            <CurrencyField label="401(k) Balance" htmlFor="k401bal" sym="$"
              value={income.k401Balance || 0}
              onChange={v => setIncome({ k401Balance: v, currentSavings: v + (income.iraBalance || 0) + (income.currentSavings || 0) })} />
            <CurrencyField label="401(k) Monthly Contribution" htmlFor="k401mo" sym="$"
              value={income.k401Monthly || 0}
              onChange={v => setIncome({ k401Monthly: v })} />
            <PercentField label="Employer 401(k) Match" htmlFor="k401match"
              value={(income.employerMatch401k || 0.05) * 100}
              onChange={v => setIncome({ employerMatch401k: v / 100 })} />
            <CurrencyField label="IRA / Roth IRA Balance" htmlFor="iraBal" sym="$"
              value={income.iraBalance || 0}
              onChange={v => setIncome({ iraBalance: v })} />
            <CurrencyField label="Roth IRA Monthly" htmlFor="rothIra" sym="$"
              hint="Annual limit $7,000 ($8,000 if 50+)"
              value={income.rothIraMonthly || 0}
              onChange={v => setIncome({ rothIraMonthly: v })} />
            <CurrencyField label="Brokerage Monthly" htmlFor="brokerage" sym="$"
              value={income.brokerageMonthly || 0}
              onChange={v => setIncome({ brokerageMonthly: v })} />
          </div>
        </Section>
      )}

      {isUK && (
        <Section icon="🏦" title="UK Pension & Savings" subtitle="Tax-advantaged savings">
          <div className="grid sm:grid-cols-2 gap-4">
            <CurrencyField label="Pension Balance" htmlFor="penBal" sym="£"
              value={income.pensionBalance || 0}
              onChange={v => setIncome({ pensionBalance: v })} />
            <CurrencyField label="Monthly Pension Contribution" htmlFor="penMo" sym="£"
              value={income.pensionMonthly || 0}
              onChange={v => setIncome({ pensionMonthly: v })} />
            <PercentField label="Employer Pension Match" htmlFor="penMatch"
              value={(income.employerMatchPension || 0.05) * 100}
              onChange={v => setIncome({ employerMatchPension: v / 100 })} />
            <CurrencyField label="Stocks & Shares ISA Balance" htmlFor="isa" sym="£"
              value={income.isaBalance || 0}
              onChange={v => setIncome({ isaBalance: v })} />
            <CurrencyField label="LISA Monthly" htmlFor="lisa" sym="£"
              hint="Max £4,000/year, 25% govt bonus"
              value={income.lisaMonthly || 0}
              onChange={v => setIncome({ lisaMonthly: v })} />
          </div>
        </Section>
      )}

      {/* General savings */}
      <Section icon="💼" title="Total Savings & Portfolio" subtitle="All your wealth">
        <div className="grid sm:grid-cols-2 gap-4">
          <CurrencyField label="Current Savings / Investments" htmlFor="savings" sym={sym}
            hint="Total: bank savings, FDs, stocks, MFs, etc."
            value={income.currentSavings || 0}
            onChange={v => setIncome({ currentSavings: v })} />
          <CurrencyField label="Total Monthly Investment" htmlFor="mthSav" sym={sym}
            hint="All your monthly savings/SIPs combined"
            value={income.monthlySavings || 0}
            onChange={v => setIncome({ monthlySavings: v })} />
          <PercentField label="Annual SIP Step-Up" htmlFor="stepUp"
            hint="% increase in savings each year"
            value={(income.stepUpRate || 0.10) * 100}
            onChange={v => setIncome({ stepUpRate: v / 100 })} />
          <PercentField label="Equity Allocation" htmlFor="equity"
            hint="% in equities vs debt/bonds"
            value={(income.equityRatio || 0.60) * 100}
            onChange={v => setIncome({ equityRatio: v / 100 })} />
          <CurrencyField label="Real Estate (work country)" htmlFor="re1" sym={sym}
            value={income.realEstateWorkCountry || 0}
            onChange={v => setIncome({ realEstateWorkCountry: v })} />
          {crossBorder && (
            <CurrencyField label="Real Estate (retire country)" htmlFor="re2" sym={CURRENCY_SYMBOLS[profile.retireCountry] || '₹'}
              value={income.realEstateRetireCountry || 0}
              onChange={v => setIncome({ realEstateRetireCountry: v })} />
          )}
          <CurrencyField label="Other Assets" htmlFor="other" sym={sym}
            hint="Gold, jewelry, collectibles, etc."
            value={income.otherAssets || 0}
            onChange={v => setIncome({ otherAssets: v })} />
        </div>

        {/* Equity allocation visual */}
        <div className="mt-4 rounded-xl bg-slate-900 border border-slate-700 p-4">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Equity {Math.round((income.equityRatio || 0.6) * 100)}%</span>
            <span>Debt {Math.round((1 - (income.equityRatio || 0.6)) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(income.equityRatio || 0.6) * 100}%` }}
            />
          </div>
        </div>
      </Section>

      {/* Cross-border remittance */}
      {crossBorder && (
        <Section icon="🌐" title="Cross-Border Remittance" subtitle="Money you send to your retire country">
          <CurrencyField label="Monthly Remittance" htmlFor="remit" sym={sym}
            hint="Amount sent to your retirement country each month"
            value={income.remittanceMonthly || 0}
            onChange={v => setIncome({ remittanceMonthly: v })} />
        </Section>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={onNext} className="btn-primary">Continue — Expenses →</button>
      </div>
    </div>
  )
}

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
        <span className="text-xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-white text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function CurrencyField({ label, htmlFor, sym, hint, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">{label}</label>
      {hint && <p className="text-xs text-slate-500 -mt-0.5">{hint}</p>}
      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <span className="px-3 py-3 text-slate-400 font-medium text-sm border-r border-slate-700 bg-slate-800">{sym}</span>
        <input
          id={htmlFor}
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none tabular-nums"
        />
      </div>
    </div>
  )
}

function PercentField({ label, htmlFor, hint, value, onChange, step = 1, max = 100 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">{label}</label>
      {hint && <p className="text-xs text-slate-500 -mt-0.5">{hint}</p>}
      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <input
          id={htmlFor}
          type="number"
          min={0}
          max={max}
          step={step}
          value={parseFloat((value || 0).toFixed(1))}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-white px-4 py-3 text-sm focus:outline-none tabular-nums"
        />
        <span className="px-3 py-3 text-slate-400 font-medium text-sm border-l border-slate-700 bg-slate-800">%</span>
      </div>
    </div>
  )
}
