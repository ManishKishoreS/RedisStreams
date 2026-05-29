import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'
import { cashFlowArray } from '../calculators/familyEvents.js'

function fmt(v, sym) {
  if (!v) return `${sym}0`
  const abs = Math.abs(v)
  if (abs >= 1e7) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e7).toFixed(1)}Cr`
  if (abs >= 1e5) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e5).toFixed(1)}L`
  if (abs >= 1e3) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e3).toFixed(0)}K`
  return `${v < 0 ? '-' : ''}${sym}${Math.round(abs).toLocaleString()}`
}

export function FamilyImpactCard() {
  const { family, profile, results } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.workCountry || 'IN'] || '₹'

  if (!family) return null

  const hasChildren = family.children?.length > 0
  const hasDependents = family.dependents?.length > 0
  const hasSpouse = !!family.spouse
  const hasEvents = family.lifeEvents?.length > 0

  if (!hasChildren && !hasDependents && !hasSpouse && !hasEvents) return null

  const cashFlow = cashFlowArray(family, profile)
  const totalImpact = cashFlow.reduce((sum, row) => sum + row.income - row.expense, 0)

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
        <span className="text-xl">👨‍👩‍👧‍👦</span>
        <div>
          <h3 className="font-semibold text-white text-base">Family Impact on Your Plan</h3>
          <p className="text-xs text-slate-500">How your family affects the retirement journey</p>
        </div>
        <div className="ml-auto">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${totalImpact >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {totalImpact >= 0 ? '+' : ''}{fmt(totalImpact, sym)} net impact
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {/* Spouse */}
        {hasSpouse && (
          <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">💑</span>
              <p className="text-sm font-semibold text-white">
                {family.spouse.name || 'Spouse'}
              </p>
            </div>
            <p className="text-xs text-slate-500">Combined household planning</p>
          </div>
        )}

        {/* Children summary */}
        {hasChildren && (
          <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">👶</span>
              <p className="text-sm font-semibold text-white">
                {family.children.length} Child{family.children.length > 1 ? 'ren' : ''}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Education + weddings:{' '}
              <span className="text-red-400 font-semibold">
                {fmt(
                  cashFlow.filter(r => r.labels.some(l => l.includes('education') || l.includes('wedding')))
                    .reduce((s, r) => s + r.expense, 0),
                  sym
                )}
              </span>
            </p>
          </div>
        )}

        {/* Dependents summary */}
        {hasDependents && (
          <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">👴</span>
              <p className="text-sm font-semibold text-white">
                {family.dependents.length} Dependent{family.dependents.length > 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Caregiving costs:{' '}
              <span className="text-red-400 font-semibold">
                {fmt(
                  cashFlow.filter(r => r.labels.some(l => l.toLowerCase().includes('care')))
                    .reduce((s, r) => s + r.expense, 0),
                  sym
                )}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Year-by-year cash flow table (top 10) */}
      {cashFlow.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Key Family Cash Flows</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cashFlow.slice(0, 12).map((row, i) => (
              <div key={i} className="flex items-center gap-4 text-xs">
                <span className="w-16 text-slate-500 flex-shrink-0">Age {row.age}</span>
                <div className="flex-1 space-y-0.5">
                  {row.labels.slice(0, 2).map((label, j) => (
                    <p key={j} className="text-slate-400">{label}</p>
                  ))}
                </div>
                {row.income > 0 && (
                  <span className="text-emerald-400 font-semibold tabular-nums">+{fmt(row.income, sym)}</span>
                )}
                {row.expense > 0 && (
                  <span className="text-red-400 font-semibold tabular-nums">-{fmt(row.expense, sym)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
