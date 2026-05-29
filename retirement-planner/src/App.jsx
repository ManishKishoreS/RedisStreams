import { useStore } from './store/useStore.js'
import { ProgressBar } from './components/ProgressBar.jsx'
import { Step1Profile } from './pages/Step1Profile.jsx'
import { Step2Family } from './pages/Step2Family.jsx'
import { Step3Income } from './pages/Step3Income.jsx'
import { Step4Expenses } from './pages/Step4Expenses.jsx'
import { Step5Goal } from './pages/Step5Goal.jsx'
import Step6Results from './pages/Step6Results.jsx'

const STEPS = [Step1Profile, Step2Family, Step3Income, Step4Expenses, Step5Goal, Step6Results]

export default function App() {
  const { currentStep, setStep } = useStore()

  const StepComponent = STEPS[currentStep] || Step1Profile

  return (
    <div className="min-h-screen bg-slate-900" style={{ background: '#0f172a' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">RetireSmart</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2">Retirement Planner</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ProgressBar currentStep={currentStep} />
        <div className="animate-fade-in">
          <StepComponent
            onNext={() => setStep(Math.min(STEPS.length - 1, currentStep + 1))}
            onBack={() => setStep(Math.max(0, currentStep - 1))}
          />
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-600">
        RetireSmart is for educational purposes only. Not financial advice.
      </footer>
    </div>
  )
}
