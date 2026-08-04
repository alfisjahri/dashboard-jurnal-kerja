import Papa from 'papaparse';

/**
 * Parses a CSV file into structured journal records
 * @param {File} file 
 * @returns {Promise<{ data: Array, errors: Array }>}
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      complete: (results) => {
        const formattedData = [];
        const parseErrors = [];

        results.data.forEach((row, index) => {
          // Normalize header keys (case-insensitive & trim)
          const normalizedRow = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim().toLowerCase();
            normalizedRow[cleanKey] = row[key] ? row[key].trim() : '';
          });

          // Match flexible column names
          const id = normalizedRow['id'] || `JRN-${String(index + 1).padStart(3, '0')}`;
          const tanggal = normalizedRow['tanggal'] || normalizedRow['date'] || normalizedRow['tgl'] || '';
          const kegiatan = normalizedRow['kegiatan'] || normalizedRow['activity'] || normalizedRow['deskripsi'] || normalizedRow['description'] || '';
          const kategori = normalizedRow['kategori'] || normalizedRow['category'] || 'Umum';
          const status = normalizedRow['status'] || 'Selesai';
          const durasi = normalizedRow['durasi'] || normalizedRow['duration'] || '-';

          if (!tanggal && !kegiatan) {
            // Skip invalid empty row
            return;
          }

          formattedData.push({
            id: id || `JRN-${Date.now()}-${index}`,
            tanggal: formatDateToISO(tanggal),
            kegiatan: kegiatan || 'Tanpa keterangan',
            kategori: kategori,
            status: status,
            durasi: durasi
          });
        });

        resolve({ data: formattedData, errors: results.errors || [] });
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * Normalizes date string into YYYY-MM-DD format
 */
const formatDateToISO = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Handled formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  const dmyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
};

/**
 * Generates and triggers download of CSV file
 * @param {Array} data 
 * @param {string} filename 
 */
export const downloadCSV = (data, filename = 'jurnal_kerja.csv') => {
  const exportFields = data.map(item => ({
    ID: item.id,
    Tanggal: item.tanggal,
    Kegiatan: item.kegiatan,
    Kategori: item.kategori || 'Umum',
    Status: item.status || 'Selesai',
    Durasi: item.durasi || '-'
  }));

  const csv = Papa.unparse(exportFields);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates sample CSV text
 */
export const generateSampleCSV = () => {
  const sample = [
    { ID: "JRN-101", Tanggal: "2026-08-04", Kegiatan: "Implementasi fitur import CSV pada dashboard", Kategori: "Pengembangan", Status: "Selesai" },
    { ID: "JRN-102", Tanggal: "2026-08-04", Kegiatan: "Meeting standup pagi dan sync bersama QA", Kategori: "Rapat", Status: "Selesai" },
    { ID: "JRN-103", Tanggal: "2026-08-03", Kegiatan: "Refactoring komponen tabel dan penambahan filter tanggal", Kategori: "Pengembangan", Status: "Selesai" },
    { ID: "JRN-104", Tanggal: "2026-08-02", Kegiatan: "Penyusunan modul panduan penggunaan aplikasi", Kategori: "Dokumentasi", Status: "Proses" }
  ];
  return Papa.unparse(sample);
};
