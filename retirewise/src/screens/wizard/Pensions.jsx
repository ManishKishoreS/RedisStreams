import { useStore } from '../../store/useStore.js'
import { COUNTRIES, fmtMoney } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Card, Field, NumberInput, SliderField } from '../../components/ui.jsx'

// Country-specific retirement accounts: State Pension/SIPP for UK,
// Social Security/401k for US, EPF/NPS for India.
export default function Pensions() {
  const { pensions, setPension, setStatePensionFraction, profile } = useStore()
  const c = COUNTRIES[profile.country]
  const symbol = fmtMoney(0, profile.country).replace(/[\d.,\s]/g, '')

  return (
    <WizardShell title="Your retirement accounts" subtitle={`Tailored to ${c.flag} ${c.name}.`}>
      <div className="grid gap-6 md:grid-cols-2">
        {c.pensionAccounts.map((acct) => (
          <Card key={acct.key}>
            <h3 className="font-bold text-slate-800">{acct.label}</h3>
            <p className="mb-4 text-xs text-slate-400">{acct.hint}</p>
            <div className="space-y-4">
              <Field label="Current balance">
                <NumberInput
                  value={pensions.pots[acct.key] ?? 0}
                  onChange={(v) => setPension(acct.key, 'pots', v)}
                  prefix={symbol}
                  step={1000}
                  min={0}
                />
              </Field>
              <Field label="Monthly contribution (you + employer)">
                <NumberInput
                  value={pensions.contribs[acct.key] ?? 0}
                  onChange={(v) => setPension(acct.key, 'contribs', v)}
                  prefix={symbol}
                  step={50}
                  min={0}
                />
              </Field>
            </div>
          </Card>
        ))}
        <Card className="md:col-span-2">
          <h3 className="font-bold text-slate-800">{c.statePensionName}</h3>
          <p className="mb-4 text-xs text-slate-400">
            Full entitlement is about {fmtMoney(c.statePensionAnnual, profile.country)}/yr from age {c.statePensionAge}.
          </p>
          <SliderField
            label="Expected entitlement"
            value={pensions.statePensionFraction}
            onChange={setStatePensionFraction}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}% · ${fmtMoney((c.statePensionAnnual * v) / 100, profile.country, { compact: true })}/yr`}
          />
        </Card>
      </div>
    </WizardShell>
  )
}
