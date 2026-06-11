import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { fmtMoney, COUNTRIES } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Btn, Card, Field, NumberInput } from '../../components/ui.jsx'

const SUGGESTIONS = [
  { name: '🎓 University for a child', yearsAhead: 10, costFactor: 1.0 },
  { name: '✈️ Trip of a lifetime', yearsAhead: 5, costFactor: 0.3 },
  { name: '🏠 Home renovation', yearsAhead: 3, costFactor: 0.8 },
]

export default function Goals() {
  const { goals, addGoal, removeGoal, profile } = useStore()
  const c = COUNTRIES[profile.country]
  const [name, setName] = useState('')
  const [age, setAge] = useState(profile.age + 5)
  const [cost, setCost] = useState(Math.round(c.lifestyles.basic / 2))
  const symbol = fmtMoney(0, profile.country).replace(/[\d.,\s]/g, '')

  const add = () => {
    if (!name.trim() || cost <= 0) return
    addGoal({ name: name.trim(), age, cost })
    setName('')
  }

  return (
    <WizardShell title="Big future expenses" subtitle="One-off costs before or during retirement — optional, but they change the picture." nextLabel={goals.length ? 'Continue' : 'Skip / Continue'}>
      <div className="mb-6 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.name}
            onClick={() => addGoal({ name: s.name, age: profile.age + s.yearsAhead, cost: Math.round(c.lifestyles.comfortable * s.costFactor) })}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-emerald-500"
          >
            + {s.name}
          </button>
        ))}
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="What is it?">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daughter's wedding"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500"
            />
          </Field>
          <Field label="At your age">
            <NumberInput value={age} onChange={setAge} min={profile.age} max={90} />
          </Field>
          <Field label="Cost (today's money)">
            <NumberInput value={cost} onChange={setCost} prefix={symbol} step={1000} min={0} />
          </Field>
          <div className="flex items-end">
            <Btn onClick={add} className="w-full">Add goal</Btn>
          </div>
        </div>
      </Card>

      {goals.length > 0 && (
        <div className="mt-6 space-y-3">
          {[...goals].sort((a, b) => a.age - b.age).map((g) => (
            <Card key={g.id} className="flex items-center justify-between !py-3">
              <div>
                <span className="font-semibold">{g.name}</span>
                <span className="ml-3 text-sm text-slate-400">at age {g.age}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-emerald-700">{fmtMoney(g.cost, profile.country, { compact: true })}</span>
                <button onClick={() => removeGoal(g.id)} className="text-slate-400 hover:text-red-500">✕</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </WizardShell>
  )
}
