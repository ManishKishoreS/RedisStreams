const STEPS = ['Profile', 'Income', 'Expenses', 'Scenarios', 'Results']

export function ProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
        {STEPS.map((label, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${done ? 'bg-indigo-600 text-white' : active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900' : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
