import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SalesLeaderboardItem } from '../../services/analyticsService';
import { formatRupiah } from '../../utils/formatters';

const BAR_COLORS = ['#16a34a', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'];

export const SalesLeaderboardChart: React.FC<{ data: SalesLeaderboardItem[] }> = ({ data }) => {
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: SalesLeaderboardItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
          <p className="font-bold text-slate-200 mb-1">{item.sales}</p>
          <p className="text-emerald-400 font-extrabold text-sm">{formatRupiah(item.totalRevenue)}</p>
          <p className="text-slate-400 mt-1">
            Total SPH Deal: <span className="text-white font-semibold">{item.totalSPHDeal}</span>
          </p>
          <p className="text-slate-400">
            Total Hitungan: <span className="text-white font-semibold">{item.totalCalculations}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
          />
          <YAxis
            type="category"
            dataKey="sales"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            width={85}
          />
          <Tooltip content={customTooltip} />
          <Bar dataKey="totalRevenue" radius={[0, 8, 8, 0]} barSize={22}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
