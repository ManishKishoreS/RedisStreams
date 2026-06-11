// Deterministic annual projection: accumulation to retirement, then drawdown
// to the planning horizon (life expectancy + buffer). All inputs in today's
// money unless noted; expenses and pensions are inflated each year.

export const HORIZON_BUFFER = 5

export function runProjection(inp) {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    liquidAssets,
    annualContribution,
    contributionGrowth = 0, // % p.a., tracks salary growth
    preReturn, // % p.a. nominal, before retirement
    postReturn, // % p.a. nominal, after retirement
    inflation, // % p.a.
    annualExpenses, // desired retirement spending, today's money
    statePensionAnnual = 0, // today's money
    statePensionAge = retirementAge,
    otherRetirementIncome = 0, // today's money, from retirement
    goals = [], // [{ age, cost }] one-off costs in today's money
    sequenceStress = false, // depress returns in first 5 retirement years
  } = inp

  const horizon = lifeExpectancy + HORIZON_BUFFER
  const rows = []
  let balance = liquidAssets
  let contribution = annualContribution
  let depletionAge = null
  let potAtRetirement = 0

  for (let age = currentAge; age <= horizon; age++) {
    const yearsFromNow = age - currentAge
    const inflate = Math.pow(1 + inflation / 100, yearsFromNow)
    const retired = age >= retirementAge
    const goalCost = goals
      .filter((g) => Math.round(g.age) === age)
      .reduce((s, g) => s + g.cost * inflate, 0)

    let income = 0
    let expenses = 0
    if (retired) {
      expenses = annualExpenses * inflate
      if (age >= statePensionAge) income += statePensionAnnual * inflate
      income += otherRetirementIncome * inflate
    }

    let ret = retired ? postReturn : preReturn
    if (sequenceStress && retired && age < retirementAge + 5) ret -= 4
    balance *= 1 + ret / 100

    if (!retired) {
      balance += contribution
      contribution *= 1 + contributionGrowth / 100
    } else {
      balance -= Math.max(0, expenses - income)
    }
    balance -= goalCost

    if (age === retirementAge - 1 || (age === currentAge && retired)) {
      potAtRetirement = Math.max(0, balance)
    }
    if (balance < 0 && depletionAge === null && retired) depletionAge = age
    balance = Math.max(balance, 0)

    rows.push({
      age,
      balance: Math.round(balance),
      expenses: Math.round(expenses),
      income: Math.round(income),
      retired,
    })
  }

  return { rows, depletionAge, finalBalance: balance, potAtRetirement, horizon }
}

// Retirement Safety Score (0-100): how far through the planning horizon the
// money lasts, with bonus headroom for an unspent cushion at the end.
export function computeScore(proj, inp) {
  const { retirementAge, lifeExpectancy, annualExpenses } = inp
  const horizon = lifeExpectancy + HORIZON_BUFFER
  const span = Math.max(1, horizon - retirementAge)

  if (proj.depletionAge === null) {
    const yearsAtHorizon = Math.pow(1 + inp.inflation / 100, horizon - inp.currentAge)
    const cushionYears = proj.finalBalance / Math.max(1, annualExpenses * yearsAtHorizon)
    return Math.min(100, Math.round(90 + Math.min(10, cushionYears * 2)))
  }
  const ratio = (proj.depletionAge - retirementAge) / span
  return Math.max(1, Math.min(89, Math.round(ratio * 88)))
}

export const CLASSIFICATIONS = [
  { min: 85, label: 'Very Safe', color: 'emerald', blurb: 'Your plan comfortably covers your retirement with room to spare.' },
  { min: 70, label: 'Safe', color: 'green', blurb: 'You are on track, with a modest buffer against surprises.' },
  { min: 50, label: 'Moderate Risk', color: 'amber', blurb: 'Workable, but vulnerable to inflation, market dips or living longer.' },
  { min: 30, label: 'High Risk', color: 'orange', blurb: 'Your savings are likely to run out well before the end of retirement.' },
  { min: 0, label: 'Critical', color: 'red', blurb: 'On current course your plan falls significantly short.' },
]

export function classify(score) {
  return CLASSIFICATIONS.find((c) => score >= c.min) ?? CLASSIFICATIONS.at(-1)
}

// Largest sustainable annual spend (today's money) that lasts to the horizon.
export function sustainableSpend(inp) {
  let lo = 0
  let hi = Math.max(inp.annualExpenses * 4, inp.liquidAssets, 10000)
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    const proj = runProjection({ ...inp, annualExpenses: mid })
    if (proj.depletionAge === null) lo = mid
    else hi = mid
  }
  return lo
}

export function evaluate(inp) {
  const proj = runProjection(inp)
  const score = computeScore(proj, inp)
  return { proj, score, classification: classify(score) }
}
