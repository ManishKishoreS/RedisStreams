import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

export function Step2Income({ onNext, onBack }) {
  const { income, setIncome, profile } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'
  const isIN = profile.country === 'IN'
  const isUS = profile.country === 'US'
  const isUK = profile.country === 'UK'

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Income &amp; Assets</h2>
        <p className="text-slate-400 mt-1">Enter your current income sources and savings</p>
      </div>

      {/* Monthly Income */}
      <Section icon="💰" title="Monthly Income" subtitle="Your active income streams">
        <div className="grid sm:grid-cols-2 gap-4">
          <CurrencyField label="Monthly Salary" htmlFor="salary" sym={sym}
            value={income.monthlySalary}
            onChange={v => setIncome({ monthlySalary: v })} />
          <CurrencyField label="Pension Income" htmlFor="pension" sym={sym}
            value={income.monthlyPension}
            onChange={v => setIncome({ monthlyPension: v })} />
          <CurrencyField label="Rental Income" htmlFor="rental" sym={sym}
            value={income.rentalIncome}
            onChange={v => setIncome({ rentalIncome: v })} />
          <CurrencyField label="Other Income" htmlFor="other" sym={sym}
            value={income.otherIncome}
            onChange={v => setIncome({ otherIncome: v })} />
        </div>
      </Section>

      {/* Investments */}
      <Section icon="🏦" title="Savings &amp; Investments" subtitle="Accumulated wealth across all accounts">
        <div className="grid sm:grid-cols-2 gap-4">
          <CurrencyField
            label="Current Savings / Investments"
            htmlFor="savings"
            sym={sym}
            hint="Total value: savings, FDs, MFs, stocks"
            value={income.currentSavings}
            onChange={v => setIncome({ currentSavings: v })}
          />
          {isIN && (
            <>
              <CurrencyField label="EPF Balance" htmlFor="epf" sym={sym}
                hint="EPF + VPF accumulated"
                value={income.epfBalance}
                onChange={v => setIncome({ epfBalance: v })} />
              <CurrencyField label="NPS Balance" htmlFor="nps" sym={sym}
                hint="NPS Tier-I + Tier-II corpus"
                value={income.npsBalance}
                onChange={v => setIncome({ npsBalance: v })} />
              <CurrencyField label="Monthly NPS Contribution" htmlFor="npsMo" sym={sym}
                hint="NPS Tier-I monthly"
                value={income.npsMonthly}
                onChange={v => setIncome({ npsMonthly: v })} />
            </>
          )}
          {isUS && (
            <CurrencyField label="401(k) / IRA Balance" htmlFor="k401" sym="$"
              hint="Combined retirement account balance"
              value={income.accountType401k}
              onChange={v => setIncome({ accountType401k: v })} />
          )}
          {isUK && (
            <CurrencyField label="ISA Balance" htmlFor="isa" sym="£"
              hint="Stocks & Shares ISA current value"
              value={income.isaBalance}
              onChange={v => setIncome({ isaBalance: v })} />
          )}
        </div>
      </Section>

      {/* Savings Plan */}
      <Section icon="📈" title="Savings Plan" subtitle="How aggressively you invest">
        <div className="grid sm:grid-cols-2 gap-4">
          <CurrencyField
            label="Monthly SIP / Savings"
            htmlFor="mthSav"
            sym={sym}
            hint="Amount invested each month"
            value={income.monthlySavings}
            onChange={v => setIncome({ monthlySavings: v })}
          />
          <PercentField
            label="Annual SIP Step-Up"
            htmlFor="stepUp"
            hint="% increase in SIP each year"
            value={income.stepUpRate * 100}
            onChange={v => setIncome({ stepUpRate: v / 100 })}
            step={0.5}
            max={30}
          />
          <PercentField
            label="Equity Allocation"
            htmlFor="equity"
            hint="% in equities (rest in bonds/debt)"
            value={income.equityRatio * 100}
            onChange={v => setIncome({ equityRatio: v / 100 })}
            step={5}
            max={100}
          />
        </div>
        {/* Allocation visual */}
        <div className="mt-4 rounded-xl bg-slate-900 border border-slate-700 p-4">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Equity {Math.round(income.equityRatio * 100)}%</span>
            <span>Debt {Math.round((1 - income.equityRatio) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${income.equityRatio * 100}%` }}
            />
          </div>
        </div>
      </Section>

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
          value={parseFloat(value.toFixed(1))}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-white px-4 py-3 text-sm focus:outline-none tabular-nums"
        />
        <span className="px-3 py-3 text-slate-400 font-medium text-sm border-l border-slate-700 bg-slate-800">%</span>
      </div>
    </div>
  )
}
