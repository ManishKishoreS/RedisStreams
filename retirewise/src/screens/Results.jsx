import { useEffect, useMemo } from 'react'
import { useStore, buildInputs } from '../store/useStore.js'
import { COUNTRIES, fmtMoney } from '../data/countries.js'
import { evaluate, sustainableSpend } from '../engine/projection.js'
import { assessRisks } from '../engine/risks.js'
import { buildRecommendations } from '../engine/recommendations.js'
import { Btn, Card, Badge, levelColor, impactColor } from '../components/ui.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'
import ProjectionChart from '../components/ProjectionChart.jsx'

export function usePlan() {
  const state = useStore()
  return useMemo(() => {
    const inp = buildInputs(state)
    const c = COUNTRIES[state.profile.country]
    const base = evaluate(inp)
    const risks = assessRisks(inp, base.score)
    const recs = buildRecommendations(inp, base.score, {
      country: state.profile.country,
      lifestyle: state.lifestyle,
      lifestyles: c.lifestyles,
      cash: state.assets.cash,
      liabilities: state.assets.liabilities,
      statePensionFraction: state.pensions.statePensionFraction,
    })
    return { inp, base, risks, recs, c, country: state.profile.country }
  }, [
    state.profile, state.income, state.assets, state.pensions, state.savingsRate,
    state.lifestyle, state.customExpenses, state.goals, state.riskProfile,
  ])
}

export default function Results() {
  const { go, account, recordScore } = useStore()
  const { inp, base, risks, recs, country } = usePlan()
  const safeSpend = useMemo(() => sustainableSpend(inp), [inp])

  useEffect(() => {
    recordScore(base.score)
  }, [base.score, recordScore])

  const lastsUntil = base.proj.depletionAge
  const money = (v) => fmtMoney(v, country, { compact: true })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Your retirement outlook</h1>
      <p className="mt-1 text-slate-500">{base.classification.blurb}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center !p-8">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Retirement Safety Score</h3>
          <ScoreGauge score={base.score} size={220} />
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">Savings over your lifetime</h3>
          <ProjectionChart rows={base.proj.rows} retirementAge={inp.retirementAge} country={country} />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Pot at retirement', money(base.proj.potAtRetirement)],
          ['Money lasts until', lastsUntil ? `Age ${lastsUntil}` : `Beyond ${base.proj.horizon} ✓`],
          ['Sustainable spending', `${money(safeSpend)}/yr`],
          ['Planned spending', `${money(inp.annualExpenses)}/yr`],
        ].map(([label, value]) => (
          <Card key={label} className="!py-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold text-slate-900">Risk analysis</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {risks.map((r) => (
          <Card key={r.key} className="!py-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{r.name}</span>
              <Badge color={levelColor[r.level]}>{r.level}</Badge>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">{r.detail}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold text-slate-900">Top actions to improve your score</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {recs.slice(0, 3).map((r) => (
          <Card key={r.key} className="!py-4">
            <div className="flex items-center justify-between">
              <Badge color={impactColor[r.impact]}>{r.impact} impact</Badge>
              {r.delta > 0 && <span className="text-sm font-bold text-emerald-600">+{r.delta} pts</span>}
            </div>
            <p className="mt-2 font-semibold">{r.title}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Btn onClick={() => go('coach')}>Ask the AI coach</Btn>
        <Btn variant="secondary" onClick={() => go('scenarios')}>Compare scenarios</Btn>
        <Btn variant="secondary" onClick={() => go('recommendations')}>Full action plan</Btn>
        {!account && (
          <Btn variant="ghost" onClick={() => go('register')}>Save my plan →</Btn>
        )}
      </div>
    </div>
  )
}
