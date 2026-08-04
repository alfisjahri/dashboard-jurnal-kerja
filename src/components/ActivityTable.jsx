import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, FileText, Calendar, Tag } from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateHelpers';

export default function ActivityTable({ data, onEdit, onDelete, onBulkDelete }) {
  const [sortField, setSortField] = useState('tanggal');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Efficient memoized sorting
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'tanggal') {
        return sortOrder === 'asc' 
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortField, sortOrder]);

  // Strict Pagination for memory efficiency (2GB RAM low-end devices)
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Hapus ${selectedIds.length} kegiatan terpilih?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl shadow-lg overflow-hidden">
      
      {/* Header Bar */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Daftar Kegiatan</h2>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">
            {data.length}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-400 font-medium">{selectedIds.length} dipilih</span>
            <button
              onClick={handleConfirmBulkDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold active:scale-95 transition"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* 📱 MOBILE CARD VIEW (Active on screens < 640px) */}
      <div className="block sm:hidden divide-y divide-slate-800/60">
        {paginatedData.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-400">Tidak ada kegiatan</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci atau tanggal.</p>
          </div>
        ) : (
          paginatedData.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 space-y-2 transition ${
                selectedIds.includes(item.id) ? 'bg-indigo-950/30' : 'hover:bg-slate-800/40'
              }`}
            >
              {/* Card Top Row: Checkbox, ID, Date, Actions */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectOne(item.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="font-mono text-indigo-400 font-semibold">{item.id}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formatDateIndonesian(item.tanggal)}
                  </span>
                  
                  {/* Action Buttons for Mobile */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-400 active:text-indigo-400 active:bg-indigo-500/20 rounded touch-manipulation"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-slate-400 active:text-rose-400 active:bg-rose-500/20 rounded touch-manipulation"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body: Kegiatan */}
              <p className="text-xs text-slate-200 font-medium leading-relaxed pl-6">
                {item.kegiatan}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 💻 DESKTOP TABLE VIEW (Active on screens >= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item.id))}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">
                  ID
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('tanggal')}>
                <div className="flex items-center gap-1">
                  Tanggal
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('kegiatan')}>
                <div className="flex items-center gap-1">
                  Kegiatan / Deskripsi
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 px-4">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <FileText className="w-10 h-10 mb-2 text-slate-600 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-400">Tidak ada data kegiatan</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition ${
                    selectedIds.includes(item.id) ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectOne(item.id)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-indigo-400 font-semibold whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs whitespace-nowrap font-medium">
                    {formatDateIndonesian(item.tanggal)}
                  </td>
                  <td className="py-3 px-4 text-slate-100 font-medium max-w-lg leading-relaxed">
                    {item.kegiatan}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit Kegiatan"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        title="Hapus Kegiatan"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Touch-Friendly Mobile & Desktop Pagination */}
      <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Tampilkan:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 outline-none text-xs"
          >
            <option value={5}>5 / hal</option>
            <option value={10}>10 / hal</option>
            <option value={20}>20 / hal</option>
            <option value={50}>50 / hal</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={validCurrentPage === 1}
            className="p-2 rounded border border-slate-800 hover:bg-slate-800 active:scale-95 disabled:opacity-30 text-slate-200 transition touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-medium text-slate-300">
            {validCurrentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={validCurrentPage === totalPages}
            className="p-2 rounded border border-slate-800 hover:bg-slate-800 active:scale-95 disabled:opacity-30 text-slate-200 transition touch-manipulation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
