/**
 * ====================================================================
 * ENTERPRISE SUPABASE SYNC ENGINE - GOOGLE APPS SCRIPT
 * ====================================================================
 * Architecture: Google Spreadsheet -> GAS Sync Engine -> Supabase Core
 * 
 * KETENTUAN SINKRONISASI (3 TAB MASTER):
 * 1. Hanya menyinkronkan 3 tab:
 *    - ModalProduk -> modal_produk
 *    - ModalLogo   -> modal_logo
 *    - Margin      -> margin
 * 
 * 2. Full Sync (Mirroring):
 *    - Data baru -> Ditambahkan ke Supabase
 *    - Data berubah -> Diperbarui di Supabase
 *    - Data yang dihapus di Spreadsheet -> Otomatis dihapus dari Supabase
 * 
 * Tab lain (Perhitungan, SPH, dll.) dikelola langsung di aplikasi React
 * dan tidak di-overwrite dari Spreadsheet.
 * ====================================================================
 */

// 1. CONFIGURATION & SHEET MAPPING
const CONFIG = {
  DEFAULT_SUPABASE_URL: 'https://your-project-id.supabase.co',
  DEFAULT_API_KEY: 'your-anon-or-service-role-key',
  
  // 3 Target Tab yang disinkronkan
  TARGET_SHEETS: [
    { key: 'MODAL_PRODUK', name: 'ModalProduk', table: 'modal_produk' },
    { key: 'MODAL_LOGO',   name: 'ModalLogo',   table: 'modal_logo' },
    { key: 'MARGIN',       name: 'Margin',      table: 'margin' }
  ]
};

/**
 * Mendapatkan kredensial Supabase dari Script Properties
 */
function getCredentials() {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL') || CONFIG.DEFAULT_SUPABASE_URL;
  const key = props.getProperty('SUPABASE_API_KEY') || CONFIG.DEFAULT_API_KEY;
  return { url: url.replace(/\/$/, ''), key: key };
}

/**
 * 2. CUSTOM MENU CREATION ON OPEN
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Supabase Sync Engine')
    .addItem('⚡ Full Sync 3 Tab (ModalProduk, ModalLogo, Margin)', 'menuSyncAll')
    .addItem('📄 Sync Sheet Aktif Saat Ini', 'menuSyncActiveSheet')
    .addSeparator()
    .addItem('⚙️ Setup Supabase Credentials (URL & Key)', 'menuConfigureCredentials')
    .addItem('🔄 Aktifkan Auto-Sync (Setiap 15 Menit)', 'setupAutoSyncTrigger')
    .addItem('⏸️ Matikan Semua Trigger Auto-Sync', 'clearAutoSyncTriggers')
    .addSeparator()
    .addItem('📊 Cek Status Koneksi & Log Sinkronisasi', 'checkConnectionStatus')
    .addToUi();
}

/**
 * 3. MENU HANDLERS
 */
function menuSyncAll() {
  const ui = SpreadsheetApp.getUi();
  const res = syncAllSheets('MANUAL');
  ui.alert('Sinkronisasi Selesai', res.summary, ui.ButtonSet.OK);
}

function menuSyncActiveSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const currentSheetName = sheet.getName();
  const ui = SpreadsheetApp.getUi();
  
  // Cek apakah sheet aktif termasuk dalam 3 target tab
  const matchedTarget = findMatchingTarget(currentSheetName);
  if (!matchedTarget) {
    ui.alert(
      'Sheet Dilewati',
      `Sheet "${currentSheetName}" tidak termasuk dalam 3 tab master yang disinkronkan.\n\nTab yang disinkronkan hanya:\n1. ModalProduk\n2. ModalLogo\n3. Margin`,
      ui.ButtonSet.OK
    );
    return;
  }
  
  const result = syncSingleSheet(matchedTarget, 'MANUAL');
  if (result.success) {
    ui.alert(
      '🟢 Sinkronisasi Sukses (Mirror)',
      `Sheet: ${sheet.getName()}\nTabel Supabase: ${result.table}\n` +
      `• Data aktif di Supabase: ${result.recordsProcessed} baris\n` +
      `• Data lama terhapus: ${result.recordsDeleted || 0} baris\n` +
      `• Waktu eksekusi: ${result.durationMs}ms`,
      ui.ButtonSet.OK
    );
  } else {
    ui.alert('🔴 Sinkronisasi Gagal', `Gagal sinkronisasi sheet "${sheet.getName()}":\n${result.error}`, ui.ButtonSet.OK);
  }
}

function menuConfigureCredentials() {
  const ui = SpreadsheetApp.getUi();
  const creds = getCredentials();
  
  const promptUrl = ui.prompt('1. Konfigurasi Supabase URL', `Masukkan URL Supabase Project Anda:\n(Saat ini: ${creds.url})`, ui.ButtonSet.OK_CANCEL);
  if (promptUrl.getSelectedButton() !== ui.Button.OK) return;
  const newUrl = promptUrl.getResponseText().trim();
  
  const promptKey = ui.prompt('2. Konfigurasi Supabase API Key', 'Masukkan Supabase Anon Key atau Service Role Key:', ui.ButtonSet.OK_CANCEL);
  if (promptKey.getSelectedButton() !== ui.Button.OK) return;
  const newKey = promptKey.getResponseText().trim();
  
  if (newUrl && newKey) {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SUPABASE_URL', newUrl);
    props.setProperty('SUPABASE_API_KEY', newKey);
    ui.alert('Berhasil Disimpan', 'Kredensial Supabase berhasil disimpan secara aman di Script Properties.', ui.ButtonSet.OK);
  }
}

