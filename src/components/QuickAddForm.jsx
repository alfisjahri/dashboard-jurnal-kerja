import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { getTodayISO } from '../utils/dateHelpers';

export default function QuickAddForm({ onAdd }) {
  const [tanggal, setTanggal] = useState(getTodayISO());
  const [kegiatan, setKegiatan] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kegiatan.trim()) {
      setError('Kegiatan wajib diisi');
      return;
    }

    const newItem = {
      id: `JRN-${String(Math.floor(100 + Math.random() * 900))}`,
      tanggal: tanggal || getTodayISO(),
      kegiatan: kegiatan.trim()
    };

    onAdd(newItem);
    setKegiatan('');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm dark:shadow-lg transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500"></span>
          Tambah Kegiatan Baru
        </h2>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">Tuliskan deskripsi kegiatan lalu tekan Simpan</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        
        {/* Date Input */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm shrink-0 focus-within:border-indigo-500">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 border-none outline-none text-xs font-medium cursor-pointer"
            required
          />
        </div>

        {/* Activity Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={kegiatan}
            onChange={(e) => { setKegiatan(e.target.value); setError(''); }}
            placeholder="Contoh: Menyelesaikan laporan harian..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 rounded-lg px-3.5 py-2 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition"
          />
          {error && <p className="text-[11px] text-rose-500 absolute left-1 -bottom-4 font-medium">{error}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 shrink-0 touch-manipulation active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Simpan Kegiatan</span>
        </button>

      </form>
    </div>
  );
}
