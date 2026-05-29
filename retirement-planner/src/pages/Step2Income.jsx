import { useStore } from '../store/useStore.js'
import { Tooltip } from '../components/Tooltip.jsx'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

export function Step2Income({ onNext, onBack }) {
  const { income, setIncome, profile } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'
  const isIN = profile.country === 'IN'
  const isUS = profile.country === 'US'
  const isUK = profile.country === 'UK'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Income & Assets</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your current income sources and savings</p>
      </div>

      <Section title="Monthly Income">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={`Monthly Salary (${sym})`} htmlFor="salary">
            <input id="salary" type="number" min={0} value={income.monthlySalary}
              onChange={e => setIncome({ monthlySalary: Number(e.target.value) })} className="input-field" />
          </Field>
          <Field label={`Pension Income (${sym}/mo)`} htmlFor="pension">
            <input id="pension" type="number" min={0} value={income.monthlyPension}
              onChange={e => setIncome({ monthlyPension: Number(e.target.value) })} className="input-field" />
          </Field>
          <Field label={`Rental Income (${sym}/mo)`} htmlFor="rental">
            <input id="rental" type="number" min={0} value={income.rentalIncome}
              onChange={e => setIncome({ rentalIncome: Number(e.target.value) })} className="input-field" />
          </Field>
          <Field label={`Other Income (${sym}/mo)`} htmlFor="other">
            <input id="other" type="number" min={0} value={income.otherIncome}
              onChange={e => setIncome({ otherIncome: Number(e.target.value) })} className="input-field" />
          </Field>
        </div>
      </Section>

      <Section title="Savings & Investments">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={<Tooltip text="Total value of savings, FDs, mutual funds, stocks etc.">Current Savings / Investments ({sym})</Tooltip>} htmlFor="savings">
            <input id="savings" type="number" min={0} value={income.currentSavings}
              onChange={e => setIncome({ currentSavings: Number(e.target.value) })} className="input-field" />
          </Field>
          {isIN && <>
            <Field label={<Tooltip text="EPF + VPF accumulated balance">EPF Balance ({sym})</Tooltip>} htmlFor="epf">
              <input id="epf" type="number" min={0} value={income.epfBalance}
                onChange={e => setIncome({ epfBalance: Number(e.target.value) })} className="input-field" />
            </Field>
            <Field label={<Tooltip text="Current NPS Tier-I + Tier-II corpus">NPS Balance ({sym})</Tooltip>} htmlFor="nps">
              <input id="nps" type="number" min={0} value={income.npsBalance}
                onChange={e => setIncome({ npsBalance: Number(e.target.value) })} className="input-field" />
            </Field>
            <Field label={<Tooltip text="Your monthly NPS contribution (Tier-I)">Monthly NPS Contribution ({sym})</Tooltip>} htmlFor="npsMo">
              <input id="npsMo" type="number" min={0} value={income.npsMonthly}
                onChange={e => setIncome({ npsMonthly: Number(e.target.value) })} className="input-field" />
            </Field>
          </>}
          {isUS && <>
            <Field label={<Tooltip text="401(k) / IRA current balance">401(k) / IRA Balance ($)</Tooltip>} htmlFor="k401">
              <input id="k401" type="number" min={0} value={income.accountType401k}
                onChange={e => setIncome({ accountType401k: Number(e.target.value) })} className="input-field" />
            </Field>
          </>}
          {isUK && <>
            <Field label={<Tooltip text="Stocks & Shares ISA current value">ISA Balance (£)</Tooltip>} htmlFor="isa">
              <input id="isa" type="number" min={0} value={income.isaBalance}
                onChange={e => setIncome({ isaBalance: Number(e.target.value) })} className="input-field" />
            </Field>
          </>}
        </div>
      </Section>

      <Section title="Savings Plan">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={<Tooltip text="How much you invest each month towards retirement">Monthly Savings / SIP ({sym})</Tooltip>} htmlFor="mthSav">
            <input id="mthSav" type="number" min={0} value={income.monthlySavings}
              onChange={e => setIncome({ monthlySavings: Number(e.target.value) })} className="input-field" />
          </Field>
          <Field label={<Tooltip text="Percentage by which you increase your monthly SIP each year (e.g. 10% step-up)">Annual SIP Step-Up (%)</Tooltip>} htmlFor="stepUp">
            <input id="stepUp" type="number" min={0} max={30} step={0.5} value={(income.stepUpRate * 100).toFixed(1)}
              onChange={e => setIncome({ stepUpRate: Number(e.target.value) / 100 })} className="input-field" />
          </Field>
          <Field label={<Tooltip text="Percentage of portfolio in equities (rest in debt/bonds)">Equity Allocation (%)</Tooltip>} htmlFor="equity">
            <input id="equity" type="number" min={0} max={100} value={Math.round(income.equityRatio * 100)}
              onChange={e => setIncome({ equityRatio: Number(e.target.value) / 100 })} className="input-field" />
          </Field>
        </div>
      </Section>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={onNext} className="btn-primary">Continue → Expenses</button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  )
}
