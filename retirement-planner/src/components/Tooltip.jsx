import { useState } from 'react'

export function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        aria-label="More info"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-xs font-bold hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >?</button>
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-6 left-0 z-50 w-56 p-2.5 text-xs rounded-xl shadow-2xl pointer-events-none border border-slate-700"
          style={{ background: '#1e293b', color: '#cbd5e1' }}
        >
          {text}
        </span>
      )}
    </span>
  )
}
