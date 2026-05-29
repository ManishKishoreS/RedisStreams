import { useStore } from '../store/useStore.js'
import { projectRetirement } from '../calculators/projections.js'
import { runMonteCarlo } from '../calculators/monteCarlo.js'
import { CURRENCY_SYMBOLS, DEFAULT_RETURNS } from '../data/defaults.js'

function fmt(v, sym) {
  if (!v) return `${sym}0`
  if (v >= 1e7) return `${sym}${(v / 1e7).toFixed(1)}Cr`
  if (v >= 1e5) return `${sym}${(v / 1e5).toFixed(1)}L`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${sym}${(v / 1e3).toFixed(0)}K`
  return `${sym}${Math.round(v)}`
}

export default function ScenarioComparison() {
  const { scenarios, profile, income, expenses, assumptions, results } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  if (!scenarios || scenarios.length === 0) return null

  const computeScenario = (sc) => {
    try {
      const p = { ...profile, ...sc.profile }
      const inc = { ...income, ...sc.income }
      const exp = { ...expenses, ...sc.expenses }
      const ass = { ...(assumptions || {}), ...sc.assumptions }

      const proj = projectRetirement(p, inc, exp, ass)
      const yearsAccum = Math.max(0, p.retirementAge - p.age)
      const yearsDecum = Math.max(0, p.lifeExpectancy - p.retirementAge)
      const blended = (ass.equityReturn || DEFAULT_RETURNS.equity) * (inc.equityRatio || 0.6) +
        (ass.debtReturn || DEFAULT_RETURNS.debt) * (1 - (inc.equityRatio || 0.6))

      const mc = runMonteCarlo({
        initialCorpus: inc.currentSavings || 0,
        annualContribution: (inc.monthlySavings || 0) * 12,
        annualWithdrawal: proj.annualExpensesAtRetirement,
        yearsAccum,
        yearsDecum,
        meanReturn: blended,
        stdDev: 0.12,
        inflationRate: exp.generalInflation || 0.06,
      }, 200)

      return {
        ...proj,
        successRate: mc.successRate * 100,
      }
    } catch {
      return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Scenario Comparison</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Base case */}
        {results && (
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
            <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm mb-3">Base Case</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Projected Corpus</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmt(results.projectedCorpus, sym)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Required Corpus</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{fmt(results.requiredCorpus, sym)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Surplus</dt>
                <dd className={`font-semibold ${results.surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {results.surplus >= 0 ? '+' : ''}{fmt(results.surplus, sym)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">MC Success</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{results.monteCarlo?.successRate ? (results.monteCarlo.successRate * 100).toFixed(0) : '--'}%</dd>
              </div>
            </dl>
          </div>
        )}

        {scenarios.map(sc => {
          const res = computeScenario(sc)
          if (!res) return null
          const isGood = res.surplus >= 0
          return (
            <div key={sc.id} className={`rounded-xl border p-4 ${isGood ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
              <h4 className={`font-semibold text-sm mb-3 ${isGood ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{sc.name}</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Projected Corpus</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{fmt(res.projectedCorpus, sym)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Required Corpus</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{fmt(res.requiredCorpus, sym)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Surplus</dt>
                  <dd className={`font-semibold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                    {res.surplus >= 0 ? '+' : ''}{fmt(res.surplus, sym)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">MC Success</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{res.successRate.toFixed(0)}%</dd>
                </div>
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}
