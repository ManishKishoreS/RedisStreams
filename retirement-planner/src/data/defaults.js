export const LIFE_EXPECTANCY = { IN: 80, US: 82, UK: 82 }

// Gender-specific life expectancy: [male, female]
export const LIFE_EXPECTANCY_GENDER = {
  IN: { male: 78, female: 81, other: 80 },
  US: { male: 76, female: 81, other: 79 },
  UK: { male: 79, female: 83, other: 81 },
}

export const DEFAULT_RETURNS = {
  equity: 0.10,
  debt: 0.07,
  IN_equity: 0.12,
}

export const DEFAULT_INFLATION = {
  IN: { general: 0.06, medical: 0.13 },
  US: { general: 0.03, medical: 0.05 },
  UK: { general: 0.025, medical: 0.04 },
}

export const TAX_BRACKETS = {
  IN: {
    new: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 0.05 },
      { min: 700000, max: 1000000, rate: 0.10 },
      { min: 1000000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: Infinity, rate: 0.30 },
    ],
    old: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: Infinity, rate: 0.30 },
    ],
  },
  US: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182150, rate: 0.24 },
    { min: 182150, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ],
  UK: [
    { min: 0, max: 12570, rate: 0 },
    { min: 12570, max: 50270, rate: 0.20 },
    { min: 50270, max: 125140, rate: 0.40 },
    { min: 125140, max: Infinity, rate: 0.45 },
  ],
}

export const CURRENCY_SYMBOLS = { IN: '₹', US: '$', UK: '£' }
export const CURRENCY_NAMES = { IN: 'INR', US: 'USD', UK: 'GBP' }

export const COUNTRY_NAMES = { IN: 'India', US: 'United States', UK: 'United Kingdom' }

// Smart defaults for life events by country
export const EDUCATION_COST_DEFAULTS = { IN: 2500000, US: 150000, UK: 80000 }
export const WEDDING_COST_DEFAULTS = { IN: 2000000, US: 30000, UK: 25000 }
export const PARENT_CARE_MONTHLY = { IN: 15000, US: 3000, UK: 2500 }

// Exchange rates (approximate, user can override)
export const DEFAULT_EXCHANGE_RATES = {
  'IN-US': 83,   // 1 USD = 83 INR
  'US-IN': 83,
  'IN-UK': 105,  // 1 GBP = 105 INR
  'UK-IN': 105,
  'US-UK': 0.79, // 1 GBP = 1/0.79 USD
  'UK-US': 1.27,
}
