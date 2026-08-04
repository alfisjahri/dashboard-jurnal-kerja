import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import DateFilter from './components/DateFilter';
import ActivityTable from './components/ActivityTable';
import ActivityModal from './components/ActivityModal';
import CsvImportModal from './components/CsvImportModal';
import SyncSettingsModal from './components/SyncSettingsModal';
import { INITIAL_JURNAL_DATA } from './utils/sampleData';
import { downloadCSV } from './utils/csvParser';
import { triggerAutoSync, getSyncConfig } from './utils/syncService';
import { CheckCircle2, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'jurnal_kerja_records_v1';

export default function App() {
  const [jurnalList, setJurnalList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Gagal membaca localStorage:', e);
    }
    return INITIAL_JURNAL_DATA;
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal States
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState(null);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Unconditional Auto-Sync & LocalStorage Save on ANY change to jurnalList
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jurnalList));
      // Automatically triggers background sync to Google Sheets / Supabase
      triggerAutoSync(jurnalList);
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
    }
  }, [jurnalList]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const getSyncToastMessage = (baseMsg) => {
    const syncCfg = getSyncConfig();
    if (syncCfg.googleSheetsUrl) {
      return `${baseMsg} (Auto-sync Google Sheets 🟢)`;
    }
    return baseMsg;
  };

  // Filtered dataset
  const filteredData = jurnalList.filter((item) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = (item.id || '').toLowerCase().includes(term);
      const matchKegiatan = (item.kegiatan || '').toLowerCase().includes(term);
      if (!matchId && !matchKegiatan) return false;
    }

    if (startDate && item.tanggal < startDate) return false;
    if (endDate && item.tanggal > endDate) return false;

    return true;
  });

  // CRUD Handlers
  const handleSaveActivity = (itemData) => {
    if (editingItem) {
      setJurnalList(prev => prev.map(item => item.id === itemData.id ? itemData : item));
      showToast(getSyncToastMessage('Kegiatan diperbarui'));
    } else {
      setJurnalList(prev => [itemData, ...prev]);
      showToast(getSyncToastMessage('Kegiatan baru ditambahkan'));
    }
    setEditingItem(null);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsActivityModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsActivityModalOpen(true);
  };

  const handleConfirmDelete = (item) => {
    setDeletingItem(item);
  };

  const executeDelete = () => {
    if (!deletingItem) return;
    setJurnalList(prev => prev.filter(item => item.id !== deletingItem.id));
    showToast(getSyncToastMessage(`Kegiatan (${deletingItem.id}) dihapus`));
    setDeletingItem(null);
  };

  const handleBulkDelete = (idsToDelete) => {
    setJurnalList(prev => prev.filter(item => !idsToDelete.includes(item.id)));
    showToast(getSyncToastMessage(`${idsToDelete.length} kegiatan dihapus`));
  };

  const handleImportSuccess = (newRecords, mode) => {
    if (mode === 'replace') {
      setJurnalList(newRecords);
    } else {
      const existingIds = new Set(jurnalList.map(item => item.id));
      const filteredNew = newRecords.filter(item => !existingIds.has(item.id));
      setJurnalList(prev => [...filteredNew, ...prev]);
    }
    showToast(getSyncToastMessage(`Import CSV berhasil (${newRecords.length} data)`));
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }
    downloadCSV(filteredData, `jurnal_kerja_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('File CSV berhasil diunduh!');
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan data ke contoh awal?')) {
      setJurnalList(INITIAL_JURNAL_DATA);
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      showToast(getSyncToastMessage('Data di-reset ke sampel awal'));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans">
      
      {/* Streamlined Navbar */}
      <Navbar
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAdd={handleOpenAddModal}
        onExport={handleExportCSV}
        onResetData={handleResetData}
        onOpenSync={() => setIsSyncModalOpen(true)}
        totalCount={jurnalList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Minimal Summary Metrics */}
        <SummaryCards data={jurnalList} filteredCount={filteredData.length} />

        {/* Clean Date Filter & Search */}
        <DateFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onClearFilters={handleClearFilters}
        />

        {/* Focused Interactive Data Table */}
        <ActivityTable
          data={filteredData}
          onEdit={handleOpenEditModal}
          onDelete={handleConfirmDelete}
          onBulkDelete={handleBulkDelete}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-4 text-center text-xs text-slate-500 bg-slate-950">
        <p>Dashboard Jurnal Kerja • Realtime Auto-Sync Cloud (Google Sheets & Supabase)</p>
      </footer>

      {/* Modals */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => { setIsActivityModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveActivity}
        editingItem={editingItem}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <SyncSettingsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        jurnalData={jurnalList}
        onSyncSuccess={() => showToast('Sinkronisasi Cloud Berhasil!')}
      />

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Hapus Kegiatan?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Anda yakin ingin menghapus kegiatan <span className="text-indigo-400 font-mono font-semibold">{deletingItem.id}</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
