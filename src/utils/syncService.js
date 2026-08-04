/**
 * Cloud Sync Utility with Realtime Auto-Sync for Google Sheets & Supabase
 */

const SYNC_SETTINGS_KEY = 'jurnal_kerja_sync_config_v1';

export const getSyncConfig = () => {
  try {
    const saved = localStorage.getItem(SYNC_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        autoSync: true,
        provider: parsed.provider || 'none',
        googleSheetsUrl: parsed.googleSheetsUrl || '',
        supabaseUrl: parsed.supabaseUrl || '',
        supabaseAnonKey: parsed.supabaseAnonKey || '',
        lastSyncedAt: parsed.lastSyncedAt || null
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    autoSync: true,
    provider: 'none',
    googleSheetsUrl: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    lastSyncedAt: null
  };
};

export const saveSyncConfig = (config) => {
  localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(config));
};

/**
 * Sync data to Google Sheets via Web App deployment URL
 * Uses text/plain Content-Type to avoid CORS preflight blocking in browsers
 */
export const syncToGoogleSheets = async (webhookUrl, data) => {
  if (!webhookUrl) throw new Error('URL Google Sheets Web App belum diisi');

  const payload = JSON.stringify({
    action: 'sync_all',
    records: data,
    timestamp: new Date().toISOString()
  });

  await fetch(webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: payload
  });

  return { success: true, timestamp: new Date().toISOString() };
};

/**
 * Auto-Sync background trigger (Triggers whenever googleSheetsUrl is configured)
 */
export const triggerAutoSync = (data) => {
  const config = getSyncConfig();

  if (config.googleSheetsUrl && config.googleSheetsUrl.trim()) {
    syncToGoogleSheets(config.googleSheetsUrl.trim(), data)
      .then(() => {
        const now = new Date().toISOString();
        saveSyncConfig({ ...config, provider: 'google_sheets', autoSync: true, lastSyncedAt: now });
      })
      .catch(err => console.warn('Auto-sync Google Sheets warning:', err));
  }

  if (config.supabaseUrl && config.supabaseAnonKey) {
    syncToSupabase(config.supabaseUrl.trim(), config.supabaseAnonKey.trim(), data)
      .then(() => {
        const now = new Date().toISOString();
        saveSyncConfig({ ...config, provider: 'supabase', autoSync: true, lastSyncedAt: now });
      })
      .catch(err => console.warn('Auto-sync Supabase warning:', err));
  }
};

/**
 * Sync data to Supabase REST API
 */
export const syncToSupabase = async (supabaseUrl, anonKey, data) => {
  if (!supabaseUrl || !anonKey) throw new Error('Supabase URL dan Anon Key wajib diisi');

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/jurnal_kerja`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(data.map(item => ({
      id: item.id,
      tanggal: item.tanggal,
      kegiatan: item.kegiatan,
      updated_at: new Date().toISOString()
    })))
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal ke Supabase (${response.status}): ${errText}`);
  }

  return { success: true, timestamp: new Date().toISOString() };
};

/**
 * Super robust Google Apps Script Template for Google Sheets
 */
export const GOOGLE_APPS_SCRIPT_CODE = `
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var postData = JSON.parse(e.postData.contents);
    var records = postData.records || [];
    
    // Set Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["ID", "Tanggal", "Kegiatan"]);
      sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    // Hapus isi data lama (pertahankan baris 1 header)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    }
    
    // Masukkan seluruh baris data baru secara instan
    if (records.length > 0) {
      var rows = records.map(function(row) {
        return [row.id || '', row.tanggal || '', row.kegiatan || ''];
      });
      sheet.getRange(2, 1, rows.length, 3).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: records.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`.trim();

/**
 * Supabase SQL table setup script
 */
export const SUPABASE_SQL_CODE = `
-- Jalankan Query ini di Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS jurnal_kerja (
  id TEXT PRIMARY KEY,
  tanggal DATE NOT NULL,
  kegiatan TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jurnal_kerja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access" ON jurnal_kerja FOR ALL USING (true);
`.trim();
