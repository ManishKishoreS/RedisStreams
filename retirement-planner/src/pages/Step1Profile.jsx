import { useStore } from '../store/useStore.js'
import { LIFE_EXPECTANCY, COUNTRY_NAMES } from '../data/defaults.js'

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: '₹', desc: 'High-growth market' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: '$', desc: '401(k) & IRA benefits' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: '£', desc: 'ISA tax advantages' },
]

export function Step1Profile({ onNext }) {
  const { profile, setProfile, updateCountry } = useStore()

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-3">
          Plan Your Perfect Retirement
        </h1>
        <p className="text-slate-400 text-base max-w-lg mx-auto">
          Tell us about yourself to build a personalised retirement plan with real projections.
        </p>
      </div>

      {/* Country selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">Select Your Country</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => updateCountry(c.code)}
              className={`rounded-xl border p-4 text-left transition-all duration-200
                ${profile.country === c.code
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{c.flag}</span>
                <span className={`font-semibold text-sm ${profile.country === c.code ? 'text-indigo-300' : 'text-white'}`}>
                  {c.name}
                </span>
                {profile.country === c.code && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Age */}
        <Field label="Your Current Age" htmlFor="age">
          <AgeInput
            id="age"
            value={profile.age}
            min={18}
            max={80}
            onChange={v => setProfile({ age: v })}
          />
        </Field>

        {/* Retirement Age */}
        <Field label="Planned Retirement Age" htmlFor="retAge" hint="When you plan to stop working full-time">
          <AgeInput
            id="retAge"
            value={profile.retirementAge}
            min={45}
            max={80}
            onChange={v => setProfile({ retirementAge: v })}
          />
        </Field>

        {/* Gender */}
        <Field label="Gender" htmlFor="gender">
          <div className="flex gap-2">
            {['male', 'female', 'other'].map(g => (
              <button
                key={g}
                onClick={() => setProfile({ gender: g })}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all border
                  ${profile.gender === g
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>

        {/* Marital Status */}
        <Field label="Marital Status" htmlFor="marital">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setProfile({ maritalStatus: opt.value })}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border
                  ${profile.maritalStatus === opt.value
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Spouse age - conditional */}
        {profile.maritalStatus === 'married' && (
          <Field label="Spouse's Age" htmlFor="spouseAge">
            <AgeInput
              id="spouseAge"
              value={profile.spouseAge}
              min={18}
              max={80}
              onChange={v => setProfile({ spouseAge: v })}
            />
          </Field>
        )}

        {/* Life expectancy */}
        <Field
          label="Life Expectancy"
          htmlFor="lifeExp"
          hint={`Default for ${COUNTRY_NAMES[profile.country]}: ${LIFE_EXPECTANCY[profile.country]} years`}
        >
          <AgeInput
            id="lifeExp"
            value={profile.lifeExpectancy}
            min={60}
            max={110}
            onChange={v => setProfile({ lifeExpectancy: v })}
          />
        </Field>
      </div>

      {/* Quick summary */}
      <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Summary</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-slate-400">
            Years to retirement: <span className="text-white font-semibold">{Math.max(0, profile.retirementAge - profile.age)}</span>
          </span>
          <span className="text-slate-400">
            Retirement duration: <span className="text-white font-semibold">{Math.max(0, profile.lifeExpectancy - profile.retirementAge)} years</span>
          </span>
          <span className="text-slate-400">
            Country: <span className="text-white font-semibold">{COUNTRY_NAMES[profile.country]}</span>
          </span>
        </div>
      </div>

      <div>
        <button onClick={onNext} className="btn-primary w-full sm:w-auto text-base px-8">
          Continue — Income &amp; Assets →
        </button>
      </div>
    </div>
  )
}

function AgeInput({ id, value, min, max, onChange }) {
  return (
    <div className="flex items-center gap-0 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-lg"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 bg-transparent text-white text-center font-semibold text-base py-3 focus:outline-none tabular-nums"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-lg"
      >
        +
      </button>
    </div>
  )
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">{label}</label>
      {hint && <p className="text-xs text-slate-500 -mt-0.5">{hint}</p>}
      {children}
    </div>
  )
}
