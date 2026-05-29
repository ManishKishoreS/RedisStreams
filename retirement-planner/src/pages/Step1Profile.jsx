import { useStore } from '../store/useStore.js'
import { Tooltip } from '../components/Tooltip.jsx'
import { LIFE_EXPECTANCY, COUNTRY_NAMES } from '../data/defaults.js'

export function Step1Profile({ onNext }) {
  const { profile, setProfile, updateCountry } = useStore()

  const handleCountry = (e) => {
    updateCountry(e.target.value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tell us about yourself to personalise your retirement plan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Your Age" htmlFor="age">
          <input id="age" type="number" min={18} max={80} value={profile.age}
            onChange={e => setProfile({ age: Number(e.target.value) })}
            className="input-field" />
        </Field>

        <Field label="Gender" htmlFor="gender">
          <select id="gender" value={profile.gender} onChange={e => setProfile({ gender: e.target.value })} className="input-field">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Country" htmlFor="country">
          <select id="country" value={profile.country} onChange={handleCountry} className="input-field">
            {Object.entries(COUNTRY_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>

        <Field label="Marital Status" htmlFor="marital">
          <select id="marital" value={profile.maritalStatus} onChange={e => setProfile({ maritalStatus: e.target.value })} className="input-field">
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced / Separated</option>
            <option value="widowed">Widowed</option>
          </select>
        </Field>

        {profile.maritalStatus === 'married' && (
          <Field label="Spouse's Age" htmlFor="spouseAge">
            <input id="spouseAge" type="number" min={18} max={80} value={profile.spouseAge}
              onChange={e => setProfile({ spouseAge: Number(e.target.value) })}
              className="input-field" />
          </Field>
        )}

        <Field label={<Tooltip text="The age at which you plan to stop working full-time">Planned Retirement Age</Tooltip>} htmlFor="retAge">
          <input id="retAge" type="number" min={45} max={80} value={profile.retirementAge}
            onChange={e => setProfile({ retirementAge: Number(e.target.value) })}
            className="input-field" />
        </Field>

        <Field label={<Tooltip text={`Default for ${COUNTRY_NAMES[profile.country]}: ${LIFE_EXPECTANCY[profile.country]} years. You can override this.`}>Life Expectancy</Tooltip>} htmlFor="lifeExp">
          <input id="lifeExp" type="number" min={60} max={110} value={profile.lifeExpectancy}
            onChange={e => setProfile({ lifeExpectancy: Number(e.target.value) })}
            className="input-field" />
        </Field>
      </div>

      <div className="pt-2">
        <button onClick={onNext} className="btn-primary w-full sm:w-auto">
          Continue → Income & Assets
        </button>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  )
}
