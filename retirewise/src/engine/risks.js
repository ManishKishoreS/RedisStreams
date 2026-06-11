import { evaluate } from './projection.js'

const LEVELS = { Low: 0, Medium: 1, High: 2 }

function levelFromDrop(drop) {
  if (drop >= 15) return 'High'
  if (drop >= 6) return 'Medium'
  return 'Low'
}

// Stress-test the plan along the four risk dimensions from the requirements:
// longevity, inflation, sequence-of-returns and liquidity.
export function assessRisks(inp, baseScore) {
  const risks = []

  const longevity = evaluate({ ...inp, lifeExpectancy: inp.lifeExpectancy + 8 })
  risks.push({
    key: 'longevity',
    name: 'Longevity risk',
    level: levelFromDrop(baseScore - longevity.score),
    detail: `If you live 8 years longer than expected your score moves from ${baseScore} to ${longevity.score}.`,
  })

  const hotInflation = evaluate({ ...inp, inflation: inp.inflation + 1.5 })
  risks.push({
    key: 'inflation',
    name: 'Inflation risk',
    level: levelFromDrop(baseScore - hotInflation.score),
    detail: `With inflation 1.5% higher for the whole plan, your score moves from ${baseScore} to ${hotInflation.score}.`,
  })

  const sequence = evaluate({ ...inp, sequenceStress: true })
  risks.push({
    key: 'sequence',
    name: 'Sequence-of-returns risk',
    level: levelFromDrop(baseScore - sequence.score),
    detail: `A weak market in your first 5 retirement years moves your score from ${baseScore} to ${sequence.score}.`,
  })

  const monthsCash = (inp.cash / Math.max(1, inp.annualExpenses)) * 12
  risks.push({
    key: 'liquidity',
    name: 'Liquidity risk',
    level: monthsCash >= 6 ? 'Low' : monthsCash >= 3 ? 'Medium' : 'High',
    detail: `You hold roughly ${monthsCash.toFixed(0)} months of spending in cash. Aim for at least 6 months.`,
  })

  return risks.sort((a, b) => LEVELS[b.level] - LEVELS[a.level])
}
