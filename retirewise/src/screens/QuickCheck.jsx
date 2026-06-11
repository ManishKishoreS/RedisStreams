import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { COUNTRIES, RISK_PROFILES, fmtMoney } from '../data/countries.js'
import { evaluate } from '../engine/projection.js'
import { Btn, Card, SliderField } from '../components/ui.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'

// Fast anonymous assessment: one question per step, instant score at the end.
export default function QuickCheck() {
  const { go, profile, setProfile, setQuick, setIncome, setAssets } = useStore()
  const c = COUNTRIES[profile.country]
  const [step, setStep] = useState(0)
  const [age, setAge] = useState(profile.age)
  const [retireAge, setRetireAge] = useState(profile.retirementAge)
  const [savings, setSavings] = useState(Math.round(c.defaultSalary * 0.8))
  const [monthly, setMonthly] = useState(Math.round(c.defaultSalary / 12 / 10))
  const [result, setResult] = useState(null)

  const money = (v) => fmtMoney(v, profile.country, { compact: true })
  const steps = [
    {
      q: 'How old are you?',
      el: <SliderField label="Your age" value={age} onChange={setAge} min={18} max={75} format={(v) => `${v}`} />,
    },
    {
      q: 'When do you want to retire?',
      el: (
        <SliderField label="Retirement age" value={retireAge} onChange={setRetireAge} min={Math.max(age + 1, 50)} max={75} format={(v) => `${v}`} />
      ),
    },
    {
      q: 'How much have you saved for retirement so far?',
      el: (
        <SliderField label="Total savings & pensions" value={savings} onChange={setSavings} min={0} max={c.defaultSalary * 30} step={c.defaultSalary / 20} format={money} />
      ),
    },
    {
      q: 'How much do you save each month?',
      el: (
        <SliderField label="Monthly saving" value={monthly} onChange={setMonthly} min={0} max={Math.round(c.defaultSalary / 12 / 2)} step={10} format={money} />
      ),
    },
  ]

  const finish = () => {
    const rp = RISK_PROFILES.balanced
    const inp = {
      currentAge: age,
      retirementAge: retireAge,
      lifeExpectancy: c.lifeExpectancy,
      liquidAssets: savings,
      annualContribution: monthly * 12,
      contributionGrowth: 2,
      preReturn: rp.preReturn,
      postReturn: rp.postReturn,
      inflation: c.inflation,
      annualExpenses: c.lifestyles.comfortable,
      statePensionAnnual: c.statePensionAnnual,
      statePensionAge: c.statePensionAge,
    }
    const { score, classification } = evaluate(inp)
    setQuick({ score, label: classification.label })
    setProfile({ age, retirementAge: retireAge })
    setAssets({ cash: Math.round(savings * 0.2), investments: Math.round(savings * 0.8) })
    setIncome({})
    setResult({ score, classification })
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Your quick result</h1>
        <Card className="mt-8 flex flex-col items-center !p-8">
          <ScoreGauge score={result.score} size={240} />
          <p className="mt-5 text-slate-600">{result.classification.blurb}</p>
          <p className="mt-2 text-sm text-slate-400">
            Based on a comfortable lifestyle of {money(c.lifestyles.comfortable)}/yr in {c.name}.
          </p>
        </Card>
        <div className="mt-8 flex justify-center gap-3">
          <Btn onClick={() => go('profile')} className="!px-7 !py-3">
            Get my full plan →
          </Btn>
          <Btn variant="secondary" onClick={() => go('landing')}>Home</Btn>
        </div>
      </div>
    )
  }

  const s = steps[step]
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <p className="text-sm font-semibold text-emerald-600">
        Quick check · {step + 1} of {steps.length}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{s.q}</h1>
      <Card className="mt-8 !p-8">{s.el}</Card>
      <div className="mt-8 flex justify-between">
        <Btn variant="ghost" onClick={() => (step === 0 ? go('landing') : setStep(step - 1))}>
          ← Back
        </Btn>
        {step < steps.length - 1 ? (
          <Btn onClick={() => setStep(step + 1)}>Next →</Btn>
        ) : (
          <Btn onClick={finish}>See my score →</Btn>
        )}
      </div>
    </div>
  )
}
