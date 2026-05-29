import { useStore } from '../store/useStore.js'
import { LIFE_EXPECTANCY_GENDER, COUNTRY_NAMES, DEFAULT_INFLATION } from '../data/defaults.js'

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: '₹', desc: 'EPF, NPS, PPF tax benefits' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: '$', desc: '401(k) & IRA advantages' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: '£', desc: 'ISA & pension benefits' },
]

export function Step1Profile({ onNext }) {
  const { profile, setProfile, setExpenses } = useStore()

  const handleWorkCountry = (code) => {
    setProfile({ workCountry: code, retireCountry: profile.sameCountry ? code : profile.retireCountry })
    setExpenses({
      generalInflation: DEFAULT_INFLATION[code]?.general || 0.06,
      medicalInflation: DEFAULT_INFLATION[code]?.medical || 0.12,
    })
  }

  const handleRetireCountry = (code) => {
    setProfile({ retireCountry: code })
  }

  const handleSameCountry = (same) => {
    setProfile({
      sameCountry: same,
      retireCountry: same ? profile.workCountry : profile.retireCountry,
    })
  }

  const yearsOld = profile.age || 30
  const firstName = profile.firstName || 'there'

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-3">
          Plan Your Perfect Retirement
        </h1>
        <p className="text-slate-400 text-base max-w-lg mx-auto">
          Answer 6 questions and we'll tell you exactly when you can retire — or how to hit your target age.
        </p>
      </div>

      {/* Name */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">👤</span>
          <div>
            <h3 className="font-semibold text-white text-base">Who are you?</h3>
            <p className="text-xs text-slate-500">We'll personalise your plan using your name</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="First Name" htmlFor="firstName">
            <input
              id="firstName"
              type="text"
              placeholder="e.g. Priya"
              value={profile.firstName || ''}
              onChange={e => setProfile({ firstName: e.target.value })}
              className="input-field"
            />
          </Field>

          <Field label="Date of Birth" htmlFor="dob" hint={profile.dob ? `Age: ${yearsOld} years` : 'Used to compute exact age'}>
            <input
              id="dob"
              type="date"
              value={profile.dob || ''}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setProfile({ dob: e.target.value })}
              className="input-field"
            />
          </Field>

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
        </div>
      </div>

      {/* Country — Work */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">🌍</span>
          <div>
            <h3 className="font-semibold text-white text-base">Where do you work?</h3>
            <p className="text-xs text-slate-500">Affects tax rules, contribution limits, and salary currency</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => handleWorkCountry(c.code)}
              className={`rounded-xl border p-4 text-left transition-all duration-200
                ${profile.workCountry === c.code
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{c.flag}</span>
                <span className={`font-semibold text-sm ${profile.workCountry === c.code ? 'text-indigo-300' : 'text-white'}`}>
                  {c.name}
                </span>
                {profile.workCountry === c.code && (
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

        {/* Same / different retire country toggle */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => handleSameCountry(!profile.sameCountry)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200
              ${profile.sameCountry ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-700 border-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5
              ${profile.sameCountry ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm text-slate-300">
            I plan to <strong className="text-white">retire in the same country</strong> I work
          </span>
        </div>
      </div>

      {/* Country — Retire (only if different) */}
      {!profile.sameCountry && (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
            <span className="text-xl">🏠</span>
            <div>
              <h3 className="font-semibold text-white text-base">Where do you plan to retire?</h3>
              <p className="text-xs text-slate-500">Affects cost of living, withdrawal tax, and healthcare costs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => handleRetireCountry(c.code)}
                className={`rounded-xl border p-4 text-left transition-all duration-200
                  ${profile.retireCountry === c.code
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  <span className={`font-semibold text-sm ${profile.retireCountry === c.code ? 'text-emerald-300' : 'text-white'}`}>
                    {c.name}
                  </span>
                  {profile.retireCountry === c.code && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
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

          {/* Cross-border exchange rate */}
          {profile.workCountry !== profile.retireCountry && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-400 font-semibold mb-2">Cross-border plan detected</p>
              <p className="text-xs text-slate-400 mb-3">
                Earning in {COUNTRY_NAMES[profile.workCountry]} and retiring in {COUNTRY_NAMES[profile.retireCountry]}.
                Projections will be shown in {COUNTRY_NAMES[profile.retireCountry]} currency.
              </p>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-300 whitespace-nowrap">Exchange rate assumption:</label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500">
                  <span className="px-3 py-2 text-slate-400 text-sm border-r border-slate-700 bg-slate-800">
                    1 {profile.workCountry === 'IN' ? '₹' : profile.workCountry === 'US' ? '$' : '£'} =
                  </span>
                  <input
                    type="number"
                    min={0.001}
                    step={0.01}
                    value={profile.exchangeRate || 83}
                    onChange={e => setProfile({ exchangeRate: Number(e.target.value) })}
                    className="bg-transparent text-white px-3 py-2 text-sm focus:outline-none w-20 tabular-nums"
                  />
                  <span className="px-3 text-slate-400 text-sm">
                    {profile.retireCountry === 'IN' ? '₹' : profile.retireCountry === 'US' ? '$' : '£'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Life expectancy (computed from gender + retireCountry) */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
          <span className="text-xl">⏳</span>
          <div>
            <h3 className="font-semibold text-white text-base">Life Expectancy</h3>
            <p className="text-xs text-slate-500">Based on actuarial tables for {COUNTRY_NAMES[profile.retireCountry] || 'India'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">
              Default for {profile.gender} in {COUNTRY_NAMES[profile.retireCountry] || 'India'}:{' '}
              <strong className="text-slate-300">
                {LIFE_EXPECTANCY_GENDER[profile.retireCountry || 'IN']?.[profile.gender || 'male'] || 80} years
              </strong>
            </p>
            <AgeInput
              id="lifeExp"
              value={profile.lifeExpectancy || 80}
              min={60}
              max={110}
              onChange={v => setProfile({ lifeExpectancy: v, lifeExpectancyOverridden: true })}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Retirement horizon</p>
            <p className="text-2xl font-bold text-indigo-400">
              {Math.max(0, (profile.lifeExpectancy || 80) - (profile.age || 30))} yrs
            </p>
          </div>
        </div>
      </div>

      {/* Summary card */}
      {profile.firstName && (
        <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-4">
          <p className="text-sm text-indigo-300">
            Hi <strong>{profile.firstName}</strong>! You're {profile.age || '?'} years old,
            working in {COUNTRY_NAMES[profile.workCountry] || 'India'}{!profile.sameCountry ? ` and planning to retire in ${COUNTRY_NAMES[profile.retireCountry] || 'India'}` : ''}.
            We'll personalise your retirement plan just for you.
          </p>
        </div>
      )}

      <div>
        <button onClick={onNext} className="btn-primary w-full sm:w-auto text-base px-8">
          Continue — Your Family →
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
