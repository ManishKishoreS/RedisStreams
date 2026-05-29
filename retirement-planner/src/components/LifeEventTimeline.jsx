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

export function LifeEventTimeline() {
  const { family, profile, results, expenses } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.workCountry || 'IN'] || '₹'

  const cashFlow = family ? cashFlowArray(family, profile) : []
  const oneTimeEvents = expenses?.oneTimeExpenses || []

  // Combine family events with one-time expenses
  const allEvents = [
    ...cashFlow.map(row => ({
      age: row.age,
      label: row.labels.join(', '),
      income: row.income,
      expense: row.expense,
      type: row.expense > 0 ? 'expense' : 'income',
    })),
    ...oneTimeEvents.map(ote => ({
      age: ote.year,
      label: ote.label,
      income: 0,
      expense: ote.amount,
      type: 'expense',
    })),
    // Retirement marker
    ...(results ? [{
      age: results.retirementAge,
      label: 'Retirement',
      type: 'milestone',
      income: 0,
      expense: 0,
    }] : []),
  ].sort((a, b) => a.age - b.age)

  if (allEvents.length === 0) return null

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
        <span className="text-xl">📅</span>
        <div>
          <h3 className="font-semibold text-white text-base">Life Events Timeline</h3>
          <p className="text-xs text-slate-500">Major financial events from now to retirement and beyond</p>
        </div>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-700" />

        <div className="space-y-4">
          {allEvents.map((event, i) => {
            const isMilestone = event.type === 'milestone'
            const isIncome = event.type === 'income' || event.income > 0
            const isExpense = event.type === 'expense' && event.expense > 0

            return (
              <div key={i} className="flex items-start gap-4 pl-0">
                {/* Dot */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-sm
                  ${isMilestone ? 'bg-indigo-500 border-indigo-400 text-white' : isIncome ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                  {isMilestone ? '🏁' : isIncome ? '+' : '-'}
                </div>

                {/* Content */}
                <div className={`flex-1 rounded-xl border p-3 -mt-1
                  ${isMilestone ? 'border-indigo-500/30 bg-indigo-500/5' : isIncome ? 'border-emerald-500/20 bg-slate-900' : 'border-slate-700 bg-slate-900'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Age {event.age}</p>
                      <p className={`text-sm font-semibold ${isMilestone ? 'text-indigo-300' : 'text-white'}`}>{event.label}</p>
                    </div>
                    {!isMilestone && (
                      <p className={`text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'}{fmt(isIncome ? event.income : event.expense, sym)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
