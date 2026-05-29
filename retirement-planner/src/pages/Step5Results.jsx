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

const SUGGESTION_ICONS = ['✅', '⚠️', '📈', '💡', '🎯', '📊']

export default function Step5Results() {
  const { results, profile, setStep, compute } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  if (!results) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No results yet</h3>
        <p className="text-slate-400 mb-6">Complete the wizard to generate your retirement analysis.</p>
        <button onClick={compute} className="btn-primary">
          Calculate Now
        </button>
      </div>
    )
  }

  const { projectedCorpus, requiredCorpus, surplus, score, monteCarlo, suggestions, annualExpensesAtRetirement } = results
  const successRate = monteCarlo?.successRate ? monteCarlo.successRate * 100 : 0
  const yearsToRetirement = Math.max(0, profile.retirementAge - profile.age)

  const kpiCards = [
    {
      label: 'Projected Corpus',
      value: fmt(projectedCorpus, sym),
      sub: `At age ${profile.retirementAge}`,
      icon: '🏦',
      color: 'indigo',
    },
    {
      label: 'Required Corpus',
      value: fmt(requiredCorpus, sym),
      sub: `${profile.lifeExpectancy - profile.retirementAge}-year horizon`,
      icon: '🎯',
      color: 'blue',
    },
    {
      label: surplus >= 0 ? 'Surplus' : 'Shortfall',
      value: fmt(Math.abs(surplus), sym),
      sub: surplus >= 0 ? 'Ahead of target' : 'Gap to cover',
      icon: surplus >= 0 ? '✅' : '⚠️',
      color: surplus >= 0 ? 'emerald' : 'red',
    },
    {
      label: 'Monthly SIP Needed',
      value: fmt(Math.max(0, Math.round(-surplus / (yearsToRetirement * 12 * 1.5 || 1))), sym),
      sub: 'Additional savings/mo',
      icon: '📈',
      color: 'purple',
    },
  ]

  const colorMap = {
    indigo: { border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', text: 'text-indigo-300', badge: 'bg-indigo-500/10' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-300', badge: 'bg-blue-500/10' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-300', badge: 'bg-emerald-500/10' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-300', badge: 'bg-red-500/10' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-300', badge: 'bg-purple-500/10' },
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Retirement Dashboard</h2>
          <p className="text-slate-400 mt-1">
            Retirement at {profile.retirementAge} · {profile.lifeExpectancy - profile.retirementAge}-year horizon · {yearsToRetirement} years away
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Success probability banner */}
      <div className={`rounded-2xl border p-5 ${
        successRate >= 80 ? 'border-emerald-500/30 bg-emerald-500/5' :
        successRate >= 50 ? 'border-amber-500/30 bg-amber-500/5' :
        'border-red-500/30 bg-red-500/5'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Success Probability</p>
            <p className={`text-3xl font-extrabold tabular-nums mt-0.5 ${
              successRate >= 80 ? 'text-emerald-400' : successRate >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>{successRate.toFixed(0)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Based on 1,000 Monte Carlo simulations</p>
            <p className={`text-sm font-semibold mt-0.5 ${
              successRate >= 80 ? 'text-emerald-400' : successRate >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {successRate >= 80 ? 'Strong Plan ✓' : successRate >= 50 ? 'Needs Improvement' : 'High Risk — Action Required'}
            </p>
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              successRate >= 80 ? 'bg-emerald-500' : successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Score + KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="sm:col-span-1">
          <ScoreGauge score={score} successRate={successRate} />
        </div>
        <div className="sm:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiCards.map(card => {
            const c = colorMap[card.color]
            return (
              <div key={card.label} className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 leading-tight">{card.label}</p>
                  <span className={`text-sm px-1.5 py-0.5 rounded-lg ${c.badge}`}>{card.icon}</span>
                </div>
                <p className={`text-xl font-extrabold tabular-nums ${c.text} leading-tight`}>{card.value}</p>
                <p className="text-xs text-slate-600 mt-auto pt-1.5">{card.sub}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expenses at retirement */}
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Annual Expenses at Retirement</span>
          <span className="font-bold text-white tabular-nums">{fmt(annualExpensesAtRetirement, sym)}</span>
        </div>
        <div className="w-px bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Monthly Expenses at Retirement</span>
          <span className="font-bold text-white tabular-nums">{fmt(Math.round(annualExpensesAtRetirement / 12), sym)}</span>
        </div>
        <div className="w-px bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Retirement Score</span>
          <span className={`font-bold tabular-nums ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}/100</span>
        </div>
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NetWorthChart />
        <MonteCarloChart />
      </div>

      {/* Cash Flow */}
      <CashFlowChart />

      {/* Sensitivity + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SensitivitySliders />

        {/* Actionable Insights */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-semibold text-white">Actionable Insights</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {(suggestions || []).length} tips
            </span>
          </div>
          <ul className="space-y-3">
            {(suggestions || []).length === 0 && (
              <li className="text-sm text-slate-500 text-center py-4">Your plan looks solid — no urgent actions needed.</li>
            )}
            {(suggestions || []).map((s, i) => (
              <li key={i} className="flex gap-3 p-3 rounded-xl bg-slate-900 border border-slate-700">
                <span className="text-lg flex-shrink-0">{SUGGESTION_ICONS[i] || '💡'}</span>
                <span className="text-sm text-slate-300 leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scenario Comparison */}
      <ScenarioComparison />

      {/* Footer buttons */}
      <div className="flex gap-3 justify-between pt-2">
        <button
          onClick={() => setStep(3)}
          className="btn-secondary"
        >
          ← Back to Scenarios
        </button>
        <button
          onClick={() => compute()}
          className="btn-primary"
        >
          ↺ Recalculate
        </button>
      </div>
    </div>
  )
}
