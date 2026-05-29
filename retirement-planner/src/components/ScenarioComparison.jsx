import { useStore } from '../store/useStore.js'
import { projectRetirement } from '../calculators/projections.js'
import { runMonteCarlo } from '../calculators/monteCarlo.js'
import { CURRENCY_SYMBOLS, DEFAULT_RETURNS } from '../data/defaults.js'

function fmt(v, sym) {
  if (!v && v !== 0) return `${sym}0`
  const abs = Math.abs(v)
  if (abs >= 1e7) return `${sym}${(abs / 1e7).toFixed(1)}Cr`
  if (abs >= 1e6) return `${sym}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e5) return `${sym}${(abs / 1e5).toFixed(1)}L`
  if (abs >= 1e3) return `${sym}${(abs / 1e3).toFixed(0)}K`
  return `${sym}${Math.round(abs)}`
}

export default function ScenarioComparison() {
  const { scenarios, profile, income, expenses, assumptions, results } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.retireCountry || profile.workCountry || profile.country] || '₹'

  if (!scenarios || scenarios.length === 0) return null

  const computeScenario = (sc) => {
    try {
      const p = { ...profile, ...sc.profile }
      const inc = { ...income, ...sc.income }
      const exp = { ...expenses, ...sc.expenses }
      const ass = { ...(assumptions || {}), ...sc.assumptions }

      // Ensure retirementAge is set (use results or default)
      if (!p.retirementAge) {
        p.retirementAge = results?.retirementAge || 60
      }

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

      return { ...proj, successRate: mc.successRate * 100 }
    } catch {
      return null
    }
  }

  const baseCard = results ? {
    name: 'Base Case',
    projectedCorpus: results.projectedCorpus,
    requiredCorpus: results.requiredCorpus,
    surplus: results.surplus,
    successRate: results.monteCarlo?.successRate ? results.monteCarlo.successRate * 100 : 0,
    isBase: true,
  } : null

  const allCards = [
    ...(baseCard ? [baseCard] : []),
    ...scenarios.map(sc => {
      const res = computeScenario(sc)
      if (!res) return null
      return { ...res, name: sc.name, isBase: false }
    }).filter(Boolean),
  ]

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
      <h3 className="font-semibold text-white mb-5">Scenario Comparison</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCards.map((card, i) => {
          const isGood = card.surplus >= 0
          const borderColor = card.isBase ? 'border-indigo-500/40' : isGood ? 'border-emerald-500/40' : 'border-red-500/40'
          const bgColor = card.isBase ? 'bg-indigo-500/5' : isGood ? 'bg-emerald-500/5' : 'bg-red-500/5'
          const titleColor = card.isBase ? 'text-indigo-300' : isGood ? 'text-emerald-300' : 'text-red-300'
          const surplusColor = isGood ? 'text-emerald-400' : 'text-red-400'

          return (
            <div key={i} className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-bold text-sm ${titleColor}`}>{card.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  card.successRate >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                  card.successRate >= 50 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {card.successRate.toFixed(0)}% success
                </span>
              </div>
              <dl className="space-y-2.5">
                <DataRow label="Projected" value={fmt(card.projectedCorpus, sym)} sym={sym} />
                <DataRow label="Required" value={fmt(card.requiredCorpus, sym)} sym={sym} />
                <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                  <dt className="text-xs text-slate-500">{isGood ? 'Surplus' : 'Shortfall'}</dt>
                  <dd className={`text-sm font-bold tabular-nums ${surplusColor}`}>
                    {isGood ? '+' : '-'}{fmt(Math.abs(card.surplus), sym)}
                  </dd>
                </div>
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-white tabular-nums">{value}</dd>
    </div>
  )
}
