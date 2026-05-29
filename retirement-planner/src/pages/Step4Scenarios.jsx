import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

export function Step4Scenarios({ onNext, onBack }) {
  const { scenarios, addScenario, removeScenario, profile, income, expenses, assumptions, compute } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  const addPreset = (name, overrides) => {
    addScenario(name, overrides)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scenario Builder</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Compare what-if scenarios side by side. Each scenario starts from your current inputs.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <PresetCard
          title="Base Case"
          description="Retire as planned with moderate returns"
          color="border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20"
          onClick={() => addPreset('Base Case', { profile, income, expenses, assumptions })}
        />
        <PresetCard
          title="Optimistic"
          description={`Retire ${profile.retirementAge - 2} years earlier, higher returns (+2%)`}
          color="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
          onClick={() => addPreset('Optimistic', {
            profile: { ...profile, retirementAge: Math.max(45, profile.retirementAge - 2) },
            income,
            expenses,
            assumptions: { ...assumptions, equityReturn: assumptions.equityReturn + 0.02 },
          })}
        />
        <PresetCard
          title="Pessimistic"
          description={`Retire 3 years later, lower returns (−2%), higher inflation`}
          color="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
          onClick={() => addPreset('Pessimistic', {
            profile: { ...profile, retirementAge: profile.retirementAge + 3 },
            income,
            expenses: { ...expenses, generalInflation: expenses.generalInflation + 0.02 },
            assumptions: { ...assumptions, equityReturn: assumptions.equityReturn - 0.02 },
          })}
        />
      </div>

      {scenarios.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Your Scenarios</h3>
          <div className="space-y-2">
            {scenarios.map(sc => (
              <div key={sc.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{sc.name}</span>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    Retire age {sc.profile.retirementAge} · Savings {sym}{sc.income.monthlySavings.toLocaleString()}/mo · Return {(sc.assumptions.equityReturn * 100).toFixed(1)}%
                  </span>
                </div>
                <button onClick={() => removeScenario(sc.id)}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-xl ml-4" aria-label="Remove scenario">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {scenarios.length === 0 && (
        <p className="text-sm text-gray-400 italic">Add at least one scenario above to compare them in the results dashboard. You can skip this step.</p>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={() => { compute(); onNext() }} className="btn-primary">View Results →</button>
      </div>
    </div>
  )
}

function PresetCard({ title, description, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <span className="mt-3 inline-block text-xs font-medium text-indigo-600 dark:text-indigo-400">+ Add Scenario</span>
    </button>
  )
}
