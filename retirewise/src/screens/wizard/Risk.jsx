import { useStore } from '../../store/useStore.js'
import { RISK_PROFILES } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Card } from '../../components/ui.jsx'

const QUESTIONS = [
  {
    id: 'drop',
    q: 'Your investments fall 20% in a month. What do you do?',
    options: [
      ['Sell everything to stop the losses', 0],
      ['Sit tight and wait it out', 1],
      ['Buy more while prices are low', 2],
    ],
  },
  {
    id: 'priority',
    q: 'Which matters more to you?',
    options: [
      ['Protecting what I already have', 0],
      ['A balance of safety and growth', 1],
      ['Maximising long-term growth', 2],
    ],
  },
  {
    id: 'experience',
    q: 'How experienced are you with investing?',
    options: [
      ['I mostly keep money in savings accounts', 0],
      ['I hold some funds or stocks', 1],
      ['I actively manage a diversified portfolio', 2],
    ],
  },
]

const PROFILE_BY_AVG = ['cautious', 'balanced', 'adventurous']

export default function Risk() {
  const { riskAnswers, setRiskAnswer, riskProfile, setRiskProfile } = useStore()

  const answer = (qid, value) => {
    const answers = { ...riskAnswers, [qid]: value }
    setRiskAnswer(qid, value)
    if (Object.keys(answers).length === QUESTIONS.length) {
      const avg = Object.values(answers).reduce((a, b) => a + b, 0) / QUESTIONS.length
      setRiskProfile(PROFILE_BY_AVG[Math.round(avg)])
    }
  }

  const done = Object.keys(riskAnswers).length === QUESTIONS.length
  const rp = RISK_PROFILES[riskProfile]

  return (
    <WizardShell
      title="How do you feel about risk?"
      subtitle="Your answers set the investment returns we assume in your plan."
      nextLabel="See my results"
      nextDisabled={!done}
    >
      <div className="space-y-6">
        {QUESTIONS.map(({ id, q, options }) => (
          <Card key={id}>
            <p className="mb-3 font-semibold text-slate-800">{q}</p>
            <div className="grid gap-2 md:grid-cols-3">
              {options.map(([label, value]) => (
                <button
                  key={label}
                  onClick={() => answer(id, value)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    riskAnswers[id] === value
                      ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-800'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>
        ))}
        {done && (
          <Card className="bg-emerald-600 text-center !text-white">
            <p className="text-sm uppercase tracking-wide opacity-80">Your investor profile</p>
            <p className="mt-1 text-2xl font-extrabold">{rp.label}</p>
            <p className="mt-1 text-sm opacity-90">
              We'll assume {rp.preReturn}% growth before retirement and {rp.postReturn}% after.
            </p>
          </Card>
        )}
      </div>
    </WizardShell>
  )
}
