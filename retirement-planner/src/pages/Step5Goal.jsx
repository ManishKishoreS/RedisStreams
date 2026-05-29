import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS, LIFE_EXPECTANCY_GENDER } from '../data/defaults.js'

export function Step5Goal({ onNext, onBack }) {
  const { goal, setGoal, profile, income, setProfile } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.retireCountry || 'IN'] || '₹'
  const mode = goal.retirementMode || 'find'

  const defaultLE = LIFE_EXPECTANCY_GENDER[profile.retireCountry || 'IN']?.[profile.gender || 'male'] || 80

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center py-2">
        <h2 className="text-2xl font-bold text-white">What's Your Retirement Goal?</h2>
        <p className="text-slate-400 mt-2 max-w-lg mx-auto">
          Choose how you'd like us to help you plan your retirement
        </p>
      </div>

      {/* Mode selection — big cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Mode A: Find my age */}
        <button
          onClick={() => setGoal({ retirementMode: 'find' })}
          className={`rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:scale-[1.02] group
            ${mode === 'find'
              ? 'border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/20'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl">🔍</span>
            {mode === 'find' && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500 text-white">Selected</span>
            )}
          </div>
          <h3 className={`text-xl font-extrabold mb-2 ${mode === 'find' ? 'text-indigo-300' : 'text-white'}`}>
            Find My Earliest Retirement Age
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            "Tell me when I can retire based on my finances"
          </p>
          <ul className="space-y-2">
            {[
              'App computes the earliest possible age',
              '1,000 Monte Carlo simulations',
              'You pick confidence threshold (70/85/95%)',
              'Sensitivity analysis shows what-if scenarios',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-indigo-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </button>

        {/* Mode B: Target age */}
        <button
          onClick={() => setGoal({ retirementMode: 'target' })}
          className={`rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:scale-[1.02] group
            ${mode === 'target'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/20'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl">🎯</span>
            {mode === 'target' && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">Selected</span>
            )}
          </div>
          <h3 className={`text-xl font-extrabold mb-2 ${mode === 'target' ? 'text-emerald-300' : 'text-white'}`}>
            I Have a Target Age
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            "I want to retire at a specific age — show me what I need"
          </p>
          <ul className="space-y-2">
            {[
              'Reverse-engineers your required corpus',
              'Shows gap analysis vs projected savings',
              'Tells you exact monthly savings needed',
              'Actionable steps to close the gap',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </button>
      </div>

      {/* Mode A config */}
      {mode === 'find' && (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="font-semibold text-white text-base">Confidence Threshold</h3>
              <p className="text-xs text-slate-500">How sure do you want to be that your money lasts?</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 0.70, label: '70%', desc: 'Aggressive', color: 'amber' },
              { val: 0.85, label: '85%', desc: 'Recommended', color: 'indigo' },
              { val: 0.95, label: '95%', desc: 'Conservative', color: 'emerald' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setGoal({ confidenceThreshold: opt.val })}
                className={`rounded-xl border p-4 text-center transition-all
                  ${(goal.confidenceThreshold || 0.85) === opt.val
                    ? opt.color === 'amber' ? 'border-amber-500 bg-amber-500/10' : opt.color === 'emerald' ? 'border-emerald-500 bg-emerald-500/10' : 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
              >
                <p className={`text-2xl font-extrabold ${(goal.confidenceThreshold || 0.85) === opt.val ? (opt.color === 'amber' ? 'text-amber-400' : opt.color === 'emerald' ? 'text-emerald-400' : 'text-indigo-400') : 'text-white'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode B config */}
      {mode === 'target' && (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-semibold text-white text-base">Target Retirement Age</h3>
              <p className="text-xs text-slate-500">When do you want to stop working?</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-0 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-emerald-500">
              <button
                type="button"
                onClick={() => setGoal({ targetRetirementAge: Math.max((profile.age || 30) + 5, (goal.targetRetirementAge || 60) - 1) })}
                className="px-4 py-4 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xl"
              >
                −
              </button>
              <span className="text-4xl font-extrabold text-white tabular-nums px-6 py-4">
                {goal.targetRetirementAge || 60}
              </span>
              <button
                type="button"
                onClick={() => setGoal({ targetRetirementAge: Math.min(75, (goal.targetRetirementAge || 60) + 1) })}
                className="px-4 py-4 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xl"
              >
                +
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                {Math.max(0, (goal.targetRetirementAge || 60) - (profile.age || 30))} years from now
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Retirement horizon: {Math.max(0, (profile.lifeExpectancy || 80) - (goal.targetRetirementAge || 60))} years
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="mt-4">
            <input
              type="range"
              min={(profile.age || 30) + 5}
              max={75}
              step={1}
              value={goal.targetRetirementAge || 60}
              onChange={e => setGoal({ targetRetirementAge: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>Age {(profile.age || 30) + 5}</span>
              <span>Age 75</span>
            </div>
          </div>
        </div>
      )}

      {/* Life expectancy override */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
          <span className="text-xl">⏳</span>
          <div>
            <h3 className="font-semibold text-white text-base">Planning Horizon</h3>
            <p className="text-xs text-slate-500">
              Default: {defaultLE} years (actuarial table for your profile)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-0 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
            <button type="button" onClick={() => setProfile({ lifeExpectancy: Math.max(60, (profile.lifeExpectancy || 80) - 1) })}
              className="px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-lg">
              −
            </button>
            <span className="text-xl font-extrabold text-white tabular-nums px-4 py-3">
              {profile.lifeExpectancy || 80}
            </span>
            <button type="button" onClick={() => setProfile({ lifeExpectancy: Math.min(110, (profile.lifeExpectancy || 80) + 1) })}
              className="px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-lg">
              +
            </button>
          </div>
          <p className="text-sm text-slate-400">years life expectancy</p>
        </div>
      </div>

      {/* Post-retirement income sources */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">💵</span>
          <div>
            <h3 className="font-semibold text-white text-base">Post-Retirement Income Sources</h3>
            <p className="text-xs text-slate-500">Any income you'll have in retirement reduces how much corpus you need</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'annuityMonthly', label: 'Annuity / Pension', hint: 'Fixed monthly pension or annuity payout' },
            { key: 'partTimeMonthly', label: 'Part-time / Consulting', hint: 'Side income during early retirement' },
            { key: 'rentalAtRetirement', label: 'Rental Income', hint: 'Passive rental income at retirement' },
            { key: 'socialSecurityMonthly', label: 'Social Security / EPF Pension', hint: 'Government pension if applicable' },
          ].map(item => (
            <div key={item.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-300">{item.label}</label>
              {item.hint && <p className="text-xs text-slate-500 -mt-0.5">{item.hint}</p>}
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-indigo-500">
                <span className="px-3 py-3 text-slate-400 font-medium text-sm border-r border-slate-700 bg-slate-800">{sym}</span>
                <input
                  type="number"
                  min={0}
                  value={goal[item.key] || 0}
                  onChange={e => setGoal({ [item.key]: Number(e.target.value) })}
                  className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none tabular-nums"
                />
                <span className="px-3 text-slate-500 text-xs">/mo</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total post-retirement income */}
        {(goal.annuityMonthly || goal.partTimeMonthly || goal.rentalAtRetirement || goal.socialSecurityMonthly) > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-emerald-400">
              Total post-retirement income:{' '}
              <strong>{sym}{((goal.annuityMonthly || 0) + (goal.partTimeMonthly || 0) + (goal.rentalAtRetirement || 0) + (goal.socialSecurityMonthly || 0)).toLocaleString()}/month</strong>
              {' '}— this reduces your required corpus
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={onNext} className="btn-primary text-base px-8">
          View My Retirement Plan →
        </button>
      </div>
    </div>
  )
}
