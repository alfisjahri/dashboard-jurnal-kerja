import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuickAddForm from './components/QuickAddForm';
import DateFilter from './components/DateFilter';
import ActivityTable from './components/ActivityTable';
import ActivityModal from './components/ActivityModal';
import CsvImportModal from './components/CsvImportModal';
import SyncSettingsModal from './components/SyncSettingsModal';
import ConfirmModal from './components/ConfirmModal';
import { INITIAL_JURNAL_DATA } from './utils/sampleData';
import { downloadCSV } from './utils/csvParser';
import { triggerAutoSync, getSyncConfig } from './utils/syncService';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'jurnal_kerja_records_v1';
const THEME_KEY = 'jurnal_kerja_theme_v1';

export default function App() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) return savedTheme;
    } catch (e) {}
    return 'dark'; // Default obsidian dark
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Main Jurnal Data State
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

  // Confirmation Modals State (Replacing native window.confirm)
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    variant: 'danger',
    onConfirm: () => {}
  });

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-Sync & LocalStorage Save on ANY change to jurnalList
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jurnalList));
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

  const handleConfirmSingleDelete = (item) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Kegiatan?',
      message: `Anda yakin ingin menghapus kegiatan (${item.id}): "${item.kegiatan}"?`,
      confirmText: 'Hapus Kegiatan',
      variant: 'danger',
      onConfirm: () => {
        setJurnalList(prev => prev.filter(i => i.id !== item.id));
        showToast(getSyncToastMessage(`Kegiatan (${item.id}) dihapus`));
      }
    });
  };

  const handleBulkDelete = (idsToDelete) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Kegiatan Terpilih?',
      message: `Anda yakin ingin menghapus ${idsToDelete.length} kegiatan yang dipilih secara permanen?`,
      confirmText: `Hapus ${idsToDelete.length} Item`,
      variant: 'danger',
      onConfirm: () => {
        setJurnalList(prev => prev.filter(item => !idsToDelete.includes(item.id)));
        showToast(getSyncToastMessage(`${idsToDelete.length} kegiatan dihapus`));
      }
    });
  };

  const handleResetData = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reset Ke Sample Awal?',
      message: 'Semua catatan kegiatan akan dikembalikan ke data sampel awal. Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Reset Data',
      variant: 'warning',
      onConfirm: () => {
        setJurnalList(INITIAL_JURNAL_DATA);
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        showToast(getSyncToastMessage('Data di-reset ke sampel awal'));
      }
    });
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
      showToast('Tidak ada data untuk diexport.');
      return;
    }
    downloadCSV(filteredData, `jurnal_kerja_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('File CSV berhasil diunduh!');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className={`min-h-screen transition-colors font-sans antialiased ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Streamlined Navbar */}
      <Navbar
        onOpenImport={() => setIsImportModalOpen(true)}
        onExport={handleExportCSV}
        onResetData={handleResetData}
        onOpenSync={() => setIsSyncModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        
        {/* Modern Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* 📝 Direct Quick Add Activity Form */}
        <QuickAddForm onAdd={handleSaveActivity} />

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
          onDelete={handleConfirmSingleDelete}
          onBulkDelete={handleBulkDelete}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900/80 py-4 text-center text-xs text-slate-500 bg-white dark:bg-slate-950 transition-colors">
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

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig({ ...confirmModalConfig, isOpen: false })}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
      />

    </div>
  );
}
