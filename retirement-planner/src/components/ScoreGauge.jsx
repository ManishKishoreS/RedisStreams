export function ScoreGauge({ score, successRate }) {
  const color = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
  const bgColor = score >= 75 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : score >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  const label = score >= 75 ? 'On Track' : score >= 50 ? 'Needs Attention' : 'At Risk'
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ * 0.75
  const offset = circ * 0.125

  return (
    <div className={`rounded-2xl border p-6 flex flex-col items-center gap-2 ${bgColor}`}>
      <div className="relative w-36 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-gray-700"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={-offset} strokeLinecap="round"/>
          <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10"
            stroke={score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>
      <p className={`text-lg font-semibold ${color}`}>{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Monte Carlo success: <strong>{(successRate * 1).toFixed(0)}%</strong>
      </p>
    </div>
  )
}
