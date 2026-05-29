import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (!v || v === 0) return `${sym}0`
  if (v >= 1e7) return `${sym}${(v / 1e7).toFixed(1)}Cr`
  if (v >= 1e5) return `${sym}${(v / 1e5).toFixed(1)}L`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${sym}${(v / 1e3).toFixed(0)}K`
  return `${sym}${Math.round(v)}`
}

export function NetWorthChart() {
  const { results, profile } = useStore()
  if (!results) return null
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  const accData = (results.accumulation || []).map(row => ({
    age: row.age,
    corpus: Math.round(row.corpus),
  }))

  const decData = (results.decumulation || []).map(row => ({
    age: profile.retirementAge + row.year,
    corpus: Math.round(row.corpus),
  }))

  const data = [...accData, ...decData]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Net Worth Projection</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Corpus across accumulation and decumulation phases</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -4 }} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => fmt(v, sym)} tick={{ fontSize: 11 }} width={60} />
          <Tooltip
            formatter={(val) => [fmt(val, sym), 'Corpus']}
            labelFormatter={v => `Age ${v}`}
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Legend verticalAlign="top" />
          <ReferenceLine x={profile.retirementAge} stroke="#f59e0b" strokeDasharray="4 2"
            label={{ value: 'Retirement', position: 'top', fontSize: 11, fill: '#f59e0b' }} />
          {results.requiredCorpus > 0 && (
            <ReferenceLine y={results.requiredCorpus} stroke="#ef4444" strokeDasharray="4 2"
              label={{ value: 'Required', position: 'insideRight', fontSize: 11, fill: '#ef4444' }} />
          )}
          <Area type="monotone" dataKey="corpus" stroke="#6366f1" fill="url(#corpusGrad)" strokeWidth={2} dot={false} name="Corpus" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
