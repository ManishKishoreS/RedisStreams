import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { Btn, Card, Field } from '../components/ui.jsx'

const BENEFITS = [
  ['💾', 'Save & resume', 'Your plan persists across devices and sessions.'],
  ['📈', 'Track your score', 'See how your Safety Score changes over time.'],
  ['🔔', 'Smart alerts', 'Get notified if your retirement safety deteriorates.'],
  ['🧪', 'Advanced planning', 'Unlock deeper scenarios and detailed reports.'],
]

export default function Register() {
  const { go, register, account } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  if (account) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">You're all set, {account.name}!</h1>
        <p className="mt-2 text-slate-500">
          Your plan is saved and your Safety Score is now being tracked over time.
        </p>
        <Btn onClick={() => go('dashboard')} className="mt-8 !px-8 !py-3">
          Go to my dashboard →
        </Btn>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Keep your plan safe</h1>
          <p className="mt-2 text-slate-500">
            Everything you've done so far stays on this device only. Register free to save it.
          </p>
          <div className="mt-6 space-y-4">
            {BENEFITS.map(([icon, title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="!p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim() && email.includes('@')) register({ name: name.trim(), email })
            }}
            className="space-y-5"
          >
            <Field label="Your name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500"
              />
            </Field>
            <Btn type="submit" className="w-full !py-3">Create free account</Btn>
            <p className="text-center text-xs text-slate-400">
              No spam, no card details. Continue as a guest any time — just note your plan clears when the browser session ends.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
