/**
 * ====================================================================
 * ENTERPRISE SUPABASE SYNC ENGINE - GOOGLE APPS SCRIPT
 * ====================================================================
 * Author: Antigravity Enterprise Engine
 * Architecture: Google Spreadsheet -> GAS Sync Engine -> Supabase Core
 *
 * Capabilities:
 * - Chunked batch upsert (avoids GAS 6-minute timeout)
 * - Automatic data type parsing (numbers, currency strings, dates)
 * - Automated time-driven sync triggers
 * - Manual UI menu sync with real-time toast/alert feedback
 * - Enterprise audit logging directly recorded to Supabase sync_logs table
 * - Secure script properties storage for API credentials
 * ====================================================================
 */

// 1. CONFIGURATION & SHEET MAPPING
const CONFIG = {
  BATCH_CHUNK_SIZE: 300, // Rows per batch request
  DEFAULT_SUPABASE_URL: 'https://your-project-id.supabase.co',
  DEFAULT_API_KEY: 'your-anon-or-service-role-key',
  
  // Sheet names matching the active Google Spreadsheet
  SHEETS: {
    MODAL_PRODUK: 'ModalProduk',
    MODAL_LOGO: 'ModalLogo',
    MARGIN: 'Margin',
    PERHITUNGAN: 'Perhitungan',
    SPH: 'SPH',
    USERS: 'Users',
    DIVISI: 'Divisi',
    BRANDS: 'Brands',
    PRODUK: 'Produk',
    KETERANGAN: 'Keterangan'
  },
  
  // Table mapping in Supabase
  TABLE_MAP: {
    'ModalProduk': 'modal_produk',
    'ModalLogo': 'modal_logo',
    'Margin': 'margin',
    'Perhitungan': 'perhitungan',
    'SPH': 'sph',
    'Users': 'users',
    'Divisi': 'divisi',
    'Brands': 'brands',
    'Produk': 'produk',
    'Keterangan': 'keterangan'
  }
};

/**
 * Get credentials from ScriptProperties or fallback
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
    .addItem('⚡ Sync Semua Sheet (Full Sync)', 'menuSyncAll')
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
  const sheetName = sheet.getName();
  const ui = SpreadsheetApp.getUi();
  
  const tableName = CONFIG.TABLE_MAP[sheetName];
  if (!tableName) {
    ui.alert('Sheet Tidak Terdaftar', `Sheet "${sheetName}" tidak termasuk sheet master yang disinkronkan ke Supabase.`, ui.ButtonSet.OK);
    return;
  }
  
  const result = syncSingleSheet(sheetName, 'MANUAL');
  if (result.success) {
    ui.alert('Sukses', `Sheet "${sheetName}" berhasil disinkronkan!\nTotal baris: ${result.recordsProcessed}\nWaktu: ${result.durationMs}ms`, ui.ButtonSet.OK);
  } else {
    ui.alert('Gagal', `Sinkronisasi gagal untuk sheet "${sheetName}":\n${result.error}`, ui.ButtonSet.OK);
  }
}

function menuConfigureCredentials() {
  const ui = SpreadsheetApp.getUi();
  const creds = getCredentials();
  
  const promptUrl = ui.prompt('1. Konfigurasi Supabase URL', `Masukkan URL Supabase Anda:\n(Saat ini: ${creds.url})`, ui.ButtonSet.OK_CANCEL);
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
 * 4. SYNC ALL SHEETS ENGINE
 */
function syncAllSheets(syncType = 'AUTO') {
  const startTime = new Date().getTime();
  const results = [];
  let totalProcessed = 0;
  let totalErrors = 0;
  
  const sheetList = Object.values(CONFIG.SHEETS);
  for (let i = 0; i < sheetList.length; i++) {
    const sheetName = sheetList[i];
    try {
      const res = syncSingleSheet(sheetName, syncType);
      results.push(res);
      if (res.success) {
        totalProcessed += (res.recordsProcessed || 0);
      } else {
        totalErrors++;
      }
    } catch (err) {
      results.push({ sheet: sheetName, success: false, error: err.message });
      totalErrors++;
    }
  }
  
  const totalDuration = new Date().getTime() - startTime;
  const summary = `📊 Total Record Disinkronkan: ${totalProcessed}\n✅ Sheet Berhasil: ${sheetList.length - totalErrors}\n❌ Sheet Gagal: ${totalErrors}\n⏱️ Durasi: ${totalDuration} ms`;
  
  Logger.log(summary);
  return {
    success: totalErrors === 0,
    totalProcessed: totalProcessed,
    totalErrors: totalErrors,
    durationMs: totalDuration,
    summary: summary,
    details: results
  };
}

