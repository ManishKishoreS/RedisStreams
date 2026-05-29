import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (!v || v === 0) return `${sym}0`
  const abs = Math.abs(v)
  if (abs >= 1e7) return `${sym}${(abs / 1e7).toFixed(1)}Cr`
  if (abs >= 1e6) return `${sym}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e5) return `${sym}${(abs / 1e5).toFixed(1)}L`
  if (abs >= 1e3) return `${sym}${(abs / 1e3).toFixed(0)}K`
  return `${sym}${Math.round(abs)}`
}

const CustomTooltip = ({ active, payload, label, sym }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700 p-3 text-xs shadow-xl" style={{ background: '#1e293b' }}>
      <p className="font-semibold text-slate-300 mb-1.5">Age {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-white tabular-nums">{fmt(p.value, sym)}</span>
        </div>
      ))}
    </div>
  )
}

export function MonteCarloChart() {
  const { results, profile } = useStore()
  if (!results?.monteCarlo) return null
  const sym = CURRENCY_SYMBOLS[profile.retireCountry || profile.workCountry || profile.country] || '₹'
  const { percentiles, totalYears } = results.monteCarlo

  const data = Array.from({ length: totalYears }, (_, i) => ({
    year: i + 1,
    age: profile.age + i,
    p10: percentiles.p10[i] || 0,
    p50: percentiles.p50[i] || 0,
    p90: percentiles.p90[i] || 0,
  }))

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-white">Monte Carlo Fan Chart</h3>
        <p className="text-xs text-slate-500 mt-0.5">1,000 simulations — 10th, 50th and 90th percentile outcomes</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="p90grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id="p50grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            label={{ value: 'Age', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={v => fmt(v, sym)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={65}
          />
          <Tooltip content={<CustomTooltip sym={sym} />} />
          <Legend
            formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
            wrapperStyle={{ paddingTop: 8 }}
          />
          <Area type="monotone" dataKey="p90" stroke="#10b981" fill="url(#p90grad)" strokeWidth={2} name="90th Pct (Best)" dot={false} />
          <Area type="monotone" dataKey="p50" stroke="#6366f1" fill="url(#p50grad)" strokeWidth={2} name="50th Pct (Median)" dot={false} />
          <Area type="monotone" dataKey="p10" stroke="#ef4444" fill="none" strokeDasharray="4 3" strokeWidth={1.5} name="10th Pct (Worst)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
