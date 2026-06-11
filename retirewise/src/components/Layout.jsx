import { useStore, WIZARD } from '../store/useStore.js'
import { Btn } from './ui.jsx'

const WIZARD_LABELS = {
  profile: 'Profile', income: 'Income', assets: 'Assets', pensions: 'Pensions',
  lifestyle: 'Lifestyle', goals: 'Goals', risk: 'Risk',
}

const APP_LINKS = [
  ['results', 'Results'], ['dashboard', 'Dashboard'], ['coach', 'AI Coach'],
  ['scenarios', 'Scenario Lab'], ['timeline', 'Timeline'], ['recommendations', 'Actions'],
]

export function NavBar() {
  const { screen, go, account } = useStore()
  const inApp = !['landing', 'quick', ...WIZARD].includes(screen)
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button onClick={() => go('landing')} className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">R</span>
          RetireWise
        </button>
        {inApp && (
          <nav className="hidden gap-1 md:flex">
            {APP_LINKS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  screen === id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
        {account ? (
          <span className="text-sm font-medium text-slate-600">👤 {account.name}</span>
        ) : (
          <Btn variant="secondary" onClick={() => go('register')} className="!py-1.5">
            Save my plan
          </Btn>
        )}
      </div>
    </header>
  )
}

export function Stepper() {
  const { screen, go } = useStore()
  const idx = WIZARD.indexOf(screen)
  if (idx === -1) return null
  return (
    <div className="mb-8 flex items-center gap-1 overflow-x-auto">
      {WIZARD.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <button
            onClick={() => i < idx && go(step)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              i === idx
                ? 'bg-emerald-600 text-white'
                : i < idx
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
            }`}
          >
            {i < idx ? '✓' : i + 1} {WIZARD_LABELS[step]}
          </button>
          {i < WIZARD.length - 1 && <span className="h-px w-3 bg-slate-300" />}
        </div>
      ))}
    </div>
  )
}

export function WizardShell({ title, subtitle, children, nextLabel = 'Continue', nextDisabled }) {
  const { next, back } = useStore()
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Stepper />
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      <div className="mt-10 flex justify-between">
        <Btn variant="ghost" onClick={back}>← Back</Btn>
        <Btn onClick={next} disabled={nextDisabled}>{nextLabel} →</Btn>
      </div>
    </div>
  )
}

export function Disclaimer() {
  return (
    <p className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-400">
      RetireWise provides guidance and education only — not regulated financial advice.
      Projections are estimates based on your assumptions, not guarantees.
    </p>
  )
}
