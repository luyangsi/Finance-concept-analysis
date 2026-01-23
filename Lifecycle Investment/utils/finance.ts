
import { MARKET_DYNAMICS, CAREER_PROFILES } from '../constants';
import { CareerType, SimulationParams } from '../types';

/**
 * Standard Normal Random (Box-Muller)
 */
export const randn = (): number => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const calculateUtility = (consumption: number, inflationAdjustedBase: number): number => {
  if (consumption <= 0) return -100; // Severe penalty for zero consumption
  // Log utility provides diminishing returns (consumption smoothing incentive)
  return Math.log(consumption / inflationAdjustedBase);
};

export const simulateYear = (
  careerType: CareerType,
  currentIncome: number,
  stockWeight: number,
  bondWeight: number
): SimulationParams & { newIncome: number } => {
  const cashWeight = 1 - stockWeight - bondWeight;
  
  // Market returns
  const stockRet = MARKET_DYNAMICS.STOCKS.mean + MARKET_DYNAMICS.STOCKS.std * randn();
  const bondRet = MARKET_DYNAMICS.BONDS.mean + MARKET_DYNAMICS.BONDS.std * randn();
  const cashRet = MARKET_DYNAMICS.CASH.mean + MARKET_DYNAMICS.CASH.std * randn();
  const inflation = MARKET_DYNAMICS.INFLATION.mean + MARKET_DYNAMICS.INFLATION.std * randn();

  // Wage growth logic
  const profile = CAREER_PROFILES[careerType];
  const marketFactor = stockRet * profile.marketCorrelation;
  const idiosyncraticFactor = profile.volatility * randn();
  const wageGrowth = profile.wageGrowth + marketFactor + idiosyncraticFactor;
  const newIncome = currentIncome * (1 + wageGrowth);

  // Shocks
  let shockType: 'HEALTH' | 'EMPLOYMENT' | 'NONE' = 'NONE';
  let shockCost = 0;
  const rand = Math.random();
  
  if (rand < 0.05) {
    shockType = 'HEALTH';
    shockCost = currentIncome * 0.2;
  } else if (rand < 0.08) {
    shockType = 'EMPLOYMENT';
    shockCost = currentIncome * 0.4;
  }

  return {
    stockReturn: stockRet,
    bondReturn: bondRet,
    cashReturn: cashRet,
    inflation,
    shockOccurred: shockType !== 'NONE',
    shockType,
    shockCost,
    newIncome
  };
};

export const calculateHumanCapital = (
  age: number,
  income: number,
  careerType: CareerType
): number => {
  const yearsLeft = Math.max(0, 65 - age);
  const discountRate = 0.04; // Conservative discount
  const growthRate = CAREER_PROFILES[careerType].wageGrowth;
  
  // Present value of an annuity formula for rough HC estimation
  if (yearsLeft === 0) return 0;
  const r = discountRate - growthRate;
  if (r === 0) return income * yearsLeft;
  return income * (1 - Math.pow((1 + growthRate) / (1 + discountRate), yearsLeft)) / r;
};