/**
 * 4. SYNC ALL 3 TARGET SHEETS (FULL MIRROR SYNC)
 */
function syncAllSheets(syncType = 'AUTO') {
  const startTime = new Date().getTime();
  const results = [];
  let totalProcessed = 0;
  let totalDeleted = 0;
  let totalErrors = 0;
  
  const targets = CONFIG.TARGET_SHEETS;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    try {
      const res = syncSingleSheet(target, syncType);
      results.push(res);
      if (res.success) {
        totalProcessed += (res.recordsProcessed || 0);
        totalDeleted += (res.recordsDeleted || 0);
      } else {
        totalErrors++;
      }
    } catch (err) {
      results.push({ sheet: target.name, success: false, error: err.message });
      totalErrors++;
    }
  }
  
  const totalDuration = new Date().getTime() - startTime;
  const summary = `📊 Full Mirror Sync Selesai (3 Tab Master)\n\n` +
    `✅ Tab Berhasil: ${targets.length - totalErrors}/${targets.length}\n` +
    `📦 Total Data Aktif: ${totalProcessed} baris\n` +
    `🗑️ Total Data Dihapus (Mirror): ${totalDeleted} baris\n` +
    `⏱️ Total Waktu: ${totalDuration} ms` +
    (totalErrors > 0 ? `\n❌ Tab Gagal: ${totalErrors}` : '');
  
  Logger.log(summary);
  return {
    success: totalErrors === 0,
    totalProcessed: totalProcessed,
    totalDeleted: totalDeleted,
    totalErrors: totalErrors,
    durationMs: totalDuration,
    summary: summary,
    details: results
  };
}

/**
 * 5. SYNC SINGLE SHEET FUNCTION (EXACT MIRROR)
 */
function syncSingleSheet(target, syncType = 'MANUAL') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = findSheetInSpreadsheet(ss, target.name);
  
  if (!sheet) {
    return { sheet: target.name, success: true, recordsProcessed: 0, message: `Sheet "${target.name}" tidak ditemukan di file ini` };
  }
  
  const dataRange = sheet.getDataRange().getValues();
  if (dataRange.length <= 1) {
    // Sheet kosong (hanya header atau tanpa baris), mirror sync akan mengosongkan tabel Supabase
    const creds = getCredentials();
    const result = sendBatchToSupabase(creds, target.table, [], syncType);
    return {
      sheet: sheet.getName(),
      table: target.table,
      success: true,
      recordsProcessed: 0,
      recordsDeleted: result.recordsDeleted || 0,
      durationMs: result.durationMs || 0
    };
  }
  
  const rawHeaders = dataRange[0];
  const headers = rawHeaders.map(h => formatColumnHeader(h));
  const rows = dataRange.slice(1);
  
  const sanitizedRecords = [];
  
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    // Abaikan baris kosong
    if (isEmptyRow(row)) continue;
    
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      
      let val = row[c];
      
      // Auto formatting & parsing
      if (typeof val === 'number') {
        record[key] = val;
      } else if (val instanceof Date) {
        record[key] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      } else if (typeof val === 'string') {
        val = val.trim();
        // Cek format angka/currency (contoh: "Rp 35.000", "45%", atau "35000")
        if (isNumericField(key) && val !== '') {
          const cleanNum = val.replace(/[^0-9.-]+/g, '');
          record[key] = cleanNum ? parseFloat(cleanNum) : 0;
        } else {
          record[key] = val;
        }
      } else {
        record[key] = val !== undefined && val !== null ? String(val) : '';
      }
    }
    
    // Pastikan record memiliki ID deterministik yang konsisten
    if (!record.id) {
      record.id = generateConsistentId(target.name, record, r + 1);
    }
    
    sanitizedRecords.push(record);
  }
  
  // Kirim seluruh dataset sheet ke Supabase untuk Full Mirror Sync
  const creds = getCredentials();
  const startTs = new Date().getTime();
  const response = sendBatchToSupabase(creds, target.table, sanitizedRecords, syncType);
  const durationMs = new Date().getTime() - startTs;
  
  return {
    sheet: sheet.getName(),
    table: target.table,
    success: true,
    recordsProcessed: sanitizedRecords.length,
    recordsDeleted: response.recordsDeleted || 0,
    durationMs: durationMs
  };
}

/**
 * 6. SUPABASE API DISPATCHER (RPC FULL MIRROR UPSERT)
 */
