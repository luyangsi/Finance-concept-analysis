
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, GameRound, UserStats } from './types';
import { analyzeBiases } from './services/geminiService';
import { 
  Trophy, 
  History, 
  BrainCircuit, 
  Coins, 
  Dices, 
  ChevronRight, 
  RefreshCcw,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function App() {
  const [mode, setMode] = useState<GameMode>('coin');
  const [rounds, setRounds] = useState<GameRound[]>([]);
  const [stats, setStats] = useState<UserStats>({ points: 1000, wins: 0, losses: 0, totalBets: 0 });
  const [prediction, setPrediction] = useState<string>('');
  const [bet, setBet] = useState<number>(10);
  const [confidence, setConfidence] = useState<number>(50);
  const [isFlipping, setIsFlipping] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate current streak
  const getCurrentStreak = useCallback(() => {
    if (rounds.length === 0) return { count: 0, type: 'none' };
    let count = 0;
    const lastType = rounds[0].outcome;
    for (const r of rounds) {
      if (r.outcome === lastType) count++;
      else break;
    }
    return { count, type: lastType };
  }, [rounds]);

  const { count: streakCount, type: streakType } = getCurrentStreak();

  const handlePlay = async () => {
    if (!prediction) return;
    setIsFlipping(true);
    setOutcome(null);

    // Simulate delay for animation
    setTimeout(() => {
      const result = mode === 'coin' 
        ? (Math.random() > 0.5 ? 'Heads' : 'Tails')
        : (Math.floor(Math.random() * 6) + 1).toString();
      
      const win = result === prediction;
      const newRound: GameRound = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        mode,
        prediction,
        confidence,
        betAmount: bet,
        outcome: result,
        isWin: win,
        streakBefore: streakCount,
        streakType: streakType
      };

      setRounds(prev => [newRound, ...prev]);
      setStats(prev => ({
        points: win ? prev.points + bet : prev.points - bet,
        wins: win ? prev.wins + 1 : prev.wins,
        losses: win ? prev.losses : prev.losses + 1,
        totalBets: prev.totalBets + bet
      }));
      setOutcome(result);
      setIsFlipping(false);
    }, 1500);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const insight = await analyzeBiases(rounds);
    setAiInsight(insight || '');
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Probability Pilot
          </h1>
          <p className="text-slate-400 text-sm">Quantifying intuition against randomness</p>
        </div>
        
        <div className="flex gap-4">
          <StatCard icon={<Coins className="text-yellow-400" />} label="Points" value={stats.points} />
          <StatCard icon={<Zap className="text-blue-400" />} label="Win Rate" value={`${stats.totalBets > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0) : 0}%`} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Game Controller */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="glass rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
            <div className="flex bg-slate-800 p-1 rounded-xl mb-8">
              <button 
                onClick={() => { setMode('coin'); setPrediction(''); }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${mode === 'coin' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Coins size={18} /> Coin
              </button>
              <button 
                onClick={() => { setMode('dice'); setPrediction(''); }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${mode === 'dice' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Dices size={18} /> Dice
              </button>
            </div>

            {/* Visual Object */}
            <div className={`w-32 h-32 mb-8 flex items-center justify-center ${isFlipping ? 'coin-flip' : ''}`}>
              {mode === 'coin' ? (
                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-2xl font-bold shadow-2xl transition-all duration-300
                  ${outcome === 'Heads' ? 'bg-yellow-500 border-yellow-300' : outcome === 'Tails' ? 'bg-slate-400 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>
                  {outcome || '?'}
                </div>
              ) : (
                <div className={`w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-4xl font-bold shadow-2xl transition-all duration-300
                  ${outcome ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                  {outcome || '?'}
                </div>
              )}
            </div>

            {/* Betting Controls */}
            <div className="w-full space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400 text-center block">Prediction</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {mode === 'coin' ? (
                    ['Heads', 'Tails'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPrediction(opt)}
                        className={`px-6 py-2 rounded-xl border-2 transition-all ${prediction === opt ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-800/50 border-transparent text-slate-400'}`}
                      >
                        {opt}
                      </button>
                    ))
                  ) : (
                    ['1', '2', '3', '4', '5', '6'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPrediction(opt)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${prediction === opt ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-800/50 border-transparent text-slate-400'}`}
                      >
                        {opt}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bet Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="1" 
                      max={stats.points}
                      value={bet} 
                      onChange={(e) => setBet(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold uppercase">pts</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Confidence</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={confidence} 
                      onChange={(e) => setConfidence(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">%</span>
                  </div>
                </div>
              </div>

              <button
                disabled={isFlipping || !prediction || stats.points < bet || bet <= 0}
                onClick={handlePlay}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFlipping ? 'Flipping...' : 'EXECUTE PREDICTION'}
              </button>
            </div>
            
            {streakCount > 1 && (
              <div className="absolute top-4 right-4 animate-pulse flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                <TrendingUp size={14} /> {streakCount} {streakType} STREAK
              </div>
            )}
          </section>

          {/* AI Insight Card */}
          <section className="glass rounded-3xl p-6 border-indigo-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-indigo-400" />
                <h3 className="font-bold text-indigo-100">AI Bias Lab</h3>
              </div>
              <button 
                onClick={runAnalysis}
                disabled={rounds.length < 5 || isAnalyzing}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition disabled:opacity-30"
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
              </button>
            </div>
            {aiInsight ? (
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{aiInsight}"
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <AlertCircle className="text-slate-600" />
                <p className="text-xs text-slate-500 text-center">
                  Perform at least 5 rounds to generate a cognitive bias profile.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Analytics & History */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="glass rounded-3xl p-6 h-[320px]">
            <div className="flex items-center gap-2 mb-6">
              <History className="text-blue-400" />
              <h3 className="font-bold text-slate-100">Confidence vs. Outcome Trends</h3>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...rounds].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="step" 
                    dataKey="betAmount" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass rounded-3xl overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-6 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <History size={18} /> Round History
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium">Prediction</th>
                    <th className="px-4 py-3 font-medium text-center">Conf.</th>
                    <th className="px-4 py-3 font-medium text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {rounds.length > 0 ? rounds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 font-bold ${r.isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.isWin ? <Trophy size={14} /> : <RefreshCcw size={14} />}
                          {r.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{r.prediction}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono text-slate-400">{r.confidence}%</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${r.isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.isWin ? `+${r.betAmount}` : `-${r.betAmount}`}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-20 text-center text-slate-500">
                        No rounds played yet. Step into the arena.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border-slate-800">
      <div className="p-2 bg-slate-800/50 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</div>
        <div className="text-xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
