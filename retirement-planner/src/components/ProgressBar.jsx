const STEPS = [
  { label: 'Profile', icon: '👤' },
  { label: 'Family', icon: '👨‍👩‍👧' },
  { label: 'Income', icon: '💰' },
  { label: 'Expenses', icon: '📊' },
  { label: 'Goal', icon: '🎯' },
  { label: 'Results', icon: '🏆' },
]

export function ProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Step node */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative
                    ${done
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : active
                        ? 'bg-slate-900 text-indigo-400 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900'
                        : 'bg-slate-800 text-slate-600 border border-slate-700'
                    }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={active ? 'text-indigo-400' : 'text-slate-600'}>{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block transition-colors duration-200
                    ${active ? 'text-indigo-400' : done ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full overflow-hidden bg-slate-800">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: done ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