function sendBatchToSupabase(creds, tableName, records, syncType) {
  const rpcUrl = `${creds.url}/rest/v1/rpc/fn_batch_upsert_from_sheet`;
  
  const payload = {
    p_table_name: tableName,
    p_records: records,
    p_sync_type: syncType,
    p_triggered_by: 'Google Apps Script Engine'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': creds.key,
      'Authorization': `Bearer ${creds.key}`,
      'Prefer': 'return=representation'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(rpcUrl, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  if (responseCode >= 400) {
    throw new Error(`Supabase API Error (${responseCode}): ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

/**
 * 7. HELPER UTILITIES
 */
function findMatchingTarget(sheetName) {
  if (!sheetName) return null;
  const cleanName = sheetName.toLowerCase().replace(/[\s_-]/g, '');
  return CONFIG.TARGET_SHEETS.find(t => {
    const targetClean = t.name.toLowerCase().replace(/[\s_-]/g, '');
    return cleanName === targetClean;
  }) || null;
}

function findSheetInSpreadsheet(ss, targetName) {
  const cleanTarget = targetName.toLowerCase().replace(/[\s_-]/g, '');
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const sName = sheets[i].getName().toLowerCase().replace(/[\s_-]/g, '');
    if (sName === cleanTarget) {
      return sheets[i];
    }
  }
  return null;
}

function isEmptyRow(row) {
  if (!row || row.length === 0) return true;
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== '' && row[i] !== null && row[i] !== undefined) return false;
  }
  return true;
}

function formatColumnHeader(header) {
  if (!header) return '';
  let clean = String(header)
    .trim()
    .toLowerCase()
    .replace(/[\s\/\-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  // Format qty angka (contoh: "12", "24", "50" -> "qty_12", "qty_24", "qty_50")
  if (/^\d+$/.test(clean)) {
    clean = 'qty_' + clean;
  }
  return clean;
}

function isNumericField(key) {
  const numericKeys = [
    'harga_modal', 'qty', 'margin', 'harga_jual', 'total_harga_jual',
    'qty_12', 'qty_24', 'qty_50', 'qty_75', 'qty_100', 'qty_150', 'qty_200', 'qty_300', 'qty_500'
  ];
  return numericKeys.includes(key);
}

function generateConsistentId(sheetName, record, rowNumber) {
  const cleanStr = (val) => String(val || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (sheetName.toLowerCase().includes('modalproduk')) {
    const prod = cleanStr(record.produk || record.nama_produk);
    const kode = cleanStr(record.kode);
    return `MOD-${prod}${kode ? '-' + kode : ''}`;
  } else if (sheetName.toLowerCase().includes('modallogo')) {
    const prod = cleanStr(record.produk || record.nama_produk);
    const logo = cleanStr(record.proses_logo);
    return `MLG-${prod}${logo ? '-' + logo : ''}`;
  } else if (sheetName.toLowerCase().includes('margin')) {
    const prod = cleanStr(record.produk || record.nama_produk);
    const logo = cleanStr(record.proses_logo);
    return `MRG-${prod}${logo ? '-' + logo : ''}`;
  }
  
  return `${sheetName.toUpperCase()}-ROW${rowNumber}`;
}

/**
 * 8. AUTOMATION & TIME TRIGGER SETUP
 */
function setupAutoSyncTrigger() {
  clearAutoSyncTriggers();
  
  ScriptApp.newTrigger('autoSyncTrigger')
    .timeBased()
    .everyMinutes(15)
    .create();
    
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Auto-Sync Aktif',
    'Trigger otomatis berhasil dibuat.\n\n3 Tab master (ModalProduk, ModalLogo, Margin) akan disinkronkan secara full mirror ke Supabase setiap 15 menit.',
    ui.ButtonSet.OK
  );
}

function clearAutoSyncTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'autoSyncTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }
  return count;
}

function autoSyncTrigger() {
  syncAllSheets('AUTO');
}

/**
 * 9. CONNECTION STATUS CHECK
 */
function checkConnectionStatus() {
  const ui = SpreadsheetApp.getUi();
  const creds = getCredentials();
  
  try {
    const testUrl = `${creds.url}/rest/v1/sync_logs?select=id,created_at,sheet_name,status,records_processed,records_updated&limit=5&order=created_at.desc`;
    const options = {
      method: 'get',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(testUrl, options);
    const code = response.getResponseCode();
    
    if (code === 200) {
      const logs = JSON.parse(response.getContentText());
      let logSummary = '5 Log Sinkronisasi Terakhir di Supabase:\n';
      logs.forEach(l => {
        logSummary += `• [${l.sheet_name || 'SYNC'}] ${l.status} (${l.records_processed} data aktif, ${l.records_updated || 0} dihapus)\n`;
      });
      
      ui.alert('🟢 Koneksi Supabase Berhasil', `Koneksi ke ${creds.url} AKTIF dan terverifikasi!\n\n${logSummary}`, ui.ButtonSet.OK);
    } else {
      ui.alert('🔴 Gagal Menghubungkan', `Server merespon dengan kode ${code}:\n${response.getContentText()}`, ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('🔴 Error Koneksi', `Gagal menghubungkan ke Supabase:\n${e.message}`, ui.ButtonSet.OK);
  }
}
