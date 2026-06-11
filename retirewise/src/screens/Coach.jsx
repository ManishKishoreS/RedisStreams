import { useRef, useState, useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { COUNTRIES } from '../data/countries.js'
import { answerQuestion, QUICK_QUESTIONS } from '../engine/coach.js'
import { usePlan } from './Results.jsx'
import { Btn } from '../components/ui.jsx'

export default function Coach() {
  const { profile } = useStore()
  const { inp, base } = usePlan()
  const c = COUNTRIES[profile.country]
  const [messages, setMessages] = useState([
    {
      role: 'coach',
      text: `Hi! I'm your retirement coach. Your Safety Score is ${base.score}/100 (${base.classification.label}). Ask me anything about your plan — I can simulate "what ifs" instantly.`,
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ask = (text) => {
    if (!text.trim()) return
    const reply = answerQuestion(text, inp, base, {
      country: profile.country,
      statePensionName: c.statePensionName,
    })
    setMessages((m) => [...m, { role: 'user', text }, { role: 'coach', text: reply }])
    setInput('')
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <h1 className="text-2xl font-extrabold text-slate-900">🤖 AI Coach</h1>
      <p className="text-sm text-slate-400">Guidance only — not regulated financial advice.</p>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:border-emerald-500"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try "What if I retire at 58?"'
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500"
        />
        <Btn type="submit">Ask</Btn>
      </form>
    </div>
  )
}
