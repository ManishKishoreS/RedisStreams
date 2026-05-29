import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
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
          <span className="text-slate-400">{p.name}</span>
          <span className="font-semibold text-white tabular-nums">{fmt(p.value, sym)}</span>
        </div>
      ))}
    </div>
  )
}

export function NetWorthChart() {
  const { results, profile } = useStore()
  if (!results) return null
  const sym = CURRENCY_SYMBOLS[profile.retireCountry || profile.workCountry || profile.country] || '₹'
  const retirementAge = results.retirementAge || profile.retirementAge || 60

  const accData = (results.accumulation || []).map(row => ({
    age: row.age,
    corpus: Math.round(row.corpus),
  }))

  const decData = (results.decumulation || []).map(row => ({
    age: retirementAge + row.year,
    corpus: Math.round(row.corpus),
  }))

  const data = [...accData, ...decData]

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-white">Net Worth Timeline</h3>
        <p className="text-xs text-slate-500 mt-0.5">Corpus across accumulation and decumulation phases</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
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
          <ReferenceLine
            x={retirementAge}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: 'Retirement', position: 'top', fontSize: 10, fill: '#f59e0b' }}
          />
          {results.requiredCorpus > 0 && (
            <ReferenceLine
              y={results.requiredCorpus}
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: 'Required', position: 'insideRight', fontSize: 10, fill: '#ef4444' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="corpus"
            stroke="#6366f1"
            fill="url(#corpusGrad)"
            strokeWidth={2}
            dot={false}
            name="Corpus"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
