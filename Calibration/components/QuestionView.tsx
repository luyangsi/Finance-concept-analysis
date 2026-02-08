
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface Props {
  question: Question;
  index: number;
  total: number;
  onNext: (selected: 'A' | 'B', probability: number, rationale: string) => void;
}

const QuestionView: React.FC<Props> = ({ question, index, total, onNext }) => {
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);
  const [probability, setProbability] = useState<number>(0.7);
  const [rationale, setRationale] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
    setSelected(null);
    setProbability(0.7);
    setRationale('');
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected && rationale.trim()) {
      onNext(selected, probability, rationale);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-blue-50 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">
          {question.category}
        </span>
        <span className="text-gray-400 text-sm font-medium">Task {index + 1} of {total}</span>
      </div>

      <h2 className="text-2xl font-bold mb-8 text-gray-900 leading-tight">
        {question.text}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setSelected('A')}
          className={`p-5 rounded-xl border-2 transition-all duration-200 text-lg font-semibold ${
            selected === 'A'
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
              : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
          }`}
        >
          {question.optionA}
        </button>
        <button
          type="button"
          onClick={() => setSelected('B')}
          className={`p-5 rounded-xl border-2 transition-all duration-200 text-lg font-semibold ${
            selected === 'B'
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
              : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
          }`}
        >
          {question.optionB}
        </button>
      </div>

      {selected && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Report Confidence</label>
              <span className="text-3xl font-black text-blue-600">{(probability * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={probability}
              onChange={(e) => setProbability(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              <span>Guessing (50%)</span>
              <span>Certain (100%)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">
              One-Sentence Rationale
            </label>
            <input
              type="text"
              placeholder="e.g., 'Intuitive guess based on city latitude comparison'"
              value={rationale}
              required
              onChange={(e) => setRationale(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-white bg-white text-slate-800 placeholder-slate-300 shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
            />
            <p className="mt-2 text-[10px] text-slate-400 italic">Explain your reasoning briefly to support behavioral analysis.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.98]"
          >
            Submit Response
          </button>
        </form>
      )}
    </div>
  );
};

export default QuestionView;
