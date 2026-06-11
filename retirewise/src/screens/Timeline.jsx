import { useStore } from '../store/useStore.js'
import { COUNTRIES, fmtMoney } from '../data/countries.js'
import { usePlan } from './Results.jsx'
import { Card } from '../components/ui.jsx'

// Vertical life timeline: now, goals, retirement, state pension,
// depletion (if any) and end of plan.
export default function Timeline() {
  const { profile, goals } = useStore()
  const { inp, base, country } = usePlan()
  const c = COUNTRIES[country]
  const money = (v) => fmtMoney(v, country, { compact: true })

  const events = [
    { age: profile.age, icon: '📍', title: 'Today', detail: `Savings & pensions: ${money(inp.liquidAssets)}` },
    ...goals.map((g) => ({ age: g.age, icon: '🎯', title: g.name, detail: `${money(g.cost)} (today's money)` })),
    { age: inp.retirementAge, icon: '🎉', title: 'You retire', detail: `Projected pot: ${money(base.proj.potAtRetirement)}` },
    { age: c.statePensionAge, icon: '🏛️', title: `${c.statePensionName} starts`, detail: `${money(inp.statePensionAnnual)}/yr (today's money)` },
    base.proj.depletionAge && {
      age: base.proj.depletionAge,
      icon: '⚠️',
      title: 'Savings projected to run out',
      detail: 'See your action plan to push this later.',
      warn: true,
    },
    { age: c.lifeExpectancy, icon: '🌳', title: `Life expectancy (${c.name})`, detail: `Plan funded to age ${base.proj.horizon}` },
  ]
    .filter(Boolean)
    .sort((a, b) => a.age - b.age)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Your life timeline</h1>
      <p className="mt-1 text-slate-500">The milestones your plan is built around.</p>

      <div className="relative mt-10 ml-4 border-l-2 border-slate-200 pl-8">
        {events.map((e, i) => (
          <div key={i} className="relative mb-8">
            <span
              className={`absolute -left-[49px] flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                e.warn ? 'bg-red-100' : 'bg-emerald-100'
              }`}
            >
              {e.icon}
            </span>
            <Card className={`!py-4 ${e.warn ? 'border-red-200 bg-red-50' : ''}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900">{e.title}</span>
                <span className="text-sm font-bold text-emerald-700">Age {e.age}</span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">{e.detail}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
