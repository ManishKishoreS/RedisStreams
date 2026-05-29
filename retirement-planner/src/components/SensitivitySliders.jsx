import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

export default function SensitivitySliders() {
  const { profile, income, expenses, setProfile, setExpenses, setAssumptions, setIncome, assumptions, compute } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  const handleChange = (updater) => {
    updater()
    compute()
  }

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-white">Sensitivity Analysis</h3>
        <p className="text-xs text-slate-500 mt-1">Adjust sliders to see real-time impact on your plan</p>
      </div>

      <SensitivitySlider
        label="Retirement Age"
        value={profile.retirementAge}
        min={profile.age + 1}
        max={profile.age + 20}
        step={1}
        format={v => `${v}`}
        onChange={v => handleChange(() => setProfile({ retirementAge: v }))}
        color="indigo"
      />

      <SensitivitySlider
        label="Monthly Savings"
        value={income.monthlySavings || 0}
        min={0}
        max={Math.round((income.monthlySavings || 20000) * 2)}
        step={1000}
        format={v => `${sym}${v.toLocaleString()}`}
        onChange={v => handleChange(() => setIncome({ monthlySavings: v }))}
        color="emerald"
      />

      <SensitivitySlider
        label="Equity Return"
        value={(assumptions?.equityReturn || 0.10) * 100}
        min={5}
        max={18}
        step={0.5}
        format={v => `${v.toFixed(1)}%`}
        onChange={v => handleChange(() => setAssumptions({ equityReturn: v / 100 }))}
        color="purple"
      />

      <SensitivitySlider
        label="Monthly Expenses"
        value={expenses.monthlyExpenses}
        min={Math.round(expenses.monthlyExpenses * 0.5)}
        max={Math.round(expenses.monthlyExpenses * 2)}
        step={1000}
        format={v => `${sym}${v.toLocaleString()}`}
        onChange={v => handleChange(() => setExpenses({ monthlyExpenses: v }))}
        color="amber"
      />
    </div>
  )
}

function SensitivitySlider({ label, value, min, max, step, format, onChange, color }) {
  const colorMap = {
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  }
  const c = colorMap[color] || colorMap.indigo

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className={`text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-lg ${c.bg} ${c.text}`}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}
