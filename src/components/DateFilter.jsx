import React from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { getDateRangePresets } from '../utils/dateHelpers';

export default function DateFilter({
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClearFilters
}) {
  const presets = getDateRangePresets();

  const handleApplyPreset = (presetKey) => {
    if (presetKey === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const range = presets[presetKey];
    if (range) {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  };

  const hasActiveFilters = searchTerm || startDate || endDate;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-3 transition-colors shadow-sm">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kegiatan atau ID..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-200 rounded-lg pl-10 pr-8 py-1.5 text-sm transition placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1 text-sm">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 border-none outline-none text-xs"
            title="Dari Tanggal"
          />
          <span className="text-slate-400 text-xs font-medium">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 border-none outline-none text-xs"
            title="Sampai Tanggal"
          />
        </div>

      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Filter Waktu:</span>
          <button
            onClick={() => handleApplyPreset('all')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              !startDate && !endDate
                ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/30 dark:text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => handleApplyPreset('today')}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition"
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleApplyPreset('thisWeek')}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition"
          >
            Minggu Ini
          </button>
          <button
            onClick={() => handleApplyPreset('thisMonth')}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition"
          >
            Bulan Ini
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium flex items-center gap-1 transition"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
