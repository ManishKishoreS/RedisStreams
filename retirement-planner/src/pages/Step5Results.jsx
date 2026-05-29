import { useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { ScoreGauge } from '../components/ScoreGauge.jsx'
import { NetWorthChart } from '../components/NetWorthChart.jsx'
import { MonteCarloChart } from '../components/MonteCarloChart.jsx'
import { CashFlowChart } from '../components/CashFlowChart.jsx'
import SensitivitySliders from '../components/SensitivitySliders.jsx'
import ScenarioComparison from '../components/ScenarioComparison.jsx'
import ExportButton from '../components/ExportButton.jsx'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmtC(v, sym, country) {
  if (country === 'IN') {
    if (v >= 1e7) return `${sym}${(v / 1e7).toFixed(2)} Cr`
    if (v >= 1e5) return `${sym}${(v / 1e5).toFixed(2)} L`
  }
  if (Math.abs(v) >= 1e6) return `${sym}${(v / 1e6).toFixed(2)}M`
  if (Math.abs(v) >= 1000) return `${sym}${(v / 1000).toFixed(0)}K`
  return `${sym}${v.toLocaleString()}`
}

export function Step5Results({ onBack }) {
  const { results, compute, profile } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  useEffect(() => { compute() }, [])

  if (!results) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-label="Loading" />
          <p className="text-gray-500 dark:text-gray-400">Running your retirement projection…</p>
        </div>
      </div>
    )
  }

  const surplus = results.surplus >= 0

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Retirement Plan</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Based on 1,000 Monte Carlo simulations</p>
        </div>
        <ExportButton />
      </div>

      {/* Summary cards + score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreGauge score={results.score} successRate={results.monteCarlo?.successRate || 0} />
        <SummaryCard label="Projected Corpus" value={fmtC(results.projectedCorpus, sym, profile.country)} sub={`At age ${profile.retirementAge}`} color="text-indigo-600 dark:text-indigo-400" />
        <SummaryCard label="Required Corpus" value={fmtC(results.requiredCorpus, sym, profile.country)} sub={`To last to age ${profile.lifeExpectancy}`} color="text-gray-900 dark:text-white" />
        <SummaryCard
          label={surplus ? 'Surplus' : 'Shortfall'}
          value={fmtC(Math.abs(results.surplus), sym, profile.country)}
          sub={surplus ? 'You are ahead of plan!' : 'Consider adjustments below'}
          color={surplus ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}
        />
      </div>

      {/* Suggestions */}
      {results.suggestions.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <span aria-hidden="true">💡</span> Actionable Suggestions
          </h3>
          <ul className="space-y-2">
            {results.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                <span className="mt-0.5 text-amber-400 shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <NetWorthChart />
        <MonteCarloChart />
      </div>

      <CashFlowChart />

      {/* NPS section */}
      {results.nps && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">NPS Optimiser (India)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ['Total Corpus', fmtC(results.nps.totalCorpus, sym, 'IN')],
              ['Tax-Free Lumpsum (60%)', fmtC(results.nps.lumpsum, sym, 'IN')],
              ['Annuity Purchase (40%)', fmtC(results.nps.annuityPurchase, sym, 'IN')],
              ['Monthly Pension', fmtC(results.nps.monthlyPension, sym, 'IN')],
              ['Annual Tax Saving', fmtC(results.nps.taxSaving, sym, 'IN')],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="text-xs text-blue-600 dark:text-blue-400">{l}</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <SensitivitySliders />
      <ScenarioComparison />

      {/* Assumptions disclosure */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Assumptions Used</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>General Inflation: {(useStore.getState().expenses.generalInflation * 100).toFixed(1)}% p.a.</span>
          <span>Medical Inflation: {(useStore.getState().expenses.medicalInflation * 100).toFixed(1)}% p.a.</span>
          <span>Equity Return: {(useStore.getState().assumptions.equityReturn * 100).toFixed(1)}% p.a.</span>
          <span>Debt Return: {(useStore.getState().assumptions.debtReturn * 100).toFixed(1)}% p.a.</span>
          <span>Monte Carlo std dev: 12%</span>
          <span>Retirement return: 75% of accumulation return</span>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={onBack} className="btn-secondary">← Edit Plan</button>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
    </div>
  )
}
