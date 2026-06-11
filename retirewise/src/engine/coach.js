import { evaluate, sustainableSpend } from './projection.js'
import { fmtMoney } from '../data/countries.js'

// Rule-based coach: parses common retirement questions, re-runs the engine
// for "what if" simulations and explains results in plain language.
// Guidance only — not regulated financial advice.
export function answerQuestion(text, inp, base, ctx) {
  const q = text.toLowerCase()
  const { country } = ctx

  const ageMatch = q.match(/retire (?:at|by) (\d{2})/)
  if (ageMatch) {
    const age = Number(ageMatch[1])
    if (age <= inp.currentAge) return `You're already ${inp.currentAge}, so I can only model retirement ages above that. Try "retire at ${inp.currentAge + 1}" or later.`
    const sim = evaluate({ ...inp, retirementAge: age })
    const dir = sim.score >= base.score ? 'up' : 'down'
    return (
      `If you retire at ${age} instead of ${inp.retirementAge}, your Retirement Safety Score goes ${dir} from ${base.score} to ${sim.score} (${sim.classification.label}). ` +
      (sim.proj.depletionAge
        ? `Your money would last until about age ${sim.proj.depletionAge}.`
        : `Your money is projected to last your whole plan, with about ${fmtMoney(sim.proj.finalBalance, country, { compact: true })} left over.`)
    )
  }

  const saveMatch = q.match(/save|contribut|invest more/)
  if (saveMatch) {
    const extra = Math.round(inp.salary * 0.05)
    const sim = evaluate({ ...inp, annualContribution: inp.annualContribution + extra })
    return `Saving an extra 5% of your salary (about ${fmtMoney(extra, country, { compact: true })}/yr) would lift your score from ${base.score} to ${sim.score}. Doubling that takes it to ${evaluate({ ...inp, annualContribution: inp.annualContribution + extra * 2 }).score}.`
  }

  if (q.includes('withdraw') || q.includes('spend') || q.includes('how much can i')) {
    const safe = sustainableSpend(inp)
    return `Based on your plan, you could sustainably spend about ${fmtMoney(safe, country, { compact: true })} a year (${fmtMoney(safe / 12, country, { compact: true })}/month, today's money) through retirement without running out. You're currently planning for ${fmtMoney(inp.annualExpenses, country, { compact: true })}/yr.`
  }

  if (q.includes('inflation')) {
    const sim = evaluate({ ...inp, inflation: inp.inflation + 1.5 })
    return `Inflation is one of the biggest threats to retirees. If it ran 1.5% hotter than the ${inp.inflation}% you've assumed, your score would move from ${base.score} to ${sim.score}. Holding growth assets and delaying guaranteed income both help.`
  }

  if (q.includes('score') || q.includes('safe')) {
    return `Your Retirement Safety Score is ${base.score}/100 — ${base.classification.label}. ${base.classification.blurb} It measures how far through a plan to age ${inp.lifeExpectancy + 5} your money lasts. The biggest levers: retire later, save more, or plan a leaner lifestyle.`
  }

  if (q.includes('pension')) {
    return `Your ${ctx.statePensionName} is worth about ${fmtMoney(inp.statePensionAnnual, country, { compact: true })}/yr from age ${inp.statePensionAge} in your plan. Guaranteed income like this is gold — it reduces how much your investments need to produce.`
  }

  return (
    `Here's where you stand: score ${base.score}/100 (${base.classification.label}), retiring at ${inp.retirementAge} with a projected pot of ${fmtMoney(base.proj.potAtRetirement, country, { compact: true })}. ` +
    `Try asking me things like "What if I retire at 55?", "What if I save more?", "How much can I spend?" or "What about inflation?"`
  )
}

export const QUICK_QUESTIONS = [
  'What if I retire at 55?',
  'What if I save more?',
  'How much can I spend each year?',
  'What about inflation?',
  'Is my plan safe?',
]
