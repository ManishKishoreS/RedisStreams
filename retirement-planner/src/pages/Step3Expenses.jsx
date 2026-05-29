import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

export function Step3Expenses({ onNext, onBack }) {
  const { expenses, setExpenses, addOneTimeExpense, removeOneTimeExpense, profile } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'
  const [ote, setOte] = useState({ label: '', amount: '', year: profile.age + 5 })

  const addOte = () => {
    if (!ote.label || !ote.amount) return
    addOneTimeExpense({ label: ote.label, amount: Number(ote.amount), year: Number(ote.year) })
    setOte({ label: '', amount: '', year: profile.age + 5 })
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Expenses &amp; Inflation</h2>
        <p className="text-slate-400 mt-1">Model your spending and inflation assumptions</p>
      </div>

      {/* Monthly Expenses */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">💳</span>
          <div>
            <h3 className="font-semibold text-white text-base">Monthly Expenses</h3>
            <p className="text-xs text-slate-500">Your current total monthly spend</p>
          </div>
        </div>
        <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 max-w-xs">
          <span className="px-3 py-3 text-slate-400 font-medium text-sm border-r border-slate-700 bg-slate-800">{sym}</span>
          <input
            id="mthExp"
            type="number"
            min={0}
            value={expenses.monthlyExpenses}
            onChange={e => setExpenses({ monthlyExpenses: Number(e.target.value) })}
            className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none tabular-nums"
          />
        </div>
      </div>

      {/* Inflation sliders */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">📉</span>
          <div>
            <h3 className="font-semibold text-white text-base">Inflation Assumptions</h3>
            <p className="text-xs text-slate-500">How costs will rise over time</p>
          </div>
        </div>

        <div className="space-y-6">
          <SliderField
            label="General Inflation Rate"
            hint="Annual rate at which general living costs rise"
            value={expenses.generalInflation * 100}
            min={0}
            max={20}
            step={0.5}
            onChange={v => setExpenses({ generalInflation: v / 100 })}
            color="indigo"
            suffix="%"
          />
          <SliderField
            label="Medical Inflation Rate"
            hint="Healthcare costs rise faster — 13-14% in India, 5-6% in US/UK"
            value={expenses.medicalInflation * 100}
            min={0}
            max={25}
            step={0.5}
            onChange={v => setExpenses({ medicalInflation: v / 100 })}
            color="amber"
            suffix="%"
          />
          <SliderField
            label="Medical Expense Share"
            hint="Fraction of monthly expenses that is healthcare/medical"
            value={expenses.medicalExpenseRatio * 100}
            min={0}
            max={100}
            step={1}
            onChange={v => setExpenses({ medicalExpenseRatio: v / 100 })}
            color="emerald"
            suffix="%"
          />
        </div>
      </div>

      {/* One-time expenses */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">🏠</span>
          <div>
            <h3 className="font-semibold text-white text-base">One-Time Future Expenses</h3>
            <p className="text-xs text-slate-500">Education, wedding, home renovation, travel...</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mb-5">
          <input
            placeholder="Label (e.g. Child's college)"
            value={ote.label}
            onChange={e => setOte(p => ({ ...p, label: e.target.value }))}
            className="input-field flex-1 min-w-[160px]"
          />
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 w-40">
            <span className="px-3 text-slate-400 text-sm border-r border-slate-700 bg-slate-800 py-3">{sym}</span>
            <input
              type="number"
              placeholder="Amount"
              value={ote.amount}
              onChange={e => setOte(p => ({ ...p, amount: e.target.value }))}
              className="flex-1 bg-transparent text-white px-2 py-3 text-sm focus:outline-none w-20 tabular-nums"
            />
          </div>
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 w-32">
            <input
              type="number"
              placeholder="Your age"
              min={profile.age}
              max={profile.retirementAge + 5}
              value={ote.year}
              onChange={e => setOte(p => ({ ...p, year: e.target.value }))}
              className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none tabular-nums"
            />
            <span className="px-2 text-slate-500 text-xs">yrs</span>
          </div>
          <button
            onClick={addOte}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all whitespace-nowrap"
          >
            + Add
          </button>
        </div>

        {expenses.oneTimeExpenses.length > 0 ? (
          <ul className="space-y-2">
            {expenses.oneTimeExpenses.map(e => (
              <li key={e.id} className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">💸</span>
                </div>
                <span className="flex-1 text-sm font-medium text-white">{e.label}</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">Age {e.year}</span>
                <span className="text-sm font-semibold text-emerald-400 tabular-nums">{sym}{Number(e.amount).toLocaleString()}</span>
                <button
                  onClick={() => removeOneTimeExpense(e.id)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center text-sm"
                  aria-label="Remove expense"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 italic text-center py-4">No one-time expenses added yet</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={onNext} className="btn-primary">Continue — Scenarios →</button>
      </div>
    </div>
  )
}

function SliderField({ label, hint, value, min, max, step, onChange, color, suffix }) {
  const colorMap = {
    indigo: { track: 'bg-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    amber: { track: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    emerald: { track: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  }
  const c = colorMap[color] || colorMap.indigo
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-sm font-semibold text-slate-300">{label}</span>
          {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
        </div>
        <span className={`text-lg font-bold tabular-nums ${c.text} ${c.bg} px-2.5 py-0.5 rounded-lg`}>
          {parseFloat(value.toFixed(1))}{suffix}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}
