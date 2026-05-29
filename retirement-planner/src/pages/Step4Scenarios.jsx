import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

const PRESET_CONFIGS = [
  {
    key: 'base',
    title: 'Base Case',
    description: 'Retire as planned with moderate market returns',
    icon: '⚖️',
    border: 'border-indigo-500/40',
    bg: 'bg-indigo-500/5',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    titleColor: 'text-indigo-300',
    chips: ['Current plan', 'Moderate returns', 'Expected inflation'],
  },
  {
    key: 'optimistic',
    title: 'Optimistic',
    description: 'Retire 2 years earlier with higher market returns',
    icon: '🚀',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    titleColor: 'text-emerald-300',
    chips: ['Early retirement', '+2% returns', 'Bull market'],
  },
  {
    key: 'pessimistic',
    title: 'Pessimistic',
    description: 'Retire 3 years later with lower returns &amp; higher inflation',
    icon: '🛡️',
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    titleColor: 'text-red-300',
    chips: ['Delayed retirement', '−2% returns', 'High inflation'],
  },
]

export function Step4Scenarios({ onNext, onBack }) {
  const { scenarios, addScenario, removeScenario, profile, income, expenses, assumptions, compute } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  const getOverrides = (key) => {
    if (key === 'base') return { profile, income, expenses, assumptions }
    if (key === 'optimistic') return {
      profile: { ...profile, retirementAge: Math.max(45, profile.retirementAge - 2) },
      income,
      expenses,
      assumptions: { ...assumptions, equityReturn: assumptions.equityReturn + 0.02 },
    }
    if (key === 'pessimistic') return {
      profile: { ...profile, retirementAge: profile.retirementAge + 3 },
      income,
      expenses: { ...expenses, generalInflation: expenses.generalInflation + 0.02 },
      assumptions: { ...assumptions, equityReturn: assumptions.equityReturn - 0.02 },
    }
    return {}
  }

  const nameMap = { base: 'Base Case', optimistic: 'Optimistic', pessimistic: 'Pessimistic' }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Scenario Builder</h2>
        <p className="text-slate-400 mt-1">Compare what-if scenarios side by side. Each starts from your current inputs.</p>
      </div>

      {/* Preset cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {PRESET_CONFIGS.map(preset => (
          <button
            key={preset.key}
            onClick={() => addScenario(nameMap[preset.key], getOverrides(preset.key))}
            className={`rounded-2xl border ${preset.border} ${preset.bg} p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{preset.icon}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${preset.badgeBg} ${preset.badgeText}`}>
                + Add
              </span>
            </div>
            <h4 className={`font-bold text-base mb-1.5 ${preset.titleColor}`}>{preset.title}</h4>
            <p className="text-sm text-slate-400 mb-4" dangerouslySetInnerHTML={{ __html: preset.description }} />
            <div className="flex flex-wrap gap-1.5">
              {preset.chips.map(chip => (
                <span key={chip} className={`text-xs px-2 py-0.5 rounded-full ${preset.badgeBg} ${preset.badgeText} border border-current/10`}>
                  {chip}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Added scenarios */}
      {scenarios.length > 0 && (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="font-semibold text-white mb-4">Added Scenarios ({scenarios.length})</h3>
          <div className="space-y-2">
            {scenarios.map(sc => (
              <div key={sc.id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="font-medium text-white text-sm">{sc.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Retire {sc.profile.retirementAge}</span>
                  <span className="hidden sm:inline">{sym}{sc.income.monthlySavings.toLocaleString()}/mo savings</span>
                  <span className="hidden sm:inline">{(sc.assumptions.equityReturn * 100).toFixed(1)}% equity return</span>
                  <button
                    onClick={() => removeScenario(sc.id)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center"
                    aria-label="Remove scenario"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scenarios.length === 0 && (
        <div className="rounded-xl bg-slate-800/50 border border-dashed border-slate-700 p-6 text-center">
          <p className="text-sm text-slate-500">Add scenarios above to compare them in the results dashboard.</p>
          <p className="text-xs text-slate-600 mt-1">You can also skip this step and proceed directly to results.</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={() => { compute(); onNext() }} className="btn-primary">
          View Results →
        </button>
      </div>
    </div>
  )
}
