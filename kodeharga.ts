// Nama Sheet yang digunakan
const SHEETS = {
    MODAL_PRODUK: 'ModalProduk',
    MODAL_LOGO: 'ModalLogo',
    MARGIN: 'Margin',
    PERHITUNGAN: 'Perhitungan',
    USERS: 'Users',
    DIVISI: 'Divisi',
    BRANDS: 'Brands',
    SPH: 'SPH',
    PRODUK: 'Produk',
    KETERANGAN: 'Keterangan'
};

function doGet() {
    return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('App Kalkulator Harga')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function setupDatabase() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Setup Sheet Modal Produk
    let sheetProduk = ss.getSheetByName(SHEETS.MODAL_PRODUK);
    if (!sheetProduk) {
        sheetProduk = ss.insertSheet(SHEETS.MODAL_PRODUK);
        sheetProduk.appendRow(['ID', 'Produk', 'Kode', 'Harga Modal']);
        sheetProduk.getRange('A1:D1').setFontWeight('bold').setBackground('#dcedc8');
    }

    // Setup Sheet Modal Logo
    let sheetLogo = ss.getSheetByName(SHEETS.MODAL_LOGO);
    if (!sheetLogo) {
        sheetLogo = ss.insertSheet(SHEETS.MODAL_LOGO);
        sheetLogo.appendRow(['ID', 'Produk', 'Proses Logo', 'Qty 12', 'Qty 24', 'Qty 50', 'Qty 75', 'Qty 100', 'Qty 150', 'Qty 200', 'Qty 300', 'Qty 500']);
        sheetLogo.getRange('A1:L1').setFontWeight('bold').setBackground('#dcedc8');
    }

    // Setup Sheet Margin
    let sheetMargin = ss.getSheetByName(SHEETS.MARGIN);
    if (!sheetMargin) {
        sheetMargin = ss.insertSheet(SHEETS.MARGIN);
        sheetMargin.appendRow(['ID', 'Produk', 'Proses Logo', 'Qty 12', 'Qty 24', 'Qty 50', 'Qty 75', 'Qty 100', 'Qty 150', 'Qty 200', 'Qty 300', 'Qty 500']);
        sheetMargin.getRange('A1:L1').setFontWeight('bold').setBackground('#dcedc8');
    }

    // Setup Sheet Perhitungan (Riwayat) - Ditambah Kolom Sales dan Multi Produk
    let sheetPerhitungan = ss.getSheetByName(SHEETS.PERHITUNGAN);
    if (!sheetPerhitungan) {
        sheetPerhitungan = ss.insertSheet(SHEETS.PERHITUNGAN);
        sheetPerhitungan.appendRow(['ID', 'Tanggal', 'Sales', 'Produk', 'Kode', 'Proses Logo', 'Qty', 'Modal Produk', 'Modal Logo', 'Margin', 'Harga Jual', 'Total Harga Jual', 'Harga Jual Net', 'Diskon']);
        sheetPerhitungan.getRange('A1:N1').setFontWeight('bold').setBackground('#dcedc8');
    } else {
        // Auto-patch: Pastikan kolom 'Sales', 'Harga Jual Net', 'Diskon' ada
        let lastCol = sheetPerhitungan.getLastColumn();
        if (lastCol > 0) {
            let headers = sheetPerhitungan.getRange(1, 1, 1, lastCol).getValues()[0];
            let colsToAdd = [];
            if (!headers.includes('Sales')) colsToAdd.push('Sales');
            if (!headers.includes('Harga Jual Net')) colsToAdd.push('Harga Jual Net');
            if (!headers.includes('Diskon')) colsToAdd.push('Diskon');

            if (colsToAdd.length > 0) {
                sheetPerhitungan.getRange(1, lastCol + 1, 1, colsToAdd.length).setValues([colsToAdd]).setFontWeight('bold').setBackground('#dcedc8');
            }
        }
    }

    // Setup Sheet Users / Sales
    let sheetUsers = ss.getSheetByName(SHEETS.USERS);
    if (!sheetUsers) {
        sheetUsers = ss.insertSheet(SHEETS.USERS);
        sheetUsers.appendRow(['ID', 'Nama', 'Email']);
        sheetUsers.getRange('A1:C1').setFontWeight('bold').setBackground('#dcedc8');
    }

    // Setup Sheet Divisi
    let sheetDivisi = ss.getSheetByName(SHEETS.DIVISI);
    if (!sheetDivisi) {
        sheetDivisi = ss.insertSheet(SHEETS.DIVISI);
        sheetDivisi.appendRow(['ID', 'Nama Divisi']);
        sheetDivisi.getRange('A1:B1').setFontWeight('bold').setBackground('#dcedc8');
    }

    // Setup Sheet Brands
    let sheetBrands = ss.getSheetByName(SHEETS.BRANDS);
    if (!sheetBrands) {
        sheetBrands = ss.insertSheet(SHEETS.BRANDS);
        sheetBrands.appendRow(['ID', 'Nama Brand', 'Singkatan', 'Alamat', 'Email', 'Website', 'No Telp Kantor', 'No Telp WA', 'Sosial Media', 'Rating Google Maps', 'Bank', 'No Rekening', 'Atas Nama']);
        sheetBrands.getRange('A1:M1').setFontWeight('bold').setBackground('#dcedc8');
    } else {
        let lastCol = sheetBrands.getLastColumn();
        if (lastCol === 3) {
            sheetBrands.getRange(1, 4, 1, 10).setValues([['Alamat', 'Email', 'Website', 'No Telp Kantor', 'No Telp WA', 'Sosial Media', 'Rating Google Maps', 'Bank', 'No Rekening', 'Atas Nama']]).setFontWeight('bold').setBackground('#dcedc8');
        } else if (lastCol === 10) {
            sheetBrands.getRange(1, 11, 1, 3).setValues([['Bank', 'No Rekening', 'Atas Nama']]).setFontWeight('bold').setBackground('#dcedc8');
        }
    }

    // Setup Sheet Produk
    let sheetMasterProduk = ss.getSheetByName(SHEETS.PRODUK);
    if (!sheetMasterProduk) {
        sheetMasterProduk = ss.insertSheet(SHEETS.PRODUK);
        sheetMasterProduk.appendRow(['ID', 'Nama Produk']);
        sheetMasterProduk.getRange('A1:B1').setFontWeight('bold').setBackground('#dcedc8');
    }

    // Setup Sheet SPH
    let sheetSPH = ss.getSheetByName(SHEETS.SPH);
    if (!sheetSPH) {
        sheetSPH = ss.insertSheet(SHEETS.SPH);
        sheetSPH.appendRow(['ID', 'Tanggal', 'Brand', 'No SPH', 'Nama PT', 'Deskripsi', 'Produk', 'Qty', 'Harga Jual', 'Ref ID', 'Sales', 'Status SPH', 'Keterangan', 'Diskon', 'Harga Jual Akhir']);
        sheetSPH.getRange('A1:O1').setFontWeight('bold').setBackground('#dcedc8');
    } else {
        let lastCol = sheetSPH.getLastColumn();
        if (lastCol === 13) {
            sheetSPH.getRange(1, 14, 1, 2).setValues([['Diskon', 'Harga Jual Akhir']]).setFontWeight('bold').setBackground('#dcedc8');
        }
    }

    // Setup Sheet Keterangan
    let sheetKeterangan = ss.getSheetByName(SHEETS.KETERANGAN);
    if (!sheetKeterangan) {
        sheetKeterangan = ss.insertSheet(SHEETS.KETERANGAN);
        sheetKeterangan.appendRow(['ID', 'Isi Keterangan']);
        sheetKeterangan.getRange('A1:B1').setFontWeight('bold').setBackground('#dcedc8');
    }
}

