import React from 'react';
import { AlertTriangle, Trash2, RotateCcw, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya, Lanjutkan', variant = 'danger' }) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-inner ${
          isDanger 
            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {isDanger ? <Trash2 className="w-7 h-7" /> : <RotateCcw className="w-7 h-7" />}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2 px-4 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
