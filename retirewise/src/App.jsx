import { useStore } from './store/useStore.js'
import { NavBar, Disclaimer } from './components/Layout.jsx'
import Landing from './screens/Landing.jsx'
import QuickCheck from './screens/QuickCheck.jsx'
import Profile from './screens/wizard/Profile.jsx'
import Income from './screens/wizard/Income.jsx'
import Assets from './screens/wizard/Assets.jsx'
import Pensions from './screens/wizard/Pensions.jsx'
import Lifestyle from './screens/wizard/Lifestyle.jsx'
import Goals from './screens/wizard/Goals.jsx'
import Risk from './screens/wizard/Risk.jsx'
import Results from './screens/Results.jsx'
import Coach from './screens/Coach.jsx'
import ScenarioLab from './screens/ScenarioLab.jsx'
import Timeline from './screens/Timeline.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Recommendations from './screens/Recommendations.jsx'
import Register from './screens/Register.jsx'

const SCREENS = {
  landing: Landing,
  quick: QuickCheck,
  profile: Profile,
  income: Income,
  assets: Assets,
  pensions: Pensions,
  lifestyle: Lifestyle,
  goals: Goals,
  risk: Risk,
  results: Results,
  coach: Coach,
  scenarios: ScenarioLab,
  timeline: Timeline,
  dashboard: Dashboard,
  recommendations: Recommendations,
  register: Register,
}

export default function App() {
  const screen = useStore((s) => s.screen)
  const Screen = SCREENS[screen] ?? Landing
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <Screen />
      </main>
      <Disclaimer />
    </div>
  )
}
