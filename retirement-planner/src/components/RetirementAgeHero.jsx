import { useEffect, useState } from 'react'

export function RetirementAgeHero({ mode, retirementAge, successRate, projectedCorpus, requiredCorpus, gap, gapPercent, yearsToRetirement, lifeExpectancy, currentAge, sym, firstName, threshold, belowThreshold }) {
  const [displayAge, setDisplayAge] = useState(currentAge || 30)
  const [animDone, setAnimDone] = useState(false)

  // Count-up animation for mode A
  useEffect(() => {
    if (mode !== 'find' || !retirementAge) return
    const start = currentAge || 30
    const end = retirementAge
    const duration = 800
    const steps = 30
    const stepTime = duration / steps
    let current = start
    const increment = Math.ceil((end - start) / steps)
    const timer = setInterval(() => {
      current = Math.min(current + increment, end)
      setDisplayAge(current)
      if (current >= end) {
        setAnimDone(true)
        clearInterval(timer)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [retirementAge, mode, currentAge])

  const successPct = Math.round((successRate || 0) * 100)

  if (mode === 'find') {
    const isGood = !belowThreshold
    return (
      <div className={`rounded-3xl border-2 p-8 text-center relative overflow-hidden
        ${isGood ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}>
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl ${isGood ? 'bg-indigo-500' : 'bg-amber-500'}`} />
        </div>

        <div className="relative z-10">
          {isGood ? (
            <>
              <p className="text-slate-400 text-base mb-3">
                {firstName ? `Hi ${firstName}!` : 'Based on your plan,'} you can retire at
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-8xl font-black text-white tabular-nums" style={{ lineHeight: 1 }}>
                  {displayAge}
                </span>
                <div className="text-left">
                  <span className="text-2xl font-bold text-indigo-300">🎉</span>
                  <p className="text-indigo-300 font-semibold text-sm">years old</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                That's <strong className="text-white">{yearsToRetirement} years</strong> from now
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-base mb-3">
                {firstName ? `${firstName}, your` : 'Your'} plan needs some work
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-5xl font-black text-amber-400 tabular-nums" style={{ lineHeight: 1 }}>
                  {successPct}%
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                is the highest success rate we could find — below your {Math.round((threshold || 0.85) * 100)}% threshold
              </p>
            </>
          )}

          {/* Confidence meter */}
          <div className="mt-6 max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Monte Carlo confidence</span>
              <span className={`font-bold ${successPct >= 85 ? 'text-emerald-400' : successPct >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                {successPct}% probability
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1500 ${successPct >= 85 ? 'bg-emerald-500' : successPct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${successPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-center">
              Your money will last to age {lifeExpectancy}
            </p>
          </div>

          {/* Timeline */}
          {isGood && (
            <div className="mt-6 flex items-center justify-center gap-0 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mx-auto mb-1" />
                <p className="text-xs text-blue-400 font-semibold">Today</p>
                <p className="text-xs text-slate-500">Age {currentAge}</p>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-indigo-400 mx-auto mb-1 shadow-lg shadow-indigo-500/50" />
                <p className="text-xs text-indigo-300 font-semibold">Retire</p>
                <p className="text-xs text-slate-500">Age {retirementAge}</p>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-500 to-slate-500 mx-2" />
              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-400 font-semibold">Life Exp.</p>
                <p className="text-xs text-slate-500">Age {lifeExpectancy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mode B: target age hero
  const hasGap = gap < 0
  const fmtVal = (v) => {
    if (!v) return `${sym}0`
    const abs = Math.abs(v)
    if (abs >= 1e7) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e7).toFixed(2)}Cr`
    if (abs >= 1e5) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e5).toFixed(2)}L`
    if (abs >= 1e6) return `${v < 0 ? '-' : ''}${sym}${(abs / 1e6).toFixed(2)}M`
    return `${v < 0 ? '-' : ''}${sym}${Math.abs(Math.round(v)).toLocaleString()}`
  }

  return (
    <div className={`rounded-3xl border-2 p-8 relative overflow-hidden
      ${hasGap ? 'border-amber-500/40 bg-amber-500/5' : 'border-emerald-500/40 bg-emerald-500/5'}`}>
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${hasGap ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      </div>

      <div className="relative z-10">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Left: headline */}
          <div>
            <p className="text-slate-400 text-sm mb-3">
              {firstName ? `${firstName}, to` : 'To'} retire at age <strong className="text-white">{retirementAge}</strong>:
            </p>
            <p className="text-slate-300 text-base mb-1">You need</p>
            <p className="text-5xl font-black text-white tabular-nums mb-2">{fmtVal(requiredCorpus)}</p>
            <p className="text-sm text-slate-400">
              You're projected to have{' '}
              <span className={`font-bold ${hasGap ? 'text-amber-400' : 'text-emerald-400'}`}>{fmtVal(projectedCorpus)}</span>
            </p>
          </div>

          {/* Right: gap */}
          <div className={`rounded-2xl border p-5 ${hasGap ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              {hasGap ? 'Gap to Close' : 'Surplus'}
            </p>
            <p className={`text-3xl font-extrabold tabular-nums ${hasGap ? 'text-amber-400' : 'text-emerald-400'}`}>
              {fmtVal(Math.abs(gap))}
            </p>
            <p className="text-xs text-slate-500 mt-1">{gapPercent}% {hasGap ? 'shortfall' : 'ahead of target'}</p>

            {hasGap && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-slate-400 font-semibold">How to close the gap:</p>
                <p className="text-xs text-slate-500">• Increase monthly savings</p>
                <p className="text-xs text-slate-500">• Push target age back by 1-2 years</p>
                <p className="text-xs text-slate-500">• Improve equity allocation</p>
              </div>
            )}
          </div>
        </div>

        {/* Monte Carlo bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Plan success probability ({successPct}%)</span>
            <span className={`font-bold ${successPct >= 80 ? 'text-emerald-400' : successPct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {successPct >= 80 ? 'Strong Plan ✓' : successPct >= 60 ? 'Needs Improvement' : 'High Risk'}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${successPct >= 80 ? 'bg-emerald-500' : successPct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${successPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
