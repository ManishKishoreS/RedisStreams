import { useStore } from '../store/useStore.js'
import { ScoreGauge } from '../components/ScoreGauge.jsx'
import { MonteCarloChart } from '../components/MonteCarloChart.jsx'
import { NetWorthChart } from '../components/NetWorthChart.jsx'
import { CashFlowChart } from '../components/CashFlowChart.jsx'
import SensitivitySliders from '../components/SensitivitySliders.jsx'
import ScenarioComparison from '../components/ScenarioComparison.jsx'
import ExportButton from '../components/ExportButton.jsx'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (v === undefined || v === null) return `${sym}0`
  const abs = Math.abs(v)
  if (abs >= 1e7) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e7).toFixed(2)}Cr`
  if (abs >= 1e5) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e5).toFixed(2)}L`
  if (abs >= 1e6) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e6).toFixed(2)}M`
  return `${v < 0 ? '-' : ''}${sym}${Math.abs(Math.round(v)).toLocaleString()}`
}

export default function Step5Results() {
  const { results, profile, setStep, compute } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  if (!results) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No results yet. Please complete the wizard first.</p>
        <button onClick={() => { compute(); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium">
          Calculate Now
        </button>
      </div>
    )
  }

  const { projectedCorpus, requiredCorpus, surplus, score, monteCarlo, suggestions, annualExpensesAtRetirement } = results

  const summaryCards = [
    {
      label: 'Projected Corpus',
      value: fmt(projectedCorpus, sym),
      sub: `At age ${profile.retirementAge}`,
      color: 'indigo',
    },
    {
      label: 'Required Corpus',
      value: fmt(requiredCorpus, sym),
      sub: `For ${profile.lifeExpectancy - profile.retirementAge} years`,
      color: 'blue',
    },
    {
      label: surplus >= 0 ? 'Surplus' : 'Shortfall',
      value: fmt(Math.abs(surplus), sym),
      sub: surplus >= 0 ? 'You are ahead of target' : 'Gap to cover',
      color: surplus >= 0 ? 'green' : 'red',
    },
    {
      label: 'Success Rate',
      value: `${(monteCarlo?.successRate * 100 || 0).toFixed(0)}%`,
      sub: '1,000 Monte Carlo runs',
      color: (monteCarlo?.successRate || 0) >= 0.8 ? 'green' : (monteCarlo?.successRate || 0) >= 0.5 ? 'yellow' : 'red',
    },
  ]

  const cardColors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Retirement Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Planning for retirement at age {profile.retirementAge} with a {profile.lifeExpectancy - profile.retirementAge}-year horizon.
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Score + Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1">
          <ScoreGauge score={score} successRate={monteCarlo?.successRate * 100 || 0} />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <div key={card.label} className={`rounded-2xl border p-4 ${cardColors[card.color]}`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Annual expenses at retirement */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Annual Expenses at Retirement:</span>
          <span className="font-semibold text-gray-900 dark:text-white ml-2">{fmt(annualExpensesAtRetirement, sym)}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Monthly Expenses at Retirement:</span>
          <span className="font-semibold text-gray-900 dark:text-white ml-2">{fmt(Math.round(annualExpensesAtRetirement / 12), sym)}</span>
        </div>
      </div>

      {/* Charts */}
      <NetWorthChart />
      <MonteCarloChart />
      <CashFlowChart />

      {/* Two column layout for sliders + suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensitivitySliders />

        {/* Actionable Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Actionable Suggestions</h3>
          <ul className="space-y-3">
            {(suggestions || []).map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scenario Comparison */}
      <ScenarioComparison />

      <div className="flex gap-3 justify-between">
        <button onClick={() => setStep(3)}
          className="text-gray-600 dark:text-gray-400 font-medium px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          ← Back to Scenarios
        </button>
        <button onClick={() => { compute() }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
          Recalculate
        </button>
      </div>
    </div>
  )
}
