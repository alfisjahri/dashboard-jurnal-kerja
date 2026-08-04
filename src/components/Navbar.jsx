import React from 'react';
import { Upload, Plus, Download, RotateCcw, Cloud } from 'lucide-react';
import { getSyncConfig } from '../utils/syncService';

export default function Navbar({ onOpenImport, onOpenAdd, onExport, onResetData, onOpenSync, totalCount }) {
  const syncConfig = getSyncConfig();
  const hasSyncConfig = syncConfig.provider !== 'none' || syncConfig.googleSheetsUrl || syncConfig.supabaseUrl;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Brand with Attached Logo Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-lg p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-slate-700">
            <img src="/icon.png" alt="Jurnal Kerja Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Jurnal Kerja
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-medium">
                {totalCount}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Cloud Backup Button */}
          <button
            onClick={onOpenSync}
            title="Cadangkan / Backup Ke Cloud"
            className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5 touch-manipulation relative"
          >
            <Cloud className={`w-4 h-4 ${hasSyncConfig ? 'text-emerald-400' : 'text-sky-400'}`} />
            <span className="hidden sm:inline">Backup</span>
            {hasSyncConfig && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={onResetData}
            title="Reset Sample Data"
            className="p-2 text-slate-400 hover:text-slate-200 active:bg-slate-800 rounded-lg transition touch-manipulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onExport}
            title="Export ke CSV"
            className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5 touch-manipulation"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenImport}
            className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5 touch-manipulation"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>

        </div>

      </div>
    </header>
  );
}
