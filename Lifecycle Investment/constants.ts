
export const STARTING_AGE = 25;
export const RETIREMENT_AGE = 65;
export const STARTING_WEALTH = 20000;
export const STARTING_INCOME = 50000;

export const MARKET_DYNAMICS = {
  STOCKS: { mean: 0.08, std: 0.18 },
  BONDS: { mean: 0.03, std: 0.05 },
  CASH: { mean: 0.01, std: 0.01 },
  INFLATION: { mean: 0.02, std: 0.015 },
};

export const CAREER_PROFILES = {
  STABLE: {
    wageGrowth: 0.02,
    volatility: 0.05,
    marketCorrelation: 0.1,
    description: "Low volatility, bond-like wages. Good for higher equity risk.",
  },
  CYCLICAL: {
    wageGrowth: 0.04,
    volatility: 0.15,
    marketCorrelation: 0.7,
    description: "High growth potential but moves with the stock market.",
  }
};
