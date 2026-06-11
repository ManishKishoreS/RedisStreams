import { useStore } from '../../store/useStore.js'
import { COUNTRIES, fmtMoney } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Card, Field, NumberInput, SliderField } from '../../components/ui.jsx'

export default function Income() {
  const { income, setIncome, savingsRate, setSavingsRate, profile } = useStore()
  const c = COUNTRIES[profile.country]
  const symbol = fmtMoney(0, profile.country).replace(/[\d.,\s]/g, '')

  return (
    <WizardShell title="Income & employment" subtitle="What you earn today drives what you can put away for tomorrow.">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Field label="Annual salary (gross)">
            <NumberInput value={income.salary} onChange={(salary) => setIncome({ salary })} prefix={symbol} step={1000} min={0} />
          </Field>
        </Card>
        <Card>
          <SliderField
            label="Expected salary growth"
            value={income.growth}
            onChange={(growth) => setIncome({ growth })}
            min={0}
            max={8}
            step={0.5}
            format={(v) => `${v}%/yr`}
          />
        </Card>
        <Card>
          <SliderField
            label="Savings rate (outside pensions)"
            value={savingsRate}
            onChange={setSavingsRate}
            min={0}
            max={50}
            format={(v) => `${v}%`}
          />
          <p className="mt-2 text-xs text-slate-400">
            ≈ {fmtMoney((income.salary * savingsRate) / 100 / 12, profile.country)} per month into savings & investments
          </p>
        </Card>
        <Card>
          <Field
            label="Other retirement income (annual)"
            hint={`Rental income, part-time work, annuities — anything beyond your ${c.statePensionName}`}
          >
            <NumberInput
              value={income.otherRetirementIncome}
              onChange={(otherRetirementIncome) => setIncome({ otherRetirementIncome })}
              prefix={symbol}
              step={500}
              min={0}
            />
          </Field>
        </Card>
      </div>
    </WizardShell>
  )
}
