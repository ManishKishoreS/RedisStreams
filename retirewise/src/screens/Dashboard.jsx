import { useEffect, useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import { fmtMoney } from '../data/countries.js'
import { sustainableSpend } from '../engine/projection.js'
import { usePlan } from './Results.jsx'
import { Btn, Card, Badge, impactColor } from '../components/ui.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'
import ProjectionChart from '../components/ProjectionChart.jsx'

export default function Dashboard() {
  const { go, account, assets, history, recordScore } = useStore()
  const { inp, base, risks, recs, country } = usePlan()
  const money = (v) => fmtMoney(v, country, { compact: true })
  const safeSpend = useMemo(() => sustainableSpend(inp), [inp])
  const netWorth = assets.cash + assets.investments + assets.property - assets.liabilities + (inp.liquidAssets - assets.cash - assets.investments)

  useEffect(() => {
    recordScore(base.score)
  }, [base.score, recordScore])

  const prev = history.length > 1 ? history.at(-2) : null
  const delta = prev ? base.score - prev.score : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {account ? `Welcome back, ${account.name}` : 'Your dashboard'}
          </h1>
          <p className="mt-1 text-slate-500">Everything about your retirement at a glance.</p>
        </div>
        {delta !== null && (
          <Badge color={delta >= 0 ? 'emerald' : 'red'}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts since last visit
          </Badge>
        )}
      </div>

      {delta !== null && delta < -5 && (
        <Card className="mt-5 border-red-200 bg-red-50 !py-3 text-sm font-medium text-red-700">
          ⚠️ Your Safety Score has dropped {Math.abs(delta)} points since your last visit. Review your action plan.
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Safety Score</p>
          <ScoreGauge score={base.score} size={170} />
        </Card>
        <div className="grid gap-4 lg:col-span-3 lg:grid-cols-3">
          {[
            ['Net worth', money(netWorth)],
            ['Pot at retirement', money(base.proj.potAtRetirement)],
            ['Safe spending', `${money(safeSpend)}/yr`],
            ['Retiring at', `${inp.retirementAge}`],
            ['Money lasts until', base.proj.depletionAge ? `Age ${base.proj.depletionAge}` : 'Whole plan ✓'],
            ['Highest risk', risks[0]?.name.replace(' risk', '') ?? '—'],
          ].map(([label, value]) => (
            <Card key={label} className="flex flex-col justify-center !py-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">Wealth forecast</h3>
          <ProjectionChart rows={base.proj.rows} retirementAge={inp.retirementAge} country={country} height={250} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Top actions</h3>
          <div className="space-y-3">
            {recs.slice(0, 3).map((r) => (
              <div key={r.key} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <Badge color={impactColor[r.impact]}>{r.impact}</Badge>
                  {r.delta > 0 && <span className="text-xs font-bold text-emerald-600">+{r.delta} pts</span>}
                </div>
                <p className="mt-1.5 text-sm font-semibold">{r.title}</p>
              </div>
            ))}
          </div>
          <Btn variant="secondary" onClick={() => go('recommendations')} className="mt-4 w-full">
            Full action plan →
          </Btn>
        </Card>
      </div>

      {account && history.length > 1 && (
        <Card className="mt-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Score history</h3>
          <div className="flex flex-wrap gap-2">
            {history.slice(-12).map((h) => (
              <div key={h.date} className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                <p className="text-lg font-extrabold text-slate-900">{h.score}</p>
                <p className="text-[10px] text-slate-400">{h.date}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!account && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900 !text-white">
          <div>
            <p className="font-bold">Track your progress over time</p>
            <p className="text-sm opacity-70">Register free to save your plan and get score-change alerts.</p>
          </div>
          <Btn onClick={() => go('register')}>Create free account</Btn>
        </Card>
      )}
    </div>
  )
}
