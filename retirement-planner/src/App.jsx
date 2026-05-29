import { useStore } from './store/useStore.js'
import { ProgressBar } from './components/ProgressBar.jsx'
import { Step1Profile } from './pages/Step1Profile.jsx'
import { Step2Income } from './pages/Step2Income.jsx'
import { Step3Expenses } from './pages/Step3Expenses.jsx'
import { Step4Scenarios } from './pages/Step4Scenarios.jsx'
import Step5Results from './pages/Step5Results.jsx'

const STEPS = [Step1Profile, Step2Income, Step3Expenses, Step4Scenarios, Step5Results]

export default function App() {
  const { currentStep, setStep, darkMode, toggleDarkMode } = useStore()

  const StepComponent = STEPS[currentStep] || Step1Profile

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">🏦</span>
              <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">RetireSmart</span>
              <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500 ml-1">Retirement Planner</span>
            </div>
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <ProgressBar currentStep={currentStep} />
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <StepComponent
              onNext={() => setStep(Math.min(STEPS.length - 1, currentStep + 1))}
              onBack={() => setStep(Math.max(0, currentStep - 1))}
            />
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
          RetireSmart is for educational purposes only. Not financial advice.
        </footer>
      </div>
    </div>
  )
}
