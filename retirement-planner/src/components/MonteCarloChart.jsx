import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (v >= 1e7) return `${sym}${(v / 1e7).toFixed(1)}Cr`
  if (v >= 1e5) return `${sym}${(v / 1e5).toFixed(1)}L`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`
  if (v >= 1000) return `${sym}${(v / 1000).toFixed(0)}K`
  return `${sym}${Math.round(v)}`
}

export function MonteCarloChart() {
  const { results, profile } = useStore()
  if (!results?.monteCarlo) return null
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'
  const { percentiles, totalYears } = results.monteCarlo

  const data = Array.from({ length: totalYears }, (_, i) => ({
    year: i + 1,
    age: profile.age + i,
    p10: percentiles.p10[i] || 0,
    p50: percentiles.p50[i] || 0,
    p90: percentiles.p90[i] || 0,
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Monte Carlo Fan Chart</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">1,000 simulations — showing 10th, 50th and 90th percentile outcomes</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="p90grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id="p50grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -4 }} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => fmt(v, sym)} tick={{ fontSize: 11 }} width={60} />
          <Tooltip formatter={(v, n) => [fmt(v, sym), n]} labelFormatter={l => `Age ${l}`} />
          <Legend verticalAlign="top" />
          <Area type="monotone" dataKey="p90" stroke="#22c55e" fill="url(#p90grad)" name="90th Pct (Best)" />
          <Area type="monotone" dataKey="p50" stroke="#6366f1" fill="url(#p50grad)" name="50th Pct (Median)" />
          <Area type="monotone" dataKey="p10" stroke="#f87171" fill="none" strokeDasharray="4 3" name="10th Pct (Worst)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
