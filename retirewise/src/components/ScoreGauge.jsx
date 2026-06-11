import { classify } from '../engine/projection.js'

const STROKE = { emerald: '#059669', green: '#16a34a', amber: '#d97706', orange: '#ea580c', red: '#dc2626' }

export default function ScoreGauge({ score, size = 200 }) {
  const cls = classify(score)
  const r = 80
  const circumference = Math.PI * r // half circle
  const filled = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 110" width={size} height={size * 0.55}>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={STROKE[cls.color]}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        <text x="100" y="85" textAnchor="middle" fontSize="40" fontWeight="800" fill="#0f172a">
          {score}
        </text>
        <text x="100" y="104" textAnchor="middle" fontSize="11" fill="#64748b">
          out of 100
        </text>
      </svg>
      <span
        className="mt-1 rounded-full px-3 py-1 text-sm font-bold text-white"
        style={{ backgroundColor: STROKE[cls.color] }}
      >
        {cls.label}
      </span>
    </div>
  )
}
