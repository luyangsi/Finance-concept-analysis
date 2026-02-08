
import React, { useState, useCallback, useMemo } from 'react';
import { AppState, Question, UserResponse, SessionResults, CalibrationBin, ModuleResults } from './types';
import { MODULE_A_COUNT, MODULE_B_COUNT, PROBABILITY_BUCKETS, FALLBACK_QUESTIONS } from './constants';
import { generateDecisionQuestions, analyzeAdaptiveShift } from './services/geminiService';
import QuestionView from './components/QuestionView';
import CalibrationChart from './components/CalibrationChart';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responsesA, setResponsesA] = useState<UserResponse[]>([]);
  const [responsesB, setResponsesB] = useState<UserResponse[]>([]);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(false);

  const startModuleA = async () => {
    setLoading(true);
    const qs = await generateDecisionQuestions(MODULE_A_COUNT, 'A');
    setQuestions(qs.length > 0 ? qs : FALLBACK_QUESTIONS);
    setResponsesA([]);
    setCurrentIndex(0);
    setState(AppState.MODULE_A);
    setLoading(false);
  };

  const calculateModuleResults = (moduleResponses: UserResponse[]): ModuleResults => {
    const rawAccuracy = moduleResponses.filter(r => r.isCorrect).length / moduleResponses.length;
    const brierSum = moduleResponses.reduce((sum, r) => sum + Math.pow(r.probability - (r.isCorrect ? 1 : 0), 2), 0);
    const brierScore = brierSum / moduleResponses.length;

    const bins: CalibrationBin[] = PROBABILITY_BUCKETS.map((edge, i) => {
      const nextEdge = PROBABILITY_BUCKETS[i + 1] || 1.01;
      const binResponses = moduleResponses.filter(r => r.probability >= edge && r.probability < nextEdge);
      if (binResponses.length === 0) return { binLabel: `${(edge * 100).toFixed(0)}%`, meanProbability: edge, observedAccuracy: 0, count: 0 };
      const meanProb = binResponses.reduce((s, r) => s + r.probability, 0) / binResponses.length;
      const obsAcc = binResponses.filter(r => r.isCorrect).length / binResponses.length;
      return { binLabel: `${(edge * 100).toFixed(0)}%`, meanProbability: meanProb, observedAccuracy: obsAcc, count: binResponses.length };
    }).filter(b => b.count > 0);

    const calibrationError = bins.reduce((sum, bin) => sum + (bin.count / moduleResponses.length) * Math.abs(bin.meanProbability - bin.observedAccuracy), 0);

    return { brierScore, rawAccuracy, calibrationError, responses: moduleResponses, bins };
  };

  const handleNextA = (selected: 'A' | 'B', probability: number, rationale: string) => {
    const q = questions[currentIndex];
    const newResp: UserResponse = { questionId: q.id, selectedOption: selected, probability, isCorrect: selected === q.correctOption, timeSpent: 0, rationale };
    const updated = [...responsesA, newResp];
    setResponsesA(updated);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setState(AppState.REFLECTION);
    }
  };

  const startModuleB = async () => {
    setLoading(true);
    const qs = await generateDecisionQuestions(MODULE_B_COUNT, 'B');
    setQuestions(qs.length > 0 ? qs : FALLBACK_QUESTIONS);
    setResponsesB([]);
    setCurrentIndex(0);
    setState(AppState.MODULE_B);
    setLoading(false);
  };

  const handleNextB = async (selected: 'A' | 'B', probability: number, rationale: string) => {
    const q = questions[currentIndex];
    const newResp: UserResponse = { questionId: q.id, selectedOption: selected, probability, isCorrect: selected === q.correctOption, timeSpent: 0, rationale };
    const updated = [...responsesB, newResp];
    setResponsesB(updated);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setLoading(true);
      const m1 = calculateModuleResults(responsesA);
      const m2 = calculateModuleResults(updated);
      const shift = await analyzeAdaptiveShift(m1, m2);
      setResults({ moduleA: m1, moduleB: m2, feedback: '', adaptiveShift: shift });
      setState(AppState.RESULTS);
      setLoading(false);
    }
  };

  const r1Results = useMemo(() => responsesA.length >= MODULE_A_COUNT ? calculateModuleResults(responsesA) : null, [responsesA]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-gauge-high"></i>
            </div>
            <span className="font-bold text-lg tracking-tight">Decision Simulator</span>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {state.replace('_', ' ')}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {state === AppState.START && (
          <div className="text-center max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
            <h1 className="text-5xl font-black mb-6 leading-tight">Mastering Uncertainty.</h1>
            <p className="text-xl text-slate-500 mb-12">
              A behavioral assessment focused on <strong>calibration</strong>, not trivia. 
              Discover how well your confidence signals your accuracy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-2">Module A: Elicitation</h3>
                <p className="text-sm text-slate-400">Establish your baseline calibration over 15 diverse trials.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-2">Module B: Adaptation</h3>
                <p className="text-sm text-slate-400">See your results and adjust. We measure how you update your behavior.</p>
              </div>
            </div>
            <button
              onClick={startModuleA}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl transition-all"
            >
              Begin Behavioral Assessment
            </button>
          </div>
        )}

        {state === AppState.MODULE_A && (
          <QuestionView question={questions[currentIndex]} index={currentIndex} total={questions.length} onNext={handleNextA} />
        )}

        {state === AppState.REFLECTION && r1Results && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
              <h2 className="text-3xl font-black mb-4">Round 1: Initial Calibration</h2>
              <p className="text-slate-500 mb-10 max-w-xl mx-auto">
                Study your calibration curve below. The dotted line represents perfect alignment. 
                Points above mean you were underconfident; points below mean you were overconfident.
              </p>
              
              <CalibrationChart data={r1Results.bins} />

              <div className="mt-12 p-8 bg-blue-50 rounded-2xl text-left border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 uppercase tracking-widest text-sm">Reflection Prompt</h3>
                <p className="text-lg text-blue-800 leading-relaxed italic">
                  "What do you notice about your confidence ranges? If you were to repeat this, how would you report your confidence differently?"
                </p>
              </div>

              <div className="mt-10 flex flex-col items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ready to test your adaptation?</p>
                <button
                  onClick={startModuleB}
                  className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl"
                >
                  Start Round 2: Adaptation Test
                </button>
              </div>
            </div>
          </div>
        )}

        {state === AppState.MODULE_B && (
          <QuestionView question={questions[currentIndex]} index={currentIndex} total={questions.length} onNext={handleNextB} />
        )}

        {state === AppState.RESULTS && results && (
          <div className="space-y-12 pb-20 animate-in fade-in duration-700 print:p-0">
            {/* Header Scoreboard */}
            <div className="bg-slate-900 text-white p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
                  <div>
                    <h2 className="text-4xl font-black mb-2">Final Behavioral Report</h2>
                    <p className="text-slate-400">Evaluation of adaptive calibration shift.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
                    <div className="text-center bg-white/5 p-6 rounded-2xl">
                      <div className="text-3xl font-black">{results.moduleA.brierScore.toFixed(3)}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">R1 Brier</div>
                    </div>
                    <div className="text-center bg-white/5 p-6 rounded-2xl">
                      <div className="text-3xl font-black text-blue-400">{results.moduleB.brierScore.toFixed(3)}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">R2 Brier</div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Round 1 Baseline</h4>
                   <CalibrationChart data={results.moduleA.bins} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <h4 className="text-xs font-black text-blue-400 uppercase mb-4 tracking-widest">Round 2 Adaptive</h4>
                   <CalibrationChart data={results.moduleB.bins} />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <i className="fa-solid fa-brain text-blue-600"></i> Adaptation Analysis
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {results.adaptiveShift}
              </div>
            </div>

            {/* Trial Logs */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Comprehensive Log</h3>
                <button onClick={() => window.print()} className="px-6 py-2 bg-slate-50 text-slate-900 font-bold rounded-lg text-sm border border-slate-200 hover:bg-slate-100">
                  Export PDF Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Round</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Confidence</th>
                      <th className="px-8 py-4">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {results.moduleA.responses.map((r, i) => (
                      <tr key={`a-${i}`} className="hover:bg-slate-50/50">
                        <td className="px-8 py-4 font-bold text-slate-400">Baseline</td>
                        <td className="px-8 py-4">
                          {r.isCorrect ? <span className="text-emerald-600 font-bold">✓ Correct</span> : <span className="text-rose-500 font-bold">✗ Wrong</span>}
                        </td>
                        <td className="px-8 py-4 font-black text-slate-700">{(r.probability * 100).toFixed(0)}%</td>
                        <td className="px-8 py-4 text-slate-500 italic">"{r.rationale}"</td>
                      </tr>
                    ))}
                    {results.moduleB.responses.map((r, i) => (
                      <tr key={`b-${i}`} className="hover:bg-blue-50/30">
                        <td className="px-8 py-4 font-bold text-blue-400">Adaptive</td>
                        <td className="px-8 py-4">
                          {r.isCorrect ? <span className="text-emerald-600 font-bold">✓ Correct</span> : <span className="text-rose-500 font-bold">✗ Wrong</span>}
                        </td>
                        <td className="px-8 py-4 font-black text-slate-700">{(r.probability * 100).toFixed(0)}%</td>
                        <td className="px-8 py-4 text-slate-500 italic">"{r.rationale}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button onClick={() => window.location.reload()} className="text-slate-400 font-bold hover:text-slate-900 transition-colors">
                Reset Simulation
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="font-bold text-slate-900 uppercase tracking-widest text-sm">Analyzing Cognitive Patterns...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
