export const LIFE_EXPECTANCY = { IN: 80, US: 85, UK: 83 }

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

export const COUNTRY_NAMES = { IN: 'India', US: 'United States', UK: 'United Kingdom' }
