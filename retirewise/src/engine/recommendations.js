import { evaluate } from './projection.js'
import { fmtMoney } from '../data/countries.js'

const IMPACT_RANK = { High: 2, Medium: 1, Low: 0 }
const EFFORT_RANK = { Low: 0, Medium: 1, High: 2 }

function impactFromDelta(delta) {
  if (delta >= 8) return 'High'
  if (delta >= 3) return 'Medium'
  return 'Low'
}

// Generate candidate actions, re-run the engine to measure each one's real
// effect on the Safety Score, then rank by impact (desc) and effort (asc).
export function buildRecommendations(inp, baseScore, ctx) {
  const { country, lifestyle, lifestyles, cash, liabilities, statePensionFraction } = ctx
  const recs = []

  const tryAction = (changes, meta) => {
    const { score } = evaluate({ ...inp, ...changes })
    const delta = score - baseScore
    if (delta > 0 || meta.alwaysShow) {
      recs.push({ ...meta, delta: Math.max(0, delta), impact: meta.impact ?? impactFromDelta(delta) })
    }
  }

  tryAction(
    { retirementAge: inp.retirementAge + 2, lifeExpectancy: inp.lifeExpectancy },
    {
      key: 'delay',
      title: `Retire 2 years later (at ${inp.retirementAge + 2})`,
      body: 'Two extra earning years mean more contributions, more growth and a shorter retirement to fund.',
      effort: 'Medium',
    }
  )

  const extra = Math.round(inp.salary * 0.05)
  tryAction(
    { annualContribution: inp.annualContribution + extra },
    {
      key: 'save-more',
      title: `Save an extra 5% of salary (${fmtMoney(extra, country, { compact: true })}/yr)`,
      body: 'Raising contributions is the most direct lever you control. Salary sacrifice or employer matching makes it cheaper.',
      effort: 'Medium',
    }
  )

  tryAction(
    { preReturn: inp.preReturn + 0.75, postReturn: inp.postReturn + 0.5 },
    {
      key: 'allocation',
      title: 'Review your investment mix',
      body: 'Moving idle cash into diversified, low-cost funds could add ~0.75% a year in expected growth.',
      effort: 'Low',
    }
  )

  if (lifestyle !== 'basic') {
    const lower = lifestyle === 'luxury' ? 'comfortable' : 'basic'
    tryAction(
      { annualExpenses: lifestyles[lower] },
      {
        key: 'lifestyle',
        title: `Plan a ${lower} lifestyle instead`,
        body: `Trimming target spending to ${fmtMoney(lifestyles[lower], country, { compact: true })}/yr makes your savings last much longer.`,
        effort: 'High',
      }
    )
  }

  if (statePensionFraction < 100) {
    tryAction(
      { statePensionAnnual: inp.statePensionAnnual / Math.max(0.01, statePensionFraction / 100) },
      {
        key: 'state-pension',
        title: 'Top up your state pension entitlement',
        body: 'Filling gaps in your contribution record is one of the best-value retirement purchases available.',
        effort: 'Low',
      }
    )
  }

  const monthsCash = (cash / Math.max(1, inp.annualExpenses)) * 12
  if (monthsCash < 6) {
    recs.push({
      key: 'emergency',
      title: 'Build a 6-month emergency fund',
      body: 'A cash buffer stops you selling investments at the worst moment when life happens.',
      effort: 'Medium',
      impact: 'Medium',
      delta: 0,
    })
  }

  if (liabilities > 0) {
    recs.push({
      key: 'debt',
      title: 'Clear expensive debt before retirement',
      body: `You carry ${fmtMoney(liabilities, country, { compact: true })} of debt. Entering retirement debt-free cuts your required income substantially.`,
      effort: 'Medium',
      impact: 'Medium',
      delta: 0,
    })
  }

  return recs.sort(
    (a, b) =>
      IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact] ||
      b.delta - a.delta ||
      EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort]
  )
}
