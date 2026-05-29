import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { Tooltip } from '../components/Tooltip.jsx'
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses & Inflation</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Model your spending and inflation assumptions</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={`Current Monthly Expenses (${sym})`} htmlFor="mthExp">
          <input id="mthExp" type="number" min={0} value={expenses.monthlyExpenses}
            onChange={e => setExpenses({ monthlyExpenses: Number(e.target.value) })} className="input-field" />
        </Field>

        <Field label={<Tooltip text="Annual rate at which general living costs rise">General Inflation Rate (%)</Tooltip>} htmlFor="genInfl">
          <input id="genInfl" type="number" min={0} max={20} step={0.5} value={(expenses.generalInflation * 100).toFixed(1)}
            onChange={e => setExpenses({ generalInflation: Number(e.target.value) / 100 })} className="input-field" />
        </Field>

        <Field label={<Tooltip text="Healthcare costs typically rise faster — often 13–14% p.a. in India, 5–6% in US/UK">Medical Inflation Rate (%)</Tooltip>} htmlFor="medInfl">
          <input id="medInfl" type="number" min={0} max={25} step={0.5} value={(expenses.medicalInflation * 100).toFixed(1)}
            onChange={e => setExpenses({ medicalInflation: Number(e.target.value) / 100 })} className="input-field" />
        </Field>

        <Field label={<Tooltip text="What fraction of your monthly expenses is healthcare / medical">Medical Expense Share (%)</Tooltip>} htmlFor="medShare">
          <input id="medShare" type="number" min={0} max={100} step={1} value={Math.round(expenses.medicalExpenseRatio * 100)}
            onChange={e => setExpenses({ medicalExpenseRatio: Number(e.target.value) / 100 })} className="input-field" />
        </Field>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
          One-Time Future Expenses
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add lump-sum expenses like education, wedding, home renovation, travel</p>
        <div className="flex gap-3 flex-wrap mb-4">
          <input placeholder="Label (e.g. Child's college)" value={ote.label}
            onChange={e => setOte(p => ({ ...p, label: e.target.value }))}
            className="input-field flex-1 min-w-0" />
          <input type="number" placeholder={`Amount (${sym})`} value={ote.amount}
            onChange={e => setOte(p => ({ ...p, amount: e.target.value }))}
            className="input-field w-40" />
          <input type="number" placeholder="Your age at event" min={profile.age} max={profile.retirementAge + 5} value={ote.year}
            onChange={e => setOte(p => ({ ...p, year: e.target.value }))}
            className="input-field w-36" />
          <button onClick={addOte} className="btn-secondary whitespace-nowrap">+ Add</button>
        </div>
        {expenses.oneTimeExpenses.length > 0 && (
          <ul className="space-y-2">
            {expenses.oneTimeExpenses.map(e => (
              <li key={e.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{e.label}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mx-4">Age {e.year}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{sym}{Number(e.amount).toLocaleString()}</span>
                <button onClick={() => removeOneTimeExpense(e.id)}
                  className="ml-3 text-red-400 hover:text-red-600 dark:hover:text-red-400 text-lg leading-none" aria-label="Remove expense">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={onNext} className="btn-primary">Continue → Scenarios</button>
      </div>
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
