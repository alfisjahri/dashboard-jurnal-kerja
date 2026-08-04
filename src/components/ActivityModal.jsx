import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, FileText } from 'lucide-react';
import { getTodayISO } from '../utils/dateHelpers';

export default function ActivityModal({ isOpen, onClose, onSave, editingItem }) {
  const [formData, setFormData] = useState({
    id: '',
    tanggal: getTodayISO(),
    kegiatan: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData({
        id: editingItem.id || '',
        tanggal: editingItem.tanggal || getTodayISO(),
        kegiatan: editingItem.kegiatan || ''
      });
    } else {
      setFormData({
        id: `JRN-${String(Math.floor(100 + Math.random() * 900))}`,
        tanggal: getTodayISO(),
        kegiatan: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.kegiatan.trim()) newErrors.kegiatan = 'Deskripsi kegiatan wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      kegiatan: formData.kegiatan.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {editingItem ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Row 1: ID & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                ID Kegiatan
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-base sm:text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-base sm:text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                required
              />
              {errors.tanggal && <p className="text-xs text-rose-500 mt-1">{errors.tanggal}</p>}
            </div>
          </div>

          {/* Row 2: Kegiatan / Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Kegiatan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="4"
              value={formData.kegiatan}
              onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
              placeholder="Tuliskan kegiatan harian Anda..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base sm:text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
              required
            ></textarea>
            {errors.kegiatan && <p className="text-xs text-rose-500 mt-1">{errors.kegiatan}</p>}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
