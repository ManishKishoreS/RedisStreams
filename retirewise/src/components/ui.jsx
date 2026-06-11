export function Card({ children, className = '', onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        onClick ? 'cursor-pointer transition hover:shadow-md' : ''
      } ${selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'} ${className}`}
    >
      {children}
    </div>
  )
}

export function Btn({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  return (
    <button
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export function NumberInput({ value, onChange, prefix, ...props }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`w-full rounded-xl border border-slate-300 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 ${
          prefix ? 'pl-8 pr-3' : 'px-3'
        }`}
        {...props}
      />
    </div>
  )
}

export function SliderField({ label, value, onChange, min, max, step = 1, format = (v) => v }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-lg font-bold text-emerald-700">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

const BADGE_COLORS = {
  emerald: 'bg-emerald-100 text-emerald-800',
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  slate: 'bg-slate-100 text-slate-700',
}

export function Badge({ color = 'slate', children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_COLORS[color]}`}>
      {children}
    </span>
  )
}

export const levelColor = { Low: 'emerald', Medium: 'amber', High: 'red' }
export const impactColor = { High: 'emerald', Medium: 'amber', Low: 'slate' }
