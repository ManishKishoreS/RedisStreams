import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { fmtMoney } from '../data/countries.js'

export default function ProjectionChart({ rows, retirementAge, country, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="age" tick={{ fontSize: 12 }} tickFormatter={(a) => `${a}`} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => fmtMoney(v, country, { compact: true })} width={70} />
        <Tooltip
          formatter={(v) => [fmtMoney(v, country), 'Savings']}
          labelFormatter={(a) => `Age ${a}`}
        />
        <ReferenceLine x={retirementAge} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Retire', fontSize: 11, fill: '#b45309', position: 'top' }} />
        <Area type="monotone" dataKey="balance" stroke="#059669" strokeWidth={2.5} fill="url(#balanceFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
