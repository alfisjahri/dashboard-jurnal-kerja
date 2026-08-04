import React, { useState, useEffect } from 'react';
import { Upload, Download, RotateCcw, Cloud, Smartphone, Menu, X, Sun, Moon } from 'lucide-react';
import { getSyncConfig } from '../utils/syncService';

export default function Navbar({ onOpenImport, onExport, onResetData, onOpenSync, theme, toggleTheme }) {
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
    <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand with Logo (No badge count) */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-lg p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src="/icon.png" alt="Jurnal Kerja Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Jurnal Kerja
            </h1>
          </div>
        </div>

        {/* 📱 MOBILE HEADER BUTTON (<640px) */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Theme Toggle Button Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition touch-manipulation"
            title="Ganti Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 transition touch-manipulation relative flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
            {hasSyncConfig && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1"></span>
            )}
          </button>
        </div>

        {/* 💻 DESKTOP ACTIONS (>=640px) */}
        <div className="hidden sm:flex items-center gap-2">
          
          {/* Theme Toggle Button Desktop */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition touch-manipulation"
            title={theme === 'dark' ? "Beralih ke Tema Terang (Light)" : "Beralih ke Tema Gelap (Dark)"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

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
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 touch-manipulation relative"
          >
            <Cloud className={`w-4 h-4 ${hasSyncConfig ? 'text-emerald-500' : 'text-sky-500'}`} />
            <span>Backup Cloud</span>
            {hasSyncConfig && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={onOpenImport}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 touch-manipulation"
          >
            <Upload className="w-4 h-4 text-sky-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onExport}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 touch-manipulation"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onResetData}
            title="Reset Sample Data"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition touch-manipulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* 📱 MOBILE DROPDOWN DRAWER (<640px) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 space-y-2 animate-fade-in shadow-2xl">
          
          {deferredPrompt && (
            <button
              onClick={() => { handleInstallPWA(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install Aplikasi Ke HP</span>
            </button>
          )}

          <button
            onClick={() => { onOpenSync(); setMobileMenuOpen(false); }}
            className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 active:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-between border border-slate-200 dark:border-slate-700/80"
          >
            <div className="flex items-center gap-2">
              <Cloud className={`w-4 h-4 ${hasSyncConfig ? 'text-emerald-500' : 'text-sky-500'}`} />
              <span>Backup Cloud (Google Sheets / Supabase)</span>
            </div>
            {hasSyncConfig && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-semibold px-2 py-0.5 rounded">Aktif</span>}
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { onOpenImport(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700/80"
            >
              <Upload className="w-4 h-4 text-sky-500" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => { onExport(); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700/80"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            onClick={() => { onResetData(); setMobileMenuOpen(false); }}
            className="w-full py-2 px-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Sample</span>
          </button>

        </div>
      )}
    </header>
  );
}
