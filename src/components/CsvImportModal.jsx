import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { parseCSVFile, downloadCSV, generateSampleCSV } from '../utils/csvParser';
import { formatDateIndonesian } from '../utils/dateHelpers';

export default function CsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importMode, setImportMode] = useState('append'); // 'append' or 'replace'

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Mohon unggah file berformat .csv');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseErrors([]);

    try {
      const { data, errors } = await parseCSVFile(selectedFile);
      setParsedPreview(data);
      setParseErrors(errors || []);
    } catch (err) {
      setParseErrors([{ message: 'Gagal membaca isi file CSV. Pastikan encoding UTF-8.' }]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImportSuccess(parsedPreview, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setParsedPreview([]);
    setParseErrors([]);
  };

  const handleDownloadSample = () => {
    const sampleCsv = generateSampleCSV();
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_jurnal_kerja.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Data dari CSV</h2>
              <p className="text-xs text-slate-400">Skema kolom: ID, Tanggal, Kegiatan, Kategori, Status</p>
            </div>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 rounded-xl p-8 text-center transition cursor-pointer group flex flex-col items-center justify-center"
            >
              <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                Tarik & lepas file CSV di sini, atau{' '}
                <label className="text-indigo-400 hover:underline cursor-pointer">
                  pilih file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-slate-500 mt-1">Mendukung format .csv dengan pemisah koma (,)</p>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Unduh Template Sample CSV
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* File details & reset */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • {parsedPreview.length} baris terdeteksi
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 bg-slate-800 rounded transition"
                >
                  Ganti File
                </button>
              </div>

              {/* Parsing Warnings / Errors */}
              {parseErrors.length > 0 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Peringatan Parsing:</p>
                    <ul className="list-disc list-inside mt-1">
                      {parseErrors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err.message || 'Format tidak valid'}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Import Options */}
              <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-400">Metode Import:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Tambahkan ke data yang ada (Append)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Gantikan semua data (Overwrite)
                </label>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Pratinjau Data ({parsedPreview.length} Baris)
                </h3>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3">Kegiatan</th>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {parsedPreview.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-mono text-indigo-400">{item.id}</td>
                          <td className="py-2 px-3">{formatDateIndonesian(item.tanggal)}</td>
                          <td className="py-2 px-3 max-w-xs truncate">{item.kegiatan}</td>
                          <td className="py-2 px-3">{item.kategori}</td>
                          <td className="py-2 px-3">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900">
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
          >
            Batal
          </button>
          <button
            disabled={!file || parsedPreview.length === 0 || isParsing}
            onClick={handleConfirmImport}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-sky-600/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi Import ({parsedPreview.length} Data)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
