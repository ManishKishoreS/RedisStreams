import { useState } from 'react'

export function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        aria-label="More info"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >?</button>
      {show && (
        <span role="tooltip" className="absolute bottom-6 left-0 z-50 w-56 p-2 text-xs bg-gray-900 text-white rounded-lg shadow-xl pointer-events-none">
          {text}
        </span>
      )}
    </span>
  )
}
