
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, 
  ComposedChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Shield, HeartPulse, Briefcase, Info, RefreshCw, 
  ChevronRight, AlertCircle, Coins, Banknote, User, GraduationCap,
  History, Trophy, Clock
} from 'lucide-react';

import { CareerType, GameState, YearRecord, SimulationRecord } from './types';
import { 
  STARTING_AGE, RETIREMENT_AGE, STARTING_WEALTH, STARTING_INCOME, CAREER_PROFILES 
} from './constants';
import { simulateYear, calculateUtility, calculateHumanCapital } from './utils/finance';

const LOCAL_STORAGE_KEY = 'lifewealth_history_v1';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [savingsRate, setSavingsRate] = useState(0.2);
  const [stockAllocation, setStockAllocation] = useState(0.8);
  const [bondAllocation, setBondAllocation] = useState(0.1);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<SimulationRecord[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setHistoryRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveRecord = useCallback((finalState: GameState) => {
    const newRecord: SimulationRecord = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      careerType: finalState.careerType,
      finalWealth: finalState.wealth,
      score: Math.max(0, finalState.totalUtility * 10),
      ageReached: finalState.age,
      wasRuin: finalState.wealth <= 0
    };

    const updated = [newRecord, ...historyRecords].slice(0, 10);
    setHistoryRecords(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }, [historyRecords]);

  const startGame = (type: CareerType) => {
    setGameState({
      age: STARTING_AGE,
      wealth: STARTING_WEALTH,
      income: STARTING_INCOME,
      careerType: type,
      history: [{
        age: STARTING_AGE,
        wealth: STARTING_WEALTH,
        income: STARTING_INCOME,
        consumption: STARTING_INCOME * 0.8,
        savings: STARTING_INCOME * 0.2,
        portfolioReturn: 0,
        inflation: 0,
        utility: calculateUtility(STARTING_INCOME * 0.8, STARTING_INCOME * 0.8),
        event: 'Started career'
      }],
      isGameOver: false,
      totalUtility: 0
    });
    setLastEvent('Welcome to your career! Aim for a smooth consumption profile.');
  };

  const nextYear = useCallback(() => {
    if (!gameState || gameState.isGameOver) return;

    const { age, wealth, income, careerType, history } = gameState;
    const sim = simulateYear(careerType, income, stockAllocation, bondAllocation);
    
    const portfolioReturn = 
      (stockAllocation * sim.stockReturn) + 
      (bondAllocation * sim.bondReturn) + 
      ((1 - stockAllocation - bondAllocation) * sim.cashReturn);
    
    const returnsInDollars = wealth * portfolioReturn;
    const savings = income * savingsRate;
    const consumption = income - savings;
    
    const finalWealth = Math.max(0, wealth + returnsInDollars + savings - sim.shockCost);
    const baseConsumption = history[0].consumption;
    const yearUtility = calculateUtility(consumption, baseConsumption);
    
    const newAge = age + 1;
    const isGameOver = newAge >= RETIREMENT_AGE || finalWealth <= 0;

    let eventStr = `Markets: Stocks ${sim.stockReturn > 0 ? 'Up' : 'Down'} (${(sim.stockReturn * 100).toFixed(1)}%)`;
    if (sim.shockOccurred) {
      eventStr += ` | ${sim.shockType === 'HEALTH' ? 'Medical emergency' : 'Layoff'} hit you for $${sim.shockCost.toLocaleString()}!`;
    }

    const newRecord: YearRecord = {
      age: newAge,
      wealth: finalWealth,
      income: sim.newIncome,
      consumption,
      savings,
      portfolioReturn,
      inflation: sim.inflation,
      utility: yearUtility,
      event: eventStr
    };

    setGameState(prev => {
      if (!prev) return null;
      const nextState = {
        ...prev,
        age: newAge,
        wealth: finalWealth,
        income: sim.newIncome,
        history: [...prev.history, newRecord],
        isGameOver,
        totalUtility: prev.totalUtility + yearUtility
      };
      
      if (isGameOver) {
        saveRecord(nextState);
      }
      
      return nextState;
    });
    setLastEvent(eventStr);
  }, [gameState, savingsRate, stockAllocation, bondAllocation, saveRecord]);

  const humanCapital = useMemo(() => {
    if (!gameState) return 0;
    return calculateHumanCapital(gameState.age, gameState.income, gameState.careerType);
  }, [gameState]);

  const totalBalanceSheet = useMemo(() => {
    if (!gameState) return 0;
    return gameState.wealth + humanCapital;
  }, [gameState, humanCapital]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            <header className="mb-12">
              <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                LifeWealth
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl">
                Experience 40 years of financial life in 10 minutes. Learn to smooth consumption, manage human capital, and dodge ruin.
              </p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => startGame(CareerType.STABLE)}
                className="bg-slate-800 hover:bg-slate-700 p-8 rounded-3xl border border-slate-700 transition-all text-left group"
              >
                <div className="mb-4 bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Shield size={28} />
                </div>
                <h2 className="text-2xl font-bold mb-2">The Civil Servant</h2>
                <p className="text-slate-400 text-sm mb-6">{CAREER_PROFILES.STABLE.description}</p>
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full">Bond-like Wages</span>
                  <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full">Safe Early</span>
                </div>
              </button>

              <button 
                onClick={() => startGame(CareerType.CYCLICAL)}
                className="bg-slate-800 hover:bg-slate-700 p-8 rounded-3xl border border-slate-700 transition-all text-left group"
              >
                <div className="mb-4 bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} />
                </div>
                <h2 className="text-2xl font-bold mb-2">The Tech Founder</h2>
                <p className="text-slate-400 text-sm mb-6">{CAREER_PROFILES.CYCLICAL.description}</p>
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full">High Growth</span>
                  <span className="bg-amber-900/50 text-amber-400 px-3 py-1 rounded-full">Correlated Risk</span>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 h-full">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <History size={20} className="text-slate-400" />
                Career History
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {historyRecords.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 italic text-sm">
                    No simulations recorded yet. Complete your first career to track performance.
                  </div>
                ) : (
                  historyRecords.map((rec) => (
                    <div key={rec.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.careerType === CareerType.STABLE ? 'bg-emerald-900/40 text-emerald-400' : 'bg-blue-900/40 text-blue-400'}`}>
                          {rec.careerType}
                        </span>
                        <span className="text-slate-500 text-[10px] flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Utility Score</p>
                          <p className="text-xl font-black text-white">{rec.score.toFixed(0)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Final Wealth</p>
                          <p className={`text-lg font-bold ${rec.wasRuin ? 'text-red-400' : 'text-slate-200'}`}>
                            {rec.wasRuin ? 'RUIN' : `$${rec.finalWealth.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Coins size={20} />
          </div>
          <div>
            <span className="font-bold text-lg block leading-none">LifeWealth</span>
            <span className="text-xs text-slate-500 uppercase tracking-tighter font-semibold">Age {gameState.age} / 65</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500 uppercase font-bold">Net Worth</p>
            <p className="text-xl font-bold text-slate-900">${gameState.wealth.toLocaleString()}</p>
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-slate-500 uppercase font-bold">Annual Income</p>
            <p className="text-xl font-bold text-emerald-600">${gameState.income.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {!gameState.isGameOver && (
             <button 
              onClick={nextYear}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              End Year {gameState.age} <ChevronRight size={18} />
            </button>
           )}
           <button 
            onClick={() => { if(confirm("Restart simulation?")) setGameState(null) }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Wealth Trajectory
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gameState.history}>
                  <defs>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="age" stroke="#94a3b8" />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => `$${val.toLocaleString()}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wealth" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorWealth)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <User size={20} className="text-emerald-500" />
                Human Capital
              </h3>
              <p className="text-sm text-slate-500 mb-6">Present value of future labor income.</p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold">${humanCapital.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${(humanCapital / totalBalanceSheet) * 100}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-slate-400">
                {(humanCapital / totalBalanceSheet * 100).toFixed(0)}% of your Total Wealth
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Banknote size={20} className="text-blue-500" />
                Financial Capital
              </h3>
              <p className="text-sm text-slate-500 mb-6">Liquid investments and cash savings.</p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold">${gameState.wealth.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${(gameState.wealth / totalBalanceSheet) * 100}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-slate-400">
                {(gameState.wealth / totalBalanceSheet * 100).toFixed(0)}% of your Total Wealth
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Consumption vs. Income</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={gameState.history}>
                  <XAxis dataKey="age" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="income" fill="#f1f5f9" stroke="#e2e8f0" strokeDasharray="5 5" />
                  <Line type="stepAfter" dataKey="consumption" stroke="#10b981" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-xs text-slate-600">
                <strong>Strategy Tip:</strong> Life-cycle models suggest you should smooth consumption. 
                Keep the green line steady even if income fluctuates. Extreme volatility lowers your final Utility Score.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Coins size={120} />
            </div>
            
            <h3 className="text-xl font-bold border-b border-slate-700 pb-4">Strategy for Age {gameState.age}</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-400">Savings Rate</label>
                <span className="text-emerald-400 font-bold">{(savingsRate * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.8" step="0.05"
                value={savingsRate}
                onChange={(e) => setSavingsRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-500 italic">
                Saving ${(gameState.income * savingsRate).toLocaleString()} / year
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-slate-400">Stock Allocation</label>
                  <span className="text-blue-400 font-bold">{(stockAllocation * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={stockAllocation}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStockAllocation(val);
                    if (val + bondAllocation > 1) setBondAllocation(1 - val);
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-slate-400">Bond Allocation</label>
                  <span className="text-amber-400 font-bold">{(bondAllocation * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0" max={1 - stockAllocation} step="0.05"
                  value={bondAllocation}
                  onChange={(e) => setBondAllocation(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                <AlertCircle size={14} />
                <span>Allocation: Stocks {(stockAllocation*100).toFixed(0)}% | Bonds {(bondAllocation*100).toFixed(0)}% | Cash {((1-stockAllocation-bondAllocation)*100).toFixed(0)}%</span>
              </div>
              <button 
                onClick={nextYear}
                disabled={gameState.isGameOver}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-900 font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {gameState.isGameOver ? "SIMULATION COMPLETE" : `EXECUTE YEAR ${gameState.age}`}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4">Life Events</h3>
            <div className="space-y-4 h-48 overflow-y-auto pr-2 custom-scrollbar">
              {lastEvent && (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-2xl animate-pulse text-sm font-medium border border-blue-100">
                  {lastEvent}
                </div>
              )}
              {gameState.history.slice(0).reverse().map((record, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 py-1">
                  <span className="text-xs font-bold text-slate-400 shrink-0 mt-1">Age {record.age}</span>
                  <span className="text-xs text-slate-600 line-clamp-2">{record.event}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold mb-2">Lifetime Utility Score</h3>
            <p className="text-xs opacity-70 mb-4">A measure of how well you balanced spending and security.</p>
            <div className="text-4xl font-black">{Math.max(0, gameState.totalUtility * 10).toFixed(0)}</div>
          </div>
        </div>
      </main>

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            {gameState.wealth <= 0 ? (
              <>
                <div className="bg-red-100 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Financial Ruin</h2>
                <p className="text-slate-600 mb-8 text-lg">
                  You ran out of money at age {gameState.age}. The combination of market downturns and shocks exhausted your capital.
                </p>
              </>
            ) : (
              <>
                <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap size={40} />
                </div>
                <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Happy Retirement!</h2>
                <p className="text-slate-600 mb-8 text-lg">
                  You reached age 65 with <span className="font-bold text-emerald-600">${gameState.wealth.toLocaleString()}</span>. 
                  Your performance has been recorded in your Career History.
                </p>
              </>
            )}

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Score</p>
                <p className="text-2xl font-black text-slate-900">{(gameState.totalUtility * 10).toFixed(0)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Career</p>
                <p className="text-sm font-bold text-slate-900">{gameState.careerType}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">End Age</p>
                <p className="text-2xl font-black text-slate-900">{gameState.age}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setGameState(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all"
              >
                Back to Menu
              </button>
              <button 
                onClick={() => startGame(gameState.careerType)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-2xl transition-all"
              >
                Try Same Path Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