/**
 * 5. SYNC SINGLE SHEET FUNCTION
 */
function syncSingleSheet(sheetName, syncType = 'MANUAL') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const tableName = CONFIG.TABLE_MAP[sheetName];
  
  if (!sheet || !tableName) {
    return { sheet: sheetName, success: true, recordsProcessed: 0, message: 'Sheet tidak ada atau dilewati' };
  }
  
  const dataRange = sheet.getDataRange().getValues();
  if (dataRange.length <= 1) {
    return { sheet: sheetName, success: true, recordsProcessed: 0, message: 'Sheet kosong' };
  }
  
  const rawHeaders = dataRange[0];
  const headers = rawHeaders.map(h => formatColumnHeader(h));
  const rows = dataRange.slice(1);
  
  const sanitizedRecords = [];
  const nowStr = new Date().toISOString();
  
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    // Abaikan baris kosong
    if (!row[0] && !row[1]) continue;
    
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
        // Cek format angka/currency (contoh: "Rp 35.000" atau "35000")
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
    
    // Pastikan record memiliki ID unik yang KONSISTEN (mencegah duplikasi saat sinkronisasi berulang)
    if (!record.id) {
      // Gunakan kombinasi field utama sebagai ID unik yang konsisten agar saat di-sync ulang, data hanya di-update (bukan ganda)
      const baseKey = (record.produk || record.nama_produk || record.nama_brand || record.nama_divisi || record.isi_keterangan || record.judul || record.nama || `ROW${r + 1}`).toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const subKey = (record.kode || record.proses_logo || '').toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      record.id = `${sheetName.toUpperCase()}-${baseKey}${subKey ? '-' + subKey : ''}`;
    }
    
    sanitizedRecords.push(record);
  }
  
  if (sanitizedRecords.length === 0) {
    return { sheet: sheetName, success: true, recordsProcessed: 0 };
  }
  
  // Chunking and Batch Upsert to Supabase
  const creds = getCredentials();
  const chunkSize = CONFIG.BATCH_CHUNK_SIZE;
  let chunkCount = Math.ceil(sanitizedRecords.length / chunkSize);
  const startTs = new Date().getTime();
  
  for (let c = 0; c < chunkCount; c++) {
    const chunk = sanitizedRecords.slice(c * chunkSize, (c + 1) * chunkSize);
    sendBatchToSupabase(creds, tableName, chunk, syncType);
  }
  
  const durationMs = new Date().getTime() - startTs;
  return {
    sheet: sheetName,
    table: tableName,
    success: true,
    recordsProcessed: sanitizedRecords.length,
    durationMs: durationMs
  };
}

/**
 * 6. SUPABASE API DISPATCHER (RPC BATCH UPSERT)
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
 * 7. FIELD HELPER UTILITIES
 */
function formatColumnHeader(header) {
  if (!header) return '';
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/[\s\/\-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function isNumericField(key) {
  const numericKeys = [
    'harga_modal', 'qty', 'margin', 'harga_jual', 'total_harga_jual',
    'harga_jual_net', 'diskon', 'harga_jual_akhir',
    'qty_12', 'qty_24', 'qty_50', 'qty_75', 'qty_100', 'qty_150', 'qty_200', 'qty_300', 'qty_500'
  ];
  return numericKeys.includes(key);
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
  ui.alert('Auto-Sync Aktif', 'Trigger otomatis berhasil dibuat. Data spreadsheet akan disinkronkan ke Supabase setiap 15 menit.', ui.ButtonSet.OK);
}

function clearAutoSyncTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'autoSyncTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
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
    const testUrl = `${creds.url}/rest/v1/sync_logs?select=id,created_at,status&limit=3&order=created_at.desc`;
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
      let logSummary = '3 Log Sinkronisasi Terakhir:\n';
      logs.forEach(l => {
        logSummary += `- ${l.created_at}: [${l.status}]\n`;
      });
      
      ui.alert('🟢 Koneksi Supabase Berhasil', `Koneksi ke ${creds.url} AKTIF dan terverifikasi!\n\n${logSummary}`, ui.ButtonSet.OK);
    } else {
      ui.alert('🔴 Gagal Menghubungkan', `Server merespon dengan kode ${code}:\n${response.getContentText()}`, ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('🔴 Error Koneksi', `Gagal menghubungkan ke Supabase:\n${e.message}`, ui.ButtonSet.OK);
  }
}
