import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MonthlyTrendItem } from '../../services/analyticsService';
import { formatRupiah } from '../../utils/formatters';

export const RevenueTrendChart: React.FC<{ data: MonthlyTrendItem[] }> = ({ data }) => {
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          <p className="text-emerald-400 font-extrabold text-sm">
            {formatRupiah(payload[0].value)}
          </p>
          <p className="text-slate-400 mt-1">
            Total Kalkulasi: <span className="text-white font-semibold">{payload[0].payload.calculationsCount}</span>
          </p>
          <p className="text-slate-400">
            Rata-rata Margin: <span className="text-white font-semibold">{payload[0].payload.avgMargin}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
          />
          <Tooltip content={customTooltip} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#16a34a"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
