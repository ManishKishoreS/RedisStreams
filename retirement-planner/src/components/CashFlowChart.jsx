import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (v >= 1e7) return `${sym}${(v / 1e7).toFixed(1)}Cr`
  if (v >= 1e5) return `${sym}${(v / 1e5).toFixed(1)}L`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`
  if (v >= 1000) return `${sym}${(v / 1000).toFixed(0)}K`
  return `${sym}${Math.round(v)}`
}

export function CashFlowChart() {
  const { results, profile } = useStore()
  if (!results) return null
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  const data = (results.decumulation || []).slice(0, 30).map(d => ({
    age: profile.retirementAge + (d.year || 0),
    withdrawal: Math.round(d.withdrawal),
    interest: Math.round(d.corpus * 0.07 || 0),
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Retirement Cash Flows</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -4 }} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => fmt(v, sym)} tick={{ fontSize: 11 }} width={60} />
          <Tooltip formatter={(v, n) => [fmt(v, sym), n === 'withdrawal' ? 'Annual Expenses' : 'Portfolio Return']} labelFormatter={l => `Age ${l}`} />
          <Legend verticalAlign="top" />
          <Bar dataKey="interest" name="Portfolio Return" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withdrawal" name="Annual Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
