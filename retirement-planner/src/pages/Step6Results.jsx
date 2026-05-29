import { useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { MonteCarloChart } from '../components/MonteCarloChart.jsx'
import { NetWorthChart } from '../components/NetWorthChart.jsx'
import { ScoreGauge } from '../components/ScoreGauge.jsx'
import SensitivitySliders from '../components/SensitivitySliders.jsx'
import ScenarioComparison from '../components/ScenarioComparison.jsx'
import ExportButton from '../components/ExportButton.jsx'
import { RetirementAgeHero } from '../components/RetirementAgeHero.jsx'
import { FamilyImpactCard } from '../components/FamilyImpactCard.jsx'
import { LifeEventTimeline } from '../components/LifeEventTimeline.jsx'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (v === undefined || v === null) return `${sym}0`
  const abs = Math.abs(v)
  if (abs >= 1e7) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e7).toFixed(2)}Cr`
  if (abs >= 1e5) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e5).toFixed(2)}L`
  if (abs >= 1e6) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e6).toFixed(2)}M`
  return `${v < 0 ? '-' : ''}${sym}${Math.abs(Math.round(v)).toLocaleString()}`
}

const SUGGESTION_ICONS = ['💡', '📈', '⚠️', '✅', '🎯', '📊', '🏦']

export default function Step6Results() {
  const { results, profile, family, computing, setStep, compute } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.retireCountry || profile.workCountry || 'IN'] || '₹'
  const firstName = profile.firstName || ''

  // Auto-compute when we land on this page
  useEffect(() => {
    if (!results && !computing) {
      compute()
    }
  }, [])

  if (computing || !results) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔮</div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white mb-2">Calculating your retirement plan...</p>
          <p className="text-sm text-slate-400 max-w-sm">
            Running 1,000 Monte Carlo simulations across market scenarios
          </p>
        </div>
        <div className="w-72 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    )
  }

  const mode = results.mode || 'find'
  const retirementAge = results.retirementAge || 60
  const successRate = results.successRate || 0
  const projectedCorpus = results.projectedCorpus || 0
  const requiredCorpus = results.requiredCorpus || 0
  const surplus = results.surplus || 0
  const gap = projectedCorpus - requiredCorpus
  const gapPercent = requiredCorpus > 0 ? Math.round(Math.abs(gap) / requiredCorpus * 100) : 0
  const yearsToRetirement = results.yearsToRetirement || Math.max(0, retirementAge - (profile.age || 30))
  const monthlyNeeded = results.requiredMonthlySavings || (surplus < 0 ? Math.round(-surplus / (yearsToRetirement * 12 * 1.5 || 1)) : 0)
  const currentMonthly = results.currentMonthlySavings || 0
  const annualExpenses = results.annualExpensesAtRetirement || 0
  const taxSavings = results.taxSavings || 0
  const suggestions = results.suggestions || []

  // Compute simple score
  const surplusRatio = projectedCorpus / Math.max(1, requiredCorpus)
  const mcScore = successRate * 100
  const score = Math.min(100, Math.round((surplusRatio * 0.5 + mcScore / 100 * 0.5) * 100))

  const kpiCards = [
    {
      label: 'Projected Corpus',
      value: fmt(projectedCorpus, sym),
      sub: `At age ${retirementAge}`,
      icon: '🏦',
      color: 'indigo',
    },
    {
      label: 'Required Corpus',
      value: fmt(requiredCorpus, sym),
      sub: `${Math.max(0, (profile.lifeExpectancy || 80) - retirementAge)}-year horizon`,
      icon: '🎯',
      color: 'blue',
    },
    {
      label: mode === 'target' && surplus < 0 ? 'Monthly Savings Needed' : 'Monthly Savings',
      value: fmt(mode === 'target' && surplus < 0 ? monthlyNeeded : (currentMonthly || monthlyNeeded), sym),
      sub: mode === 'target' && surplus < 0 ? `vs current ${fmt(currentMonthly, sym)}/mo` : 'Current savings rate',
      icon: '📈',
      color: mode === 'target' && surplus < 0 ? 'amber' : 'emerald',
    },
    {
      label: 'Years to Retirement',
      value: `${yearsToRetirement}`,
      sub: `Retire at ${retirementAge} · Plan to ${profile.lifeExpectancy || 80}`,
      icon: '⏳',
      color: 'purple',
    },
  ]

  const colorMap = {
    indigo: { border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', text: 'text-indigo-300', badge: 'bg-indigo-500/10' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-300', badge: 'bg-blue-500/10' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-300', badge: 'bg-emerald-500/10' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-300', badge: 'bg-red-500/10' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-300', badge: 'bg-purple-500/10' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-300', badge: 'bg-amber-500/10' },
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {firstName ? `Hi ${firstName}, here's your retirement picture` : 'Your Retirement Dashboard'}
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            {mode === 'find' ? 'Find My Retirement Age mode' : `Target Age ${retirementAge} mode`}
            {' · '}Based on 1,000 Monte Carlo simulations
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Hero section */}
      <RetirementAgeHero
        mode={mode}
        retirementAge={retirementAge}
        successRate={successRate}
        projectedCorpus={projectedCorpus}
        requiredCorpus={requiredCorpus}
        gap={gap}
        gapPercent={gapPercent}
        yearsToRetirement={yearsToRetirement}
        lifeExpectancy={profile.lifeExpectancy || 80}
        currentAge={profile.age || 30}
        sym={sym}
        firstName={firstName}
        threshold={results.threshold || 0.85}
        belowThreshold={results.belowThreshold}
      />

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {/* Expenses at retirement */}
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Annual Expenses at Retirement</span>
          <span className="font-bold text-white tabular-nums">{fmt(annualExpenses, sym)}</span>
        </div>
        <div className="w-px bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Monthly at Retirement</span>
          <span className="font-bold text-white tabular-nums">{fmt(Math.round(annualExpenses / 12), sym)}</span>
        </div>
        {taxSavings > 0 && (
          <>
            <div className="w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Tax Savings (this year)</span>
              <span className="font-bold text-emerald-400 tabular-nums">{fmt(taxSavings, sym)}</span>
            </div>
          </>
        )}
      </div>

      {/* Score + Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="sm:col-span-1">
          <ScoreGauge score={score} successRate={successRate * 100} />
        </div>
        <div className="sm:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NetWorthChart />
          <MonteCarloChart />
        </div>
      </div>

      {/* Family Impact */}
      <FamilyImpactCard />

      {/* Life Events Timeline */}
      <LifeEventTimeline />

      {/* Tax Savings section */}
      {(profile.workCountry === 'IN' || profile.retireCountry === 'IN') && (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
            <span className="text-xl">💸</span>
            <h3 className="font-semibold text-white text-base">Tax Savings via 80C / NPS</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'EPF/VPF/PPF (80C)', amount: Math.min(150000, ((profile.epfMonthly || 0) + (profile.vpfMonthly || 0) + (profile.ppfMonthly || 0)) * 12), color: 'indigo' },
              { label: 'NPS 80CCD(1B)', amount: Math.min(50000, (profile.npsMonthly || 0) * 12), color: 'purple' },
              { label: 'Total Tax Saved', amount: taxSavings, color: 'emerald' },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-4 bg-slate-900 border border-slate-700`}>
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className={`text-xl font-extrabold tabular-nums ${item.color === 'emerald' ? 'text-emerald-400' : item.color === 'purple' ? 'text-purple-400' : 'text-indigo-400'}`}>
                  {fmt(item.amount, sym)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensitivity + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SensitivitySliders />

        {/* Actionable Insights */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-semibold text-white">Actionable Insights</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {suggestions.length} tips
            </span>
          </div>
          <ul className="space-y-3">
            {suggestions.length === 0 && (
              <li className="text-sm text-slate-500 text-center py-4">Your plan looks solid — no urgent actions needed.</li>
            )}
            {suggestions.map((s, i) => (
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
        <button onClick={() => setStep(4)} className="btn-secondary">
          ← Back to Goal
        </button>
        <button onClick={() => compute()} className="btn-primary">
          ↺ Recalculate
        </button>
      </div>
    </div>
  )
}
