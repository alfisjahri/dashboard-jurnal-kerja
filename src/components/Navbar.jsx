import React, { useState, useEffect } from 'react';
import { Upload, Plus, Download, RotateCcw, Cloud, Smartphone, Menu, X } from 'lucide-react';
import { getSyncConfig } from '../utils/syncService';

export default function Navbar({ onOpenImport, onOpenAdd, onExport, onResetData, onOpenSync, totalCount }) {
  const syncConfig = getSyncConfig();
  const hasSyncConfig = syncConfig.provider !== 'none' || syncConfig.googleSheetsUrl || syncConfig.supabaseUrl;

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand with Logo */}
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

        {/* 📱 MOBILE QUICK HEADER (<640px) */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={onOpenAdd}
            className="px-3 py-1.5 bg-indigo-600 active:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 active:bg-slate-800 rounded-lg border border-slate-700/80 transition touch-manipulation relative"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {hasSyncConfig && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1"></span>
            )}
          </button>
        </div>

        {/* 💻 DESKTOP ACTIONS (>=640px) */}
        <div className="hidden sm:flex items-center gap-2">
          
          {deferredPrompt && (
            <button
              onClick={handleInstallPWA}
              title="Install Aplikasi ke HP"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 touch-manipulation animate-pulse"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={onOpenSync}
            title="Cadangkan / Backup Ke Cloud"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5 touch-manipulation relative"
          >
            <Cloud className={`w-4 h-4 ${hasSyncConfig ? 'text-emerald-400' : 'text-sky-400'}`} />
            <span>Backup</span>
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
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5 touch-manipulation"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenImport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5 touch-manipulation"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>

        </div>

      </div>

      {/* 📱 MOBILE DROPDOWN DRAWER (<640px) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-900/95 p-3 space-y-2 animate-fade-in shadow-2xl">
          
          {deferredPrompt && (
            <button
              onClick={() => { handleInstallPWA(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install Aplikasi Ke HP</span>
            </button>
          )}

          <button
            onClick={() => { onOpenSync(); setMobileMenuOpen(false); }}
            className="w-full py-2.5 px-3 bg-slate-800 active:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-between border border-slate-700/80"
          >
            <div className="flex items-center gap-2">
              <Cloud className={`w-4 h-4 ${hasSyncConfig ? 'text-emerald-400' : 'text-sky-400'}`} />
              <span>Backup Cloud (Google Sheets / Supabase)</span>
            </div>
            {hasSyncConfig && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold">Aktif</span>}
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { onOpenImport(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 bg-slate-800 active:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700/80"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => { onExport(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 bg-slate-800 active:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700/80"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            onClick={() => { onResetData(); setMobileMenuOpen(false); }}
            className="w-full py-2 px-3 text-slate-400 hover:text-slate-200 active:bg-slate-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Sample</span>
          </button>

        </div>
      )}
    </header>
  );
}
