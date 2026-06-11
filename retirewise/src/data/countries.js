// Country-specific defaults: currencies, life expectancy, state pension and
// lifestyle spending presets (annual, in today's money).
export const COUNTRIES = {
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    locale: 'en-GB',
    lifeExpectancy: 87,
    statePensionName: 'State Pension',
    statePensionAge: 67,
    statePensionAnnual: 11960,
    inflation: 2.5,
    defaultSalary: 45000,
    defaultRetirementAge: 66,
    lifestyles: { basic: 18000, comfortable: 32000, luxury: 56000 },
    pensionAccounts: [
      { key: 'workplace', label: 'Workplace pension', hint: 'Defined-contribution pot' },
      { key: 'personal', label: 'SIPP / personal pension', hint: 'Self-invested pension' },
    ],
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    locale: 'en-US',
    lifeExpectancy: 85,
    statePensionName: 'Social Security',
    statePensionAge: 67,
    statePensionAnnual: 22000,
    inflation: 2.5,
    defaultSalary: 70000,
    defaultRetirementAge: 65,
    lifestyles: { basic: 32000, comfortable: 55000, luxury: 100000 },
    pensionAccounts: [
      { key: 'k401', label: '401(k) / 403(b)', hint: 'Employer-sponsored plan' },
      { key: 'ira', label: 'IRA / Roth IRA', hint: 'Individual retirement account' },
    ],
  },
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    locale: 'en-IN',
    lifeExpectancy: 80,
    statePensionName: 'EPS pension',
    statePensionAge: 58,
    statePensionAnnual: 36000,
    inflation: 5.5,
    defaultSalary: 1200000,
    defaultRetirementAge: 60,
    lifestyles: { basic: 360000, comfortable: 720000, luxury: 1500000 },
    pensionAccounts: [
      { key: 'epf', label: 'EPF / PPF', hint: 'Provident fund balance' },
      { key: 'nps', label: 'NPS', hint: 'National Pension System' },
    ],
  },
}

export const RISK_PROFILES = {
  cautious: { label: 'Cautious', preReturn: 4.5, postReturn: 3.5 },
  balanced: { label: 'Balanced', preReturn: 6.0, postReturn: 4.5 },
  adventurous: { label: 'Adventurous', preReturn: 7.5, postReturn: 5.5 },
}

export function fmtMoney(value, country, { compact = false, decimals = 0 } = {}) {
  const c = COUNTRIES[country] ?? COUNTRIES.UK
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : decimals,
  }).format(value)
}
