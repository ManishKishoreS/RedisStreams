import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS, DEFAULT_INFLATION } from '../data/defaults.js'

const LIFESTYLE_PRESETS = {
  IN: { frugal: 25000, comfortable: 50000, lavish: 120000 },
  US: { frugal: 2500, comfortable: 5000, lavish: 12000 },
  UK: { frugal: 1800, comfortable: 3500, lavish: 8000 },
}

export function Step4Expenses({ onNext, onBack }) {
  const { expenses, setExpenses, addOneTimeExpense, removeOneTimeExpense, profile, family } = useStore()
  const retireCountry = profile.retireCountry || profile.workCountry || 'IN'
  const sym = CURRENCY_SYMBOLS[retireCountry] || '₹'
  const [ote, setOte] = useState({ label: '', amount: '', year: profile.age + 5 })

  // Auto-fill children education from family
  const childrenEducationEstimate = (family?.children || []).reduce((sum, child) => {
    if (!child.dob) return sum
    const childAge = new Date().getFullYear() - new Date(child.dob).getFullYear()
    if (childAge < 18) return sum + 5000 // monthly school fees estimate
    return sum
  }, 0)

  // Auto-fill parent support from family
  const parentSupportEstimate = (family?.dependents || []).reduce((sum, dep) => {
    if (dep.currentAge >= 70) return sum + 8000 // active care
    return sum + 2000 // partial support
  }, 0)

  const handleCategoryChange = (cat, val) => {
    setExpenses({ [cat]: val })
  }

  const addOte = () => {
    if (!ote.label || !ote.amount) return
    addOneTimeExpense({ label: ote.label, amount: Number(ote.amount), year: Number(ote.year) })
    setOte({ label: '', amount: '', year: profile.age + 5 })
  }

  const lifestylePresets = LIFESTYLE_PRESETS[retireCountry] || LIFESTYLE_PRESETS.IN

  const CATEGORIES = [
    { key: 'housing', label: 'Housing (rent/mortgage)', icon: '🏠', color: 'indigo' },
    { key: 'food', label: 'Food & Groceries', icon: '🛒', color: 'emerald' },
    { key: 'transport', label: 'Transport', icon: '🚗', color: 'blue' },
    { key: 'healthcare', label: 'Healthcare', icon: '🏥', color: 'red' },
    { key: 'childrenEducation', label: 'Children Education (monthly fees)', icon: '📚', color: 'purple' },
    { key: 'parentSupport', label: 'Parent Support', icon: '👴', color: 'amber' },
    { key: 'lifestyle', label: 'Lifestyle (travel, dining, entertainment)', icon: '✈️', color: 'pink' },
    { key: 'other', label: 'Other', icon: '📦', color: 'slate' },
  ]

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Money Out — Expenses</h2>
        <p className="text-slate-400 mt-1">Break down your current spending and set retirement expectations</p>
      </div>

      {/* Monthly expense categories */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">💳</span>
          <div>
            <h3 className="font-semibold text-white text-base">Monthly Expenses by Category</h3>
            <p className="text-xs text-slate-500">
              Total: {sym}{(expenses.monthlyExpenses || 0).toLocaleString()}/month
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const autoHint = cat.key === 'childrenEducation' && childrenEducationEstimate > 0
              ? `Estimated from ${family.children.length} child(ren): ~${sym}${childrenEducationEstimate.toLocaleString()}`
              : cat.key === 'parentSupport' && parentSupportEstimate > 0
              ? `Estimated from ${family.dependents.length} dependent(s): ~${sym}${parentSupportEstimate.toLocaleString()}`
              : null
            return (
              <div key={cat.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium text-slate-300">{cat.label}</span>
                    {autoHint && <span className="text-xs text-slate-500 hidden sm:inline">({autoHint})</span>}
                  </div>
                  <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
                    <span className="px-2 py-1.5 text-slate-400 text-xs border-r border-slate-700 bg-slate-800">{sym}</span>
                    <input
                      type="number"
                      min={0}
                      value={expenses[cat.key] ?? 0}
                      onChange={e => handleCategoryChange(cat.key, Number(e.target.value))}
                      className="bg-transparent text-white px-2 py-1.5 text-sm focus:outline-none w-24 tabular-nums"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(50000, (expenses[cat.key] || 0) * 2 + 10000)}
                  step={500}
                  value={expenses[cat.key] ?? 0}
                  onChange={e => handleCategoryChange(cat.key, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )
          })}
        </div>

        {/* Total bar */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Total Monthly</span>
          <span className="text-xl font-extrabold text-white tabular-nums">
            {sym}{(expenses.monthlyExpenses || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Post-retirement expenses */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">🌅</span>
          <div>
            <h3 className="font-semibold text-white text-base">Post-Retirement Expenses</h3>
            <p className="text-xs text-slate-500">Usually lower than working-life expenses</p>
          </div>
        </div>

        {/* Own home toggle */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-slate-300">Will you own your home by retirement?</p>
            <p className="text-xs text-slate-500">Eliminates housing costs from retirement expenses</p>
          </div>
          <button
            onClick={() => setExpenses({ ownsHomeAtRetirement: !expenses.ownsHomeAtRetirement })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200
              ${expenses.ownsHomeAtRetirement ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-700 border-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5
              ${expenses.ownsHomeAtRetirement ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Lifestyle presets */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-300 mb-3">Expected Retirement Lifestyle</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'frugal', label: 'Frugal', icon: '🌿', desc: 'Essential needs only', color: 'emerald' },
              { key: 'comfortable', label: 'Comfortable', icon: '😊', desc: 'Moderate lifestyle', color: 'indigo' },
              { key: 'lavish', label: 'Lavish', icon: '✨', desc: 'Premium living', color: 'purple' },
            ].map(ls => (
              <button
                key={ls.key}
                onClick={() => setExpenses({ retirementLifestyle: ls.key, postRetirementMonthly: lifestylePresets[ls.key] })}
                className={`rounded-xl border p-3 text-left transition-all
                  ${expenses.retirementLifestyle === ls.key
                    ? ls.color === 'emerald' ? 'border-emerald-500 bg-emerald-500/10' : ls.color === 'purple' ? 'border-purple-500 bg-purple-500/10' : 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
              >
                <div className="text-lg mb-1">{ls.icon}</div>
                <p className={`text-sm font-semibold ${expenses.retirementLifestyle === ls.key ? 'text-white' : 'text-slate-300'}`}>{ls.label}</p>
                <p className="text-xs text-slate-500">{sym}{lifestylePresets[ls.key].toLocaleString()}/mo</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom post-retirement amount */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300 whitespace-nowrap">Custom monthly amount (optional):</label>
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500">
            <span className="px-3 py-2.5 text-slate-400 text-sm border-r border-slate-700 bg-slate-800">{sym}</span>
            <input
              type="number"
              min={0}
              value={expenses.postRetirementMonthly || ''}
              placeholder="0 = use lifestyle preset"
              onChange={e => setExpenses({ postRetirementMonthly: Number(e.target.value) })}
              className="flex-1 bg-transparent text-white px-3 py-2.5 text-sm focus:outline-none tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Inflation assumptions */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">📉</span>
          <div>
            <h3 className="font-semibold text-white text-base">Inflation Assumptions</h3>
            <p className="text-xs text-slate-500">
              Defaults set for {profile.retireCountry === 'IN' ? 'India' : profile.retireCountry === 'US' ? 'US' : 'UK'}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <SliderField
            label="General Inflation Rate"
            hint="Annual rate at which living costs rise"
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
            hint={`Healthcare costs rise faster — ${profile.retireCountry === 'IN' ? '13%' : profile.retireCountry === 'US' ? '5%' : '4%'} default`}
            value={expenses.medicalInflation * 100}
            min={0}
            max={25}
            step={0.5}
            onChange={v => setExpenses({ medicalInflation: v / 100 })}
            color="amber"
            suffix="%"
          />
          <SliderField
            label="Medical Expense Share of Total"
            hint="Fraction of monthly expenses that is healthcare"
            value={expenses.medicalExpenseRatio * 100}
            min={0}
            max={60}
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
          <span className="text-xl">🎯</span>
          <div>
            <h3 className="font-semibold text-white text-base">One-Time Future Expenses</h3>
            <p className="text-xs text-slate-500">Auto-populated from life events, or add manually</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap mb-5">
          <input
            placeholder="Label (e.g. Home renovation)"
            value={ote.label}
            onChange={e => setOte(p => ({ ...p, label: e.target.value }))}
            className="input-field flex-1 min-w-[160px]"
          />
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 w-40">
            <span className="px-3 text-slate-400 text-sm border-r border-slate-700 bg-slate-800 py-3">{sym}</span>
            <input
              type="number"
              placeholder="Amount"
              value={ote.amount}
              onChange={e => setOte(p => ({ ...p, amount: e.target.value }))}
              className="flex-1 bg-transparent text-white px-2 py-3 text-sm focus:outline-none w-20 tabular-nums"
            />
          </div>
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 w-32">
            <input
              type="number"
              placeholder="Your age"
              min={profile.age || 20}
              max={90}
              value={ote.year}
              onChange={e => setOte(p => ({ ...p, year: e.target.value }))}
              className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none tabular-nums"
            />
            <span className="px-2 text-slate-500 text-xs">yrs</span>
          </div>
          <button onClick={addOte} className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all whitespace-nowrap">
            + Add
          </button>
        </div>
        {expenses.oneTimeExpenses && expenses.oneTimeExpenses.length > 0 ? (
          <ul className="space-y-2">
            {expenses.oneTimeExpenses.map(e => (
              <li key={e.id} className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3">
                <span className="text-xs flex-shrink-0">💸</span>
                <span className="flex-1 text-sm font-medium text-white">{e.label}</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">Age {e.year}</span>
                <span className="text-sm font-semibold text-emerald-400 tabular-nums">{sym}{Number(e.amount).toLocaleString()}</span>
                <button
                  onClick={() => removeOneTimeExpense(e.id)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center text-sm"
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
        <button onClick={onNext} className="btn-primary">Continue — Retirement Goal →</button>
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
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}
