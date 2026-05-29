import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
          <span style={{ color: p.fill }}>{p.name === 'interest' ? 'Portfolio Return' : 'Annual Expenses'}</span>
          <span className="font-semibold text-white tabular-nums">{fmt(p.value, sym)}</span>
        </div>
      ))}
    </div>
  )
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
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-white">Retirement Cash Flows</h3>
        <p className="text-xs text-slate-500 mt-0.5">Annual portfolio returns vs. withdrawal spending in retirement</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            formatter={(value, entry) => (
              <span className="text-xs text-slate-400">{entry.payload.name === 'interest' ? 'Portfolio Return' : 'Annual Expenses'}</span>
            )}
            wrapperStyle={{ paddingTop: 8 }}
          />
          <Bar dataKey="interest" name="interest" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withdrawal" name="withdrawal" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
