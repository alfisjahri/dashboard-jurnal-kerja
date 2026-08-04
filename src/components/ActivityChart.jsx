import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { formatDateShort } from '../utils/dateHelpers';

const CATEGORY_COLORS = ['#6366f1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#64748B'];

export default function ActivityChart({ data }) {
  // Aggregate activities count by date
  const dateMap = {};
  data.forEach((item) => {
    const d = item.tanggal;
    dateMap[d] = (dateMap[d] || 0) + 1;
  });

  const chartDataByDate = Object.keys(dateMap)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-10) // Show last 10 active dates
    .map((dateStr) => ({
      date: formatDateShort(dateStr),
      count: dateMap[dateStr]
    }));

  // Aggregate by Category
  const categoryMap = {};
  data.forEach((item) => {
    const cat = item.kategori || 'Umum';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categoryData = Object.keys(categoryMap).map((catName) => ({
    name: catName,
    value: categoryMap[catName]
  }));

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Chart 1: Daily Activity Trend */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>Tren Jumlah Kegiatan per Hari</span>
          <span className="text-xs font-normal text-slate-400">10 Hari Terakhir</span>
        </h3>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar dataKey="count" name="Jumlah Kegiatan" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <h3 className="text-sm font-bold text-white mb-2">Distribusi Kategori</h3>
        
        <div className="h-44 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="mt-2 flex flex-wrap gap-2 justify-center max-h-16 overflow-y-auto">
          {categoryData.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              ></span>
              <span>{cat.name} ({cat.value})</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
