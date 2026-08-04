import React from 'react';
import { Calendar, ListTodo } from 'lucide-react';
import { getTodayISO } from '../utils/dateHelpers';

export default function SummaryCards({ data, filteredCount }) {
  const today = getTodayISO();
  const total = data.length;
  const todayCount = data.filter(item => item.tanggal === today).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      
      {/* Total Logs */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Kegiatan</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{total} <span className="text-xs font-normal text-slate-500">({filteredCount} tampil)</span></h3>
          </div>
        </div>
      </div>

      {/* Hari Ini */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Kegiatan Hari Ini</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{todayCount}</h3>
          </div>
        </div>
      </div>

    </div>
  );
}
