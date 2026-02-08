
import React from 'react';
import { 
  ComposedChart, 
  Line, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { CalibrationBin } from '../types';

interface Props {
  data: CalibrationBin[];
}

const CalibrationChart: React.FC<Props> = ({ data }) => {
  // Add a 0,0 and 1,1 point for the ideal line
  const idealLine = [
    { x: 0.5, y: 0.5 },
    { x: 1.0, y: 1.0 }
  ];

  const chartData = data.map(bin => ({
    x: bin.meanProbability,
    y: bin.observedAccuracy,
    z: bin.count,
    label: bin.binLabel
  }));

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-center">Calibration Curve</h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Forecast Probability" 
            domain={[0.5, 1.0]} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            label={{ value: 'Confidence', position: 'bottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Actual Accuracy" 
            domain={[0, 1.0]} 
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number, name: string) => {
              if (name === 'Actual Accuracy') return `${(value * 100).toFixed(1)}%`;
              if (name === 'Forecast Probability') return `${(value * 100).toFixed(1)}%`;
              return value;
            }}
          />
          <Legend />
          
          {/* Ideal line */}
          <Line 
            data={idealLine} 
            type="monotone" 
            dataKey="y" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
            activeDot={false}
            name="Perfect Calibration"
          />

          {/* Actual data points */}
          <Scatter 
            name="Your Results" 
            data={chartData} 
            fill="#3b82f6"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.y > entry.x ? '#10b981' : '#ef4444'} 
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500 italic">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div> Overconfident
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Underconfident
        </span>
      </div>
    </div>
  );
};

export default CalibrationChart;
