import { usePlan } from './Results.jsx'
import { Card, Badge, impactColor } from '../components/ui.jsx'

const EFFORT_COLOR = { Low: 'emerald', Medium: 'amber', High: 'red' }

export default function Recommendations() {
  const { recs, base } = usePlan()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">🎯 Your action plan</h1>
      <p className="mt-1 text-slate-500">
        Ranked by real impact on your Safety Score (currently {base.score}/100), then by how easy they are.
      </p>

      <div className="mt-8 space-y-4">
        {recs.map((r, i) => (
          <Card key={r.key} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-extrabold text-white">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900">{r.title}</h3>
                {r.delta > 0 && (
                  <span className="text-sm font-bold text-emerald-600">+{r.delta} pts</span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{r.body}</p>
              <div className="mt-2.5 flex gap-2">
                <Badge color={impactColor[r.impact]}>{r.impact} impact</Badge>
                <Badge color={EFFORT_COLOR[r.effort]}>{r.effort} effort</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
