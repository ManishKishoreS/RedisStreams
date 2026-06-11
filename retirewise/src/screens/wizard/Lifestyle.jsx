import { useStore } from '../../store/useStore.js'
import { COUNTRIES, fmtMoney } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Card, SliderField } from '../../components/ui.jsx'

const LIFESTYLES = [
  { key: 'basic', icon: '🏡', label: 'Basic', desc: 'Essentials covered, simple pleasures, the occasional treat.' },
  { key: 'comfortable', icon: '🌅', label: 'Comfortable', desc: 'Regular holidays, hobbies, eating out, helping family.' },
  { key: 'luxury', icon: '🛥️', label: 'Luxury', desc: 'Long-haul travel, premium everything, generous gifting.' },
]

export default function Lifestyle() {
  const { lifestyle, setLifestyle, customExpenses, setCustomExpenses, profile } = useStore()
  const c = COUNTRIES[profile.country]
  const selected = customExpenses ?? c.lifestyles[lifestyle]

  return (
    <WizardShell title="What does your retirement look like?" subtitle="Pick a lifestyle — you can fine-tune the number below.">
      <div className="grid gap-6 md:grid-cols-3">
        {LIFESTYLES.map(({ key, icon, label, desc }) => (
          <Card key={key} onClick={() => setLifestyle(key)} selected={lifestyle === key && customExpenses === null} className="text-center">
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-2 text-lg font-bold">{label}</h3>
            <p className="mt-1 text-xs text-slate-400">{desc}</p>
            <p className="mt-3 text-xl font-extrabold text-emerald-700">
              {fmtMoney(c.lifestyles[key], profile.country, { compact: true })}
              <span className="text-xs font-medium text-slate-400">/yr</span>
            </p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <SliderField
          label="Annual retirement spending (today's money)"
          value={selected}
          onChange={setCustomExpenses}
          min={Math.round(c.lifestyles.basic * 0.5)}
          max={Math.round(c.lifestyles.luxury * 1.5)}
          step={Math.round(c.lifestyles.basic / 36)}
          format={(v) => fmtMoney(v, profile.country, { compact: true })}
        />
      </Card>
    </WizardShell>
  )
}
