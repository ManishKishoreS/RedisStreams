import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { fmtMoney } from '../data/countries.js'
import { evaluate, sustainableSpend } from '../engine/projection.js'
import { usePlan } from './Results.jsx'
import { Card, SliderField } from '../components/ui.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'

// Compare three retirement ages side by side, with shared what-if sliders
// for contributions, returns and inflation.
export default function ScenarioLab() {
  const { profile } = useStore()
  const { inp, country } = usePlan()
  const minAge = profile.age + 1
  const [ages, setAges] = useState(() =>
    [55, 60, 65].map((a) => Math.max(a, minAge)).map((a, i, arr) => (i > 0 && a <= arr[i - 1] ? arr[i - 1] + 1 : a))
  )
  const [extraMonthly, setExtraMonthly] = useState(0)
  const [returnShift, setReturnShift] = useState(0)
  const [inflationShift, setInflationShift] = useState(0)

  const scenarios = useMemo(
    () =>
      ages.map((age) => {
        const sInp = {
          ...inp,
          retirementAge: age,
          annualContribution: inp.annualContribution + extraMonthly * 12,
          preReturn: inp.preReturn + returnShift,
          postReturn: inp.postReturn + returnShift,
          inflation: Math.max(0, inp.inflation + inflationShift),
        }
        const r = evaluate(sInp)
        return { age, ...r, safeSpend: sustainableSpend(sInp) }
      }),
    [ages, inp, extraMonthly, returnShift, inflationShift]
  )

  const money = (v) => fmtMoney(v, country, { compact: true })
  const best = Math.max(...scenarios.map((s) => s.score))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">🔬 Scenario Lab</h1>
      <p className="mt-1 text-slate-500">Compare retiring at different ages and stress-test your assumptions.</p>

      <Card className="mt-6">
        <div className="grid gap-6 md:grid-cols-3">
          <SliderField label="Extra monthly saving" value={extraMonthly} onChange={setExtraMonthly} min={0} max={Math.round(inp.salary / 12 / 3)} step={10} format={money} />
          <SliderField label="Investment returns" value={returnShift} onChange={setReturnShift} min={-3} max={3} step={0.5} format={(v) => `${v >= 0 ? '+' : ''}${v}%`} />
          <SliderField label="Inflation" value={inflationShift} onChange={setInflationShift} min={-2} max={4} step={0.5} format={(v) => `${v >= 0 ? '+' : ''}${v}%`} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {scenarios.map((s, i) => (
          <Card key={i} className={`text-center ${s.score === best ? 'ring-2 ring-emerald-400' : ''}`}>
            {s.score === best && (
              <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                Strongest plan
              </span>
            )}
            <div className="mb-2">
              <SliderField
                label="Retire at"
                value={s.age}
                onChange={(v) => setAges(ages.map((a, j) => (j === i ? Math.max(minAge, v) : a)))}
                min={Math.max(50, minAge)}
                max={75}
                format={(v) => `${v}`}
              />
            </div>
            <div className="flex justify-center">
              <ScoreGauge score={s.score} size={160} />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Pot at retirement</dt>
                <dd className="font-bold">{money(s.proj.potAtRetirement)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Money lasts until</dt>
                <dd className="font-bold">{s.proj.depletionAge ? `Age ${s.proj.depletionAge}` : 'Whole plan ✓'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Safe spending</dt>
                <dd className="font-bold">{money(s.safeSpend)}/yr</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  )
}
