export function ScoreGauge({ score, successRate }) {
  const safeScore = Math.max(0, Math.min(100, score || 0))
  const label = safeScore >= 75 ? 'On Track' : safeScore >= 50 ? 'Needs Attention' : 'At Risk'
  const labelColor = safeScore >= 75 ? '#10b981' : safeScore >= 50 ? '#f59e0b' : '#ef4444'

  // SVG semicircle gauge: 180 degrees, center (100, 100), radius 80
  const cx = 100
  const cy = 100
  const r = 80
  const strokeWidth = 14

  // Arc helpers: start at 180° (left), end at 0° (right), going counterclockwise = upward
  const toRad = (deg) => (deg * Math.PI) / 180
  const polarToCartesian = (angle) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  })

  // Full arc from 180° to 0° (top semicircle)
  const arcStart = polarToCartesian(180)
  const arcEnd = polarToCartesian(0)

  // Needle angle: maps score 0→100 to angle 180°→0°
  const needleAngle = 180 - (safeScore / 100) * 180
  const needleEnd = polarToCartesian(needleAngle)

  // Color segments
  // Red: 0-40% → 180° to 108°
  // Amber: 40-70% → 108° to 54°
  // Green: 70-100% → 54° to 0°
  const seg1End = polarToCartesian(108) // 40%
  const seg2End = polarToCartesian(54)  // 70%

  const arcPath = (startAngle, endAngle, color) => {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
    return (
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    )
  }

  // Score indicator dot on arc
  const scoreDot = polarToCartesian(needleAngle)

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5 flex flex-col items-center">
      <svg viewBox="30 20 140 90" className="w-full max-w-[200px]" aria-label={`Retirement score: ${safeScore}`}>
        {/* Background arc */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Red segment: 180° → 108° */}
        {arcPath(180, 108, '#ef4444')}
        {/* Amber segment: 108° → 54° */}
        {arcPath(108, 54, '#f59e0b')}
        {/* Green segment: 54° → 0° */}
        {arcPath(54, 0, '#10b981')}

        {/* Score indicator dot */}
        <circle
          cx={scoreDot.x}
          cy={scoreDot.y}
          r="8"
          fill={labelColor}
          stroke="#0f172a"
          strokeWidth="3"
          style={{ filter: `drop-shadow(0 0 6px ${labelColor})` }}
        />

        {/* Score number */}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="22" fontWeight="800" fill={labelColor} fontFamily="Inter, sans-serif" className="tabular-nums">
          {safeScore}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>

      <p className="text-base font-bold mt-1" style={{ color: labelColor }}>{label}</p>
      <p className="text-xs text-slate-500 text-center mt-1">
        Monte Carlo: <span className="font-semibold text-slate-300">{(successRate * 1).toFixed(0)}%</span> success
      </p>
    </div>
  )
}