function getAllData() {
    return {
        modalProduk: getSheetData(SHEETS.MODAL_PRODUK),
        modalLogo: getSheetData(SHEETS.MODAL_LOGO),
        margin: getSheetData(SHEETS.MARGIN),
        perhitungan: getSheetData(SHEETS.PERHITUNGAN),
        users: getSheetData(SHEETS.USERS),
        divisi: getSheetData(SHEETS.DIVISI),
        brands: getSheetData(SHEETS.BRANDS),
        sph: getSheetData(SHEETS.SPH),
        produk: getSheetData(SHEETS.PRODUK),
        keterangan: getSheetData(SHEETS.KETERANGAN)
    };
}

// Helper: Ubah data sheet jadi Object
function getSheetData(sheetName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) return [];

    const headers = data[0].map(h => h.toLowerCase().replace(/ /g, '_'));
    const rows = data.slice(1);

    return rows.map(row => {
        let obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i];
        });
        return obj;
    });
}

function saveData(sheetName, dataObj) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet tidak ditemukan");

    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    let rowIndex = -1;

    // Cek apakah ini mode Edit (jika ada ID nya cari barisnya)
    if (dataObj.id) {
        for (let i = 1; i < dataRange.length; i++) {
            if (dataRange[i][0] == dataObj.id) {
                rowIndex = i + 1; // +1 karena array index 0, dan google sheet index 1
                break;
            }
        }
    }

    // Jika ID kosong atau tidak ketemu, generate ID baru (Data Baru)
    if (!dataObj.id || rowIndex === -1) {
        dataObj.id = "ID-" + new Date().getTime();
        if ((sheetName === SHEETS.PERHITUNGAN || sheetName === SHEETS.SPH) && !dataObj.tanggal) {
            dataObj.tanggal = new Date().toLocaleDateString('id-ID');
        }
    } else {
        // Jika Edit, pertahankan tanggal lama jika tidak direplace
        if ((sheetName === SHEETS.PERHITUNGAN || sheetName === SHEETS.SPH) && !dataObj.tanggal) {
            dataObj.tanggal = dataRange[rowIndex - 1][1];
        }
    }

    const rowData = [];
    headers.forEach(header => {
        const key = header.toLowerCase().replace(/ /g, '_');
        rowData.push(dataObj[key] !== undefined ? dataObj[key] : '');
    });

    if (rowIndex !== -1) {
        // Update data di baris yang sudah ada
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        return "Data berhasil diperbarui!";
    } else {
        // Tambah data baru ke baris paling bawah
        sheet.appendRow(rowData);
        return "Data berhasil disimpan!";
    }
}

function deleteData(sheetName, id) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == id) { // Asumsi ID ada di kolom pertama
            sheet.deleteRow(i + 1);
            return "Data berhasil dihapus!";
        }
    }
    throw new Error("Data tidak ditemukan");
}