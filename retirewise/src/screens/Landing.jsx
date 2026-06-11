import { useStore } from '../store/useStore.js'
import { COUNTRIES } from '../data/countries.js'
import { Btn, Card } from '../components/ui.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'

export default function Landing() {
  const { go, setProfile, profile, quick } = useStore()
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
            No sign-up needed
          </span>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight text-slate-900">
            Will I have enough money to{' '}
            <span className="text-emerald-600">retire comfortably?</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-500">
            Get your Retirement Safety Score in under 2 minutes. Model scenarios, stress-test
            risks and get a personalised action plan — completely anonymously.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn onClick={() => go('quick')} className="!px-7 !py-3 !text-base">
              Check my retirement →
            </Btn>
            <Btn variant="secondary" onClick={() => go('profile')} className="!px-7 !py-3 !text-base">
              Full assessment
            </Btn>
          </div>

          <div className="mt-10">
            <p className="mb-2 text-sm font-medium text-slate-500">Built for your country:</p>
            <div className="flex gap-3">
              {Object.values(COUNTRIES).map((c) => (
                <Card
                  key={c.code}
                  onClick={() => setProfile({ country: c.code })}
                  selected={profile.country === c.code}
                  className="!p-3 text-center"
                >
                  <div className="text-2xl">{c.flag}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">{c.name}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card className="!p-8">
          <h3 className="text-center text-sm font-bold uppercase tracking-wide text-slate-400">
            Retirement Safety Score
          </h3>
          <div className="mt-4 flex justify-center">
            <ScoreGauge score={quick?.score ?? 72} />
          </div>
          <div className="mt-6 space-y-2 text-sm text-slate-600">
            {[
              ['🛡️', 'Stress-tested against longevity, inflation and market risk'],
              ['🔬', 'Compare retiring at 55, 60 or 65 side by side'],
              ['🤖', 'AI coach answers your "what if" questions'],
              ['🎯', 'Ranked actions to improve your score'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-start gap-2">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
          {!quick && (
            <p className="mt-5 text-center text-xs text-slate-400">
              Example score — run the quick check to see yours.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
