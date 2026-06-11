import { useStore } from '../../store/useStore.js'
import { COUNTRIES } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Card, Field, NumberInput, SliderField } from '../../components/ui.jsx'

export default function Profile() {
  const { profile, setProfile } = useStore()
  return (
    <WizardShell title="Tell us about yourself" subtitle="We tailor pensions, taxes and life expectancy to your country.">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <p className="mb-3 text-sm font-medium text-slate-700">Where do you live?</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(COUNTRIES).map((c) => (
              <Card key={c.code} onClick={() => setProfile({ country: c.code })} selected={profile.country === c.code} className="text-center">
                <div className="text-3xl">{c.flag}</div>
                <div className="mt-1 text-sm font-semibold">{c.name}</div>
              </Card>
            ))}
          </div>
        </Card>
        <Card>
          <SliderField label="Your age" value={profile.age} onChange={(age) => setProfile({ age })} min={18} max={75} format={(v) => `${v}`} />
        </Card>
        <Card>
          <SliderField
            label="Target retirement age"
            value={profile.retirementAge}
            onChange={(retirementAge) => setProfile({ retirementAge })}
            min={Math.max(profile.age + 1, 50)}
            max={75}
            format={(v) => `${v}`}
          />
        </Card>
        <Card>
          <Field label="Marital status">
            <select
              value={profile.maritalStatus}
              onChange={(e) => setProfile({ maritalStatus: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500"
            >
              <option value="single">Single</option>
              <option value="married">Married / partnered</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </Field>
        </Card>
        <Card>
          <Field label="Dependents" hint="Children or others who rely on your income">
            <NumberInput value={profile.dependents} onChange={(dependents) => setProfile({ dependents })} min={0} max={10} />
          </Field>
        </Card>
      </div>
    </WizardShell>
  )
}
