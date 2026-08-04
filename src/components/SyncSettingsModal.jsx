import React, { useState, useEffect } from 'react';
import { X, Cloud, CloudUpload, Copy, Check, ExternalLink, Database, FileSpreadsheet } from 'lucide-react';
import { getSyncConfig, saveSyncConfig, syncToGoogleSheets, syncToSupabase, GOOGLE_APPS_SCRIPT_CODE, SUPABASE_SQL_CODE } from '../utils/syncService';
import { formatDateIndonesian } from '../utils/dateHelpers';

export default function SyncSettingsModal({ isOpen, onClose, jurnalData, onSyncSuccess }) {
  const [activeTab, setActiveTab] = useState('google'); // 'google' or 'supabase'
  const [config, setConfig] = useState(getSyncConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSyncConfig());
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveSyncConfig(config);
  };

  const handleSyncGoogle = async () => {
    if (!config.googleSheetsUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Masukkan Web App URL Google Sheets terlebih dahulu' });
      return;
    }

    setIsSyncing(true);
    setStatusMsg(null);

    try {
      await syncToGoogleSheets(config.googleSheetsUrl.trim(), jurnalData);
      const now = new Date().toISOString();
      const updatedConfig = { ...config, provider: 'google_sheets', lastSyncedAt: now };
      setConfig(updatedConfig);
      saveSyncConfig(updatedConfig);

      setStatusMsg({ type: 'success', text: `Berhasil dicadangkan ke Google Sheets! (${formatDateIndonesian(now.split('T')[0])})` });
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal terhubung ke Google Sheets' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSupabase = async () => {
    if (!config.supabaseUrl.trim() || !config.supabaseAnonKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Masukkan Supabase URL dan Anon Key terlebih dahulu' });
      return;
    }

    setIsSyncing(true);
    setStatusMsg(null);

    try {
      await syncToSupabase(config.supabaseUrl.trim(), config.supabaseAnonKey.trim(), jurnalData);
      const now = new Date().toISOString();
      const updatedConfig = { ...config, provider: 'supabase', lastSyncedAt: now };
      setConfig(updatedConfig);
      saveSyncConfig(updatedConfig);

      setStatusMsg({ type: 'success', text: `Berhasil sinkronisasi dengan Supabase Database!` });
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal terhubung ke Supabase' });
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cadangan Cloud (Backup)</h2>
              <p className="text-xs text-slate-400">Koneksikan ke Google Sheets atau Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('google'); setStatusMsg(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition border-b-2 ${
              activeTab === 'google'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Google Sheets (Gratis)
          </button>
          <button
            onClick={() => { setActiveTab('supabase'); setStatusMsg(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition border-b-2 ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Supabase (Database)
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`px-5 py-2.5 text-xs font-medium ${
            statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-b border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border-b border-rose-500/20'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* TAB 1: GOOGLE SHEETS */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  value={config.googleSheetsUrl}
                  onChange={(e) => {
                    const newCfg = { ...config, googleSheetsUrl: e.target.value };
                    setConfig(newCfg);
                    saveSyncConfig(newCfg);
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 placeholder:text-slate-600 font-mono"
                />
              </div>

              <button
                onClick={handleSyncGoogle}
                disabled={isSyncing || !config.googleSheetsUrl}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isSyncing ? 'Mengirim ke Google Sheets...' : 'Cadangkan Data ke Google Sheets'}</span>
              </button>

              {/* Instructions Accordion */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                <p className="font-bold text-slate-200 flex items-center justify-between">
                  <span> Cara Menghubungkan Google Sheets:</span>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1 font-normal text-[11px]"
                  >
                    Buka Google Sheets <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Buat Spreadsheet baru di Google Sheets.</li>
                  <li>Klik menu <b>Ekstensi</b> &gt; <b>Apps Script</b>.</li>
                  <li>Salin kode di bawah ini lalu tempel di editor Apps Script:</li>
                </ol>

                <div className="relative">
                  <pre className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-32">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_CODE, 'script')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 font-sans"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>

                <ol start="4" className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Klik <b>Apply / Deploy</b> &gt; <b>New deployment</b>.</li>
                  <li>Pilih jenis <b>Web App</b>. Ubah <i>Who has access</i> ke <b>Anyone</b>.</li>
                  <li>Klik <b>Deploy</b>, lalu salin URL Web App dan tempel pada kolom di atas.</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 2: SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Project URL:
                </label>
                <input
                  type="url"
                  value={config.supabaseUrl}
                  onChange={(e) => {
                    const newCfg = { ...config, supabaseUrl: e.target.value };
                    setConfig(newCfg);
                    saveSyncConfig(newCfg);
                  }}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Anon API Key:
                </label>
                <input
                  type="password"
                  value={config.supabaseAnonKey}
                  onChange={(e) => {
                    const newCfg = { ...config, supabaseAnonKey: e.target.value };
                    setConfig(newCfg);
                    saveSyncConfig(newCfg);
                  }}
                  placeholder="eyJh..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                onClick={handleSyncSupabase}
                disabled={isSyncing || !config.supabaseUrl || !config.supabaseAnonKey}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isSyncing ? 'Menghubungkan ke Supabase...' : 'Sinkronisasi ke Supabase'}</span>
              </button>

              {/* Instructions */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                <p className="font-bold text-slate-200 flex items-center justify-between">
                  <span> Setup Tabel Supabase SQL:</span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1 font-normal text-[11px]"
                  >
                    Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="text-slate-400 text-[11px]">
                  Jalankan SQL query berikut di <b>SQL Editor</b> Supabase Anda untuk membuat tabel <code className="text-indigo-400">jurnal_kerja</code>:
                </p>

                <div className="relative">
                  <pre className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-32">
                    {SUPABASE_SQL_CODE}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(SUPABASE_SQL_CODE, 'sql')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 font-sans"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Tersalin' : 'Salin SQL'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900 text-xs">
          <span className="text-slate-500">
            {config.lastSyncedAt ? `Sync terakhir: ${formatDateIndonesian(config.lastSyncedAt.split('T')[0])}` : 'Belum pernah di-sync'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
