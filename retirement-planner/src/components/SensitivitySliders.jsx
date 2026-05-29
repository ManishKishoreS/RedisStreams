import { useStore } from '../store/useStore.js'

export default function SensitivitySliders() {
  const { profile, income, expenses, setProfile, setExpenses, setAssumptions, assumptions, compute } = useStore()

  const handleChange = (updater) => {
    updater()
    compute()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Sensitivity Analysis</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">Adjust sliders to see real-time impact on your retirement plan.</p>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Retirement Age</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.retirementAge}</span>
        </div>
        <input type="range" min={profile.age + 1} max={profile.age + 15} value={profile.retirementAge}
          onChange={e => handleChange(() => setProfile({ retirementAge: parseInt(e.target.value) }))}
          className="w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{profile.age + 1}</span>
          <span>{profile.age + 15}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Monthly Expenses</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {Math.round(expenses.monthlyExpenses).toLocaleString()}
          </span>
        </div>
        <input type="range"
          min={Math.round(expenses.monthlyExpenses * 0.8)}
          max={Math.round(expenses.monthlyExpenses * 1.2)}
          step={1000}
          value={expenses.monthlyExpenses}
          onChange={e => handleChange(() => setExpenses({ monthlyExpenses: parseFloat(e.target.value) }))}
          className="w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>-20%</span>
          <span>+20%</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Equity Return (%)</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {((assumptions?.equityReturn || 0.10) * 100).toFixed(1)}%
          </span>
        </div>
        <input type="range" min="5" max="18" step="0.5"
          value={((assumptions?.equityReturn || 0.10) * 100)}
          onChange={e => handleChange(() => setAssumptions({ equityReturn: parseFloat(e.target.value) / 100 }))}
          className="w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5%</span>
          <span>18%</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Monthly Savings</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {Math.round(income.monthlySavings || 0).toLocaleString()}
          </span>
        </div>
        <input type="range"
          min={0}
          max={Math.round((income.monthlySavings || 20000) * 2)}
          step={1000}
          value={income.monthlySavings || 0}
          onChange={e => handleChange(() => {
            const { setIncome } = useStore.getState()
            setIncome({ monthlySavings: parseFloat(e.target.value) })
          })}
          className="w-full accent-indigo-600" />
      </div>
    </div>
  )
}
