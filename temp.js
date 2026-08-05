
        // State Management
        let db = { modalProduk: [], modalLogo: [], margin: [], perhitungan: [], users: [], divisi: [], brands: [], sph: [], produk: [], keterangan: [] };
        let currentMenu = 'perhitungan';
        let currentFormType = '';
        let editingId = null;

        window.onload = function () {
            loadData();
            // Start silent auto-refresh every 5 minutes (300000 ms) untuk menghemat resource
            setInterval(silentLoadData, 300000);
        };

        function silentLoadData() {
            if (typeof google !== 'undefined') {
                google.script.run
                    .withSuccessHandler(res => {
                        if (!res) return;
                        let newDb = Object.assign({ modalProduk: [], modalLogo: [], margin: [], perhitungan: [], users: [], divisi: [], brands: [], sph: [], produk: [], keterangan: [] }, res);
                        // Bandingkan dengan DB saat ini, hanya update jika beda
                        if (JSON.stringify(db) !== JSON.stringify(newDb)) {
                            db = newDb;
                            renderUI(); // Re-render UI (Modal tetap aman karena di luar appContainer)
                        }
                    })
                    .withFailureHandler(err => {
                        console.error('Auto-refresh gagal: ', err);
                    })
                    .getAllData();
            }
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
        }

        function startLoading() {
            document.getElementById('loadingOverlay').style.display = 'flex';
        }

        function endLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }

        // ============ FUNGSI FETCH DATA ===========
        function loadData() {
            startLoading();
            if (typeof google === 'undefined') {
                // Mode Simulasi Canvas (Dummy Database)
                setTimeout(() => {
                    db = {
                        modalProduk: [
                            { id: 'P1', produk: 'Kaos Polo', kode: 'PL-01', harga_modal: 50000 },
                            { id: 'P2', produk: 'Kemeja', kode: 'KM-01', harga_modal: 75000 }
                        ],
                        modalLogo: [
                            { id: 'L1', produk: 'Kaos Polo', proses_logo: 'Bordir Dada', qty_12: 15000, qty_24: 12000, qty_50: 10000, qty_75: 9000, qty_100: 8000, qty_150: 7500, qty_200: 7000, qty_300: 6500, qty_500: 6000 },
                            { id: 'L2', produk: 'Kemeja', proses_logo: 'Bordir Dada + Punggung', qty_12: 20000, qty_24: 18000, qty_50: 15000, qty_75: 14000, qty_100: 13000, qty_150: 12000, qty_200: 11000, qty_300: 10000, qty_500: 9000 }
                        ],
                        margin: [
                            { id: 'M1', produk: 'Kaos Polo', proses_logo: 'Bordir Dada', qty_12: 1.50, qty_24: 1.50, qty_50: 1.40, qty_75: 1.40, qty_100: 1.30, qty_150: 1.30, qty_200: 1.30, qty_300: 1.25, qty_500: 1.20 },
                            { id: 'M2', produk: 'Kemeja', proses_logo: 'Bordir Dada + Punggung', qty_12: 1.50, qty_24: 1.40, qty_50: 1.40, qty_75: 1.35, qty_100: 1.30, qty_150: 1.30, qty_200: 1.30, qty_300: 1.25, qty_500: 1.20 },
                            { id: 'M3', produk: 'Kaos Polo', proses_logo: 'Tanpa Logo', qty_12: 1.30, qty_24: 1.25, qty_50: 1.20, qty_75: 1.20, qty_100: 1.15, qty_150: 1.15, qty_200: 1.15, qty_300: 1.10, qty_500: 1.10 }
                        ],
                        perhitungan: [
                            { id: 'TRX-1', tanggal: '15/07/2026', sales: 'Ahmad', produk: 'Kaos Polo', kode: 'PL-01', proses_logo: 'Bordir Dada', qty: 50, modal_produk: 50000, modal_logo: 10000, margin: 1.40, harga_jual: 84000 }
                        ],
                        users: [
                            { id: 'U1', nama: 'Ahmad', email: 'ahmad@mahada.co.id' },
                            { id: 'U2', nama: 'Budi', email: 'budi@mahada.co.id' }
                        ],
                        divisi: [
                            { id: 'D1', nama_divisi: 'Corporate' },
                            { id: 'D2', nama_divisi: 'Retail' }
                        ],
                        brands: [
                            { id: 'B1', nama_brand: 'Mahada' },
                            { id: 'B2', nama_brand: 'Smart Price' }
                        ],
                        sph: [
                            { id: 'SPH-1', tanggal: '15/07/2026', brand: 'Mahada', no_sph: 'SPH/001/VII/2026', nama_pt: 'PT. Teknologi Maju', deskripsi: 'Seragam', produk: 'Kaos Polo', qty: 50, harga_jual: 84000, ref_id: 'TRX-1' }
                        ]
                    };
                    renderUI();
                    endLoading();
                }, 500);
            } else {
                // Mode Google Apps Script
                google.script.run
                    .withSuccessHandler(res => {
                        if (!res) {
                            Swal.fire('Error', 'Data dari server kosong (Null). Jika ini pertama kali, hapus baris yang error di Spreadsheet.', 'error');
                            endLoading();
                            return;
                        }
                        db = Object.assign({ modalProduk: [], modalLogo: [], margin: [], perhitungan: [], users: [], divisi: [], brands: [], sph: [], produk: [], keterangan: [] }, res);
                        renderUI();
                        endLoading();
                    })
                    .withFailureHandler(err => {
                        console.error(err);
                        Swal.fire('Oops', 'Gagal memuat data dari server.', 'error');
                        endLoading();
                    })
                    .getAllData();
            }
        }

        function changeMenu(menu) {
            currentMenu = menu;
            document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
            event.currentTarget.classList.add('active');
            renderUI();
            if (window.innerWidth <= 768) toggleSidebar();
        }

        function renderUI() {
            let container = document.getElementById('appContainer');
            let html = '';

            switch (currentMenu) {
                case 'perhitungan':
                    html = renderPerhitungan(); break;
                case 'modal_produk':
                    html = renderTable('Modal Produk', ['Produk', 'Kode', 'Harga Modal'], db.modalProduk, ['produk', 'kode', 'harga_modal'], 'modalProduk'); break;
                case 'modal_logo':
                    html = renderMatrixTable('Modal Logo', db.modalLogo, 'modal_logo'); break;
                case 'margin':
                    html = renderMatrixTable('Margin', db.margin, 'margin'); break;
                case 'sph':
                    html = renderSPH(); break;
                case 'pengaturan':
                    html = renderPengaturan(); break;
                case 'ketentuan':
                    html = renderKetentuan(); break;
            }
            container.innerHTML = html;
        }

        function renderPerhitungan() {
            let trs = db.perhitungan.map(item => {
                let statusSPH = db.sph.find(s => s.ref_id === item.id)
                    ? `<span class="badge bg-success"><i class="fas fa-check"></i> SPH Diterbitkan</span>`
                    : `<button class="btn btn-sm btn-outline-primary" onclick="buatSPH('${item.id}')">Buat SPH</button>`;

                return `
                <tr>
                    <td>${item.tanggal || '-'}</td>
                    <td>${item.sales || '-'}</td>
                    <td><b>${item.produk}</b><br><small class="text-muted">${item.kode}</small></td>
                    <td>${item.proses_logo || '<em class="text-muted">Tanpa Logo</em>'}</td>
                    <td>${item.qty}</td>
                    <td>${formatRp(item.modal_produk)}</td>
                    <td>${formatRp(item.modal_logo)}</td>
                    <td>${item.margin}</td>
                    <td class="text-success fw-bold">${formatRp(item.harga_jual)}</td>
                    <td>${statusSPH}</td>
                    <td>
                        <button class="btn btn-sm btn-warning text-white mb-1" onclick="editData('Perhitungan', '${item.id}')"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="hapusData('Perhitungan', '${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
                `;
            }).join('');

            return `
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                    <h3 class="mb-0 text-dark"><i class="fas fa-calculator" style="color: var(--primary)"></i> Riwayat Perhitungan Harga</h3>
                    <div class="d-flex gap-2 w-100 justify-content-md-end">
                        <input type="text" class="form-control w-100 w-md-50" placeholder="🔍 Cari data..." onkeyup="filterTable(this.value)" style="max-width: 250px;">
                        <button class="btn btn-primary text-nowrap" onclick="openCalcModal()"><i class="fas fa-plus"></i> Kalkulasi Baru</button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body table-responsive">
                        <table class="table table-hover align-middle" id="dataTable">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Sales</th>
                                    <th>Produk & Kode</th>
                                    <th>Proses Logo</th>
                                    <th>Qty</th>
                                    <th>Modal Produk</th>
                                    <th>Modal Logo</th>
                                    <th>Margin</th>
                                    <th>Harga Jual</th>
                                    <th>Status SPH</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>${trs.length ? trs : '<tr><td colspan="11" class="text-center">Belum ada perhitungan</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderTable(title, headers, data, keys, formType) {
            let trs = data.map(item => `
                <tr>
                    ${keys.map(k => `<td>${k.includes('harga') ? formatRp(item[k]) : item[k]}</td>`).join('')}
                    <td>
                        <button class="btn btn-sm btn-warning text-white me-1" onclick="editData('${formType}', '${item.id}')"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="hapusData('${formType}', '${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');

            return `
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 mt-4 gap-3">
                    <h4 class="mb-0 text-dark"><i class="fas fa-table" style="color: var(--primary)"></i> Data ${title}</h4>
                    <div class="d-flex gap-2 w-100 justify-content-md-end">
                        <input type="text" class="form-control w-100 w-md-50" placeholder="🔍 Cari data..." onkeyup="filterTable(this.value)" style="max-width: 250px;">
                        <button class="btn btn-primary text-nowrap" onclick="openGeneralModal('${formType}')"><i class="fas fa-plus"></i> Tambah</button>
                    </div>
                </div>
                <div class="card mb-4">
                    <div class="card-body table-responsive">
                        <table class="table table-hover align-middle" id="dataTable">
                            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}<th>Aksi</th></tr></thead>
                            <tbody>${trs.length ? trs : `<tr><td colspan="${headers.length + 1}" class="text-center">Kosong</td></tr>`}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderMatrixTable(title, data, formType) {
            let keys = ['qty_12', 'qty_24', 'qty_50', 'qty_75', 'qty_100', 'qty_150', 'qty_200', 'qty_300', 'qty_500'];
            let trs = data.map(item => `
                <tr>
                    <td>${item.produk}</td>
                    <td>${item.proses_logo || 'Tanpa Logo'}</td>
                    ${keys.map(k => `<td>${formType === 'modal_logo' ? formatRp(item[k]) : item[k]}</td>`).join('')}
                    <td>
                        <button class="btn btn-sm btn-warning text-white me-1 mb-1" onclick="editData('${formType}', '${item.id}')"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="hapusData('${formType}', '${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');

            return `
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                    <h3 class="mb-0 text-dark"><i class="fas fa-list-alt" style="color: var(--primary)"></i> Matriks ${title}</h3>
                    <div class="d-flex gap-2 w-100 justify-content-md-end">
                        <input type="text" class="form-control w-100 w-md-50" placeholder="🔍 Cari ${title}..." onkeyup="filterTable(this.value)" style="max-width: 250px;">
                        <button class="btn btn-primary text-nowrap" onclick="openGeneralModal('${formType}')"><i class="fas fa-plus"></i> Tambah Data</button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body table-responsive">
                        <table class="table table-hover align-middle" id="dataTable">
                            <thead>
                                <tr>
                                    <th>Produk</th><th>Proses Logo</th>
                                    <th>12</th><th>24</th><th>50</th><th>75</th><th>100</th>
                                    <th>150</th><th>200</th><th>300</th><th>500</th><th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>${trs.length ? trs : '<tr><td colspan="12" class="text-center">Kosong</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderSPH() {
            let trs = db.sph.map(item => `
                <tr>
                    <td>${item.tanggal || '-'}</td>
                    <td>${item.brand}</td>
                    <td><strong>${item.no_sph}</strong></td>
                    <td>${item.nama_pt}</td>
                    <td>${item.produk} (${item.qty} pcs)</td>
                    <td>${item.deskripsi || '-'}</td>
                    <td>${item.sales || '-'}</td>
                    <td>
                        <span class="badge ${item.status_sph === 'Deal' ? 'bg-success' : (item.status_sph === 'Batal' ? 'bg-danger' : 'bg-info')}">
                            ${item.status_sph || 'Draft'}
                        </span>
                    </td>
                    <td>${item.keterangan || '-'}</td>
                    <td class="text-success fw-bold">${formatRp(item.harga_jual)}</td>
                    <td>
                        <button class="btn btn-sm btn-warning text-white mb-1 me-1" onclick="editData('SPH', '${item.id}')"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="hapusData('SPH', '${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');

            return `
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                    <h3 class="mb-0 text-dark"><i class="fas fa-file-invoice" style="color: var(--primary)"></i> Data SPH Terbit</h3>
                    <div class="d-flex gap-2 w-100 justify-content-md-end">
                        <input type="text" class="form-control w-100 w-md-50" placeholder="🔍 Cari SPH..." onkeyup="filterTable(this.value)" style="max-width: 250px;">
                    </div>
                </div>
                <div class="card">
                    <div class="card-body table-responsive">
                        <table class="table table-hover align-middle" id="dataTable">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Brand</th>
                                    <th>No SPH</th>
                                    <th>Nama PT</th>
                                    <th>Produk & Qty</th>
                                    <th>Deskripsi</th>
                                    <th>Sales</th>
                                    <th>Status SPH</th>
                                    <th>Keterangan</th>
                                    <th>Harga Jual</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>${trs.length ? trs : '<tr><td colspan="11" class="text-center">Belum ada SPH</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderPengaturan() {
            return `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="m-0 text-dark"><i class="fas fa-cog" style="color: var(--primary)"></i> Pengaturan Sistem</h3>
                </div>
                <div class="row g-4">
                    <div class="col-12">
                        ${renderTable('User & Sales', ['Nama', 'Email'], db.users, ['nama', 'email'], 'users')}
                    </div>
                    <div class="col-md-6">
                        ${renderTable('Divisi', ['Nama Divisi'], db.divisi, ['nama_divisi'], 'divisi')}
                    </div>
                    <div class="col-md-6">
                        ${renderTable('Brand', ['Nama Brand', 'Singkatan'], db.brands, ['nama_brand', 'singkatan'], 'brands')}
                    </div>
                    <div class="col-md-6 mt-2">
                        ${renderTable('Produk Master', ['Nama Produk'], db.produk, ['nama_produk'], 'produk')}
                    </div>
                    <div class="col-md-6 mt-2">
                        ${renderTable('Keterangan SPH', ['Isi Keterangan'], db.keterangan, ['isi_keterangan'], 'keterangan')}
                    </div>
                </div>
            `;
        }

        function renderKetentuan() {
            return `
                <h3 class="mb-4 text-dark"><i class="fas fa-info-circle" style="color: var(--primary)"></i> Ketentuan Perhitungan</h3>
                <div class="card">
                    <div class="card-body">
                        <ol class="fs-5 lh-lg">
                            <li>Rumus Harga Jual = <strong>(Harga Modal Produk + Harga Modal Logo) x Margin</strong>.</li>
                            <li>Sistem ini mendukung pengelompokan harga berdasarkan tingkatan jumlah (Quantity Tiers).</li>
                            <li>Tier Quantity yang berlaku: <strong>12, 24, 50, 75, 100, 150, 200, 300, dan 500</strong>.</li>
                            <li>Margin standar menggunakan nilai pecahan (Contoh: 1.50, 1.40, 1.30).</li>
                            <li>Pilihan dropdown (Produk, Kode, Logo) bersifat dinamis saling berhubungan.</li>
                            <li>Anda dapat mengosongkan pilihan logo (Tanpa Logo) saat perhitungan.</li>
                            <li>Data SPH bisa langsung dibuat dari riwayat Perhitungan.</li>
                        </ol>
                    </div>
                </div>
            `;
        }

        function openCalcModal() {
            editingId = null; // Set ke Mode Add
            document.getElementById('formCalc').reset();
            document.getElementById('prev_total').innerText = 'Rp 0';

            populateSalesDropdown();

            let uniqueProducts = [...new Set(db.modalProduk.map(p => p.produk))];
            let optProduk = '<option value="">-- Pilih Produk --</option>';
            uniqueProducts.forEach(p => optProduk += `<option value="${p}">${p}</option>`);

            document.getElementById('calc_produk').innerHTML = optProduk;
            document.getElementById('calc_kode').innerHTML = '<option value="">-- Pilih Kode --</option>';
            document.getElementById('calc_logo').innerHTML = '<option value="">-- Pilih Logo --</option>';

            let calcModalEl = document.getElementById('modalCalc');
            (bootstrap.Modal.getInstance(calcModalEl) || new bootstrap.Modal(calcModalEl)).show();
        }

        function populateSalesDropdown() {
            let optSales = '<option value="">-- Pilih Sales --</option>';
            db.users.forEach(u => optSales += `<option value="${u.nama}">${u.nama}</option>`);
            document.getElementById('calc_sales').innerHTML = optSales;
        }

        function handleProductChange() {
            let prod = document.getElementById('calc_produk').value;

            let kodes = db.modalProduk.filter(p => p.produk === prod).map(p => p.kode);
            let optKode = kodes.map(k => `<option value="${k}">${k}</option>`).join('');
            document.getElementById('calc_kode').innerHTML = optKode;

            let logos = db.modalLogo.filter(l => l.produk === prod).map(l => l.proses_logo);
            let optLogo = '<option value="">Tanpa Logo (Kosong)</option>';
            logos.forEach(l => optLogo += `<option value="${l}">${l}</option>`);
            document.getElementById('calc_logo').innerHTML = optLogo;

            calculatePreview();
        }

        function calculatePreview() {
            let prod = document.getElementById('calc_produk').value;
            let kode = document.getElementById('calc_kode').value;
            let logo = document.getElementById('calc_logo').value;
            let qty = document.getElementById('calc_qty').value;

            // Memperbolehkan logo kosong, asal produk, kode, dan qty terpenuhi
            if (!prod || !kode || !qty || qty < 12) return;

            let tierKey = getTierString(qty);
            if (!tierKey) return;

            // Get Modal Produk
            let prodData = db.modalProduk.find(p => p.produk === prod && p.kode === kode);
            let modalProduk = prodData ? Number(prodData.harga_modal) : 0;

            // Get Modal Logo (Bisa Kosong / Tanpa Logo)
            let modalLogo = 0;
            if (logo !== "") {
                let logoData = db.modalLogo.find(l => l.produk === prod && l.proses_logo === logo);
                modalLogo = logoData ? getValidTierValue(logoData, tierKey) : 0;
            }

            // Get Margin (Mutlak hanya berdasarkan produk)
            let marginData = db.margin.find(m => m.produk === prod);
            let marginVal = marginData ? getValidTierValue(marginData, tierKey) : 1.0;
            if (marginVal === 0) marginVal = 1.0;

            let hargaJual = (modalProduk + modalLogo) * marginVal;

            document.getElementById('prev_mod_prod').innerText = formatRp(modalProduk);
            document.getElementById('prev_tier').innerText = tierKey.replace('_', ' ').toUpperCase();
            document.getElementById('prev_mod_logo').innerText = formatRp(modalLogo);
            document.getElementById('prev_margin').innerText = marginVal;
            document.getElementById('prev_total').innerText = formatRp(hargaJual);
        }

        function saveCalculation() {
            let sales = document.getElementById('calc_sales').value;
            let prod = document.getElementById('calc_produk').value;
            let kode = document.getElementById('calc_kode').value;
            let logo = document.getElementById('calc_logo').value;
            let qty = document.getElementById('calc_qty').value;

            if (!sales || !prod || !kode || !qty || qty < 12) {
                Swal.fire('Oops', 'Lengkapi semua field dan Pastikan Qty minimal 12.', 'warning'); return;
            }

            let tierKey = getTierString(qty);
            let modalProduk = Number(db.modalProduk.find(p => p.produk === prod && p.kode === kode).harga_modal);

            let modalLogo = 0;
            if (logo !== "") {
                let logoData = db.modalLogo.find(l => l.produk === prod && l.proses_logo === logo);
                modalLogo = logoData ? getValidTierValue(logoData, tierKey) : 0;
            }

            // Get Margin (Mutlak hanya berdasarkan produk)
            let marginData = db.margin.find(m => m.produk === prod);
            let marginVal = marginData ? getValidTierValue(marginData, tierKey) : 1.0;
            if (marginVal === 0) marginVal = 1.0;

            let hargaJual = (modalProduk + modalLogo) * marginVal;

            let data = {
                id: editingId, // Penting untuk Edit (Jika NULL artinya Data Baru)
                sales: sales, produk: prod, kode: kode, proses_logo: logo, qty: qty,
                modal_produk: modalProduk, modal_logo: modalLogo, margin: marginVal, harga_jual: hargaJual
            };

            processSave('Perhitungan', data, 'modalCalc');
        }

        function generateSPHNumber() {
            if (editingId) return; // Jangan timpa jika sedang mode Edit
            let brandName = document.getElementById('sph_brand').value;
            let sphNoInput = document.getElementById('sph_no');
            if (!brandName) {
                sphNoInput.value = '';
                return;
            }

            let brandObj = db.brands.find(b => b.nama_brand === brandName);
            let singkatan = brandObj && brandObj.singkatan ? brandObj.singkatan : brandName.substring(0, 2).toUpperCase();

            // Total SPH counter (jumlah saat ini + 1)
            let count = db.sph.filter(x => x.brand === brandName).length + 1;
            let counterStr = count.toString().padStart(4, '0');

            let romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            let currentMonth = romanMonths[new Date().getMonth()];
            let currentYear = new Date().getFullYear();

            // Format: SPH 0001/MH/VII/2026
            sphNoInput.value = `SPH ${counterStr}/${singkatan}/${currentMonth}/${currentYear}`;
        }

        function buatSPH(perhitunganId) {
            editingId = null; // Set ke Mode Baru
            let hitung = db.perhitungan.find(x => x.id === perhitunganId);
            if (!hitung) return;

            document.getElementById('formSPH').reset();
            document.getElementById('sph_ref_id').value = hitung.id;
            document.getElementById('sph_tanggal').value = hitung.tanggal;

            document.getElementById('sph_preview_item').innerText = hitung.produk + ' (' + (hitung.proses_logo || 'Tanpa Logo') + ')';
            document.getElementById('sph_preview_qty').innerText = hitung.qty;
            document.getElementById('sph_preview_harga').innerText = formatRp(hitung.harga_jual);

            let optBrand = '<option value="">-- Pilih Brand --</option>';
            db.brands.forEach(b => optBrand += `<option value="${b.nama_brand}">${b.nama_brand}</option>`);
            document.getElementById('sph_brand').innerHTML = optBrand;

            let optSales = '<option value="">-- Pilih Sales --</option>';
            db.users.forEach(u => optSales += `<option value="${u.nama}">${u.nama}</option>`);
            document.getElementById('sph_sales').innerHTML = optSales;
            document.getElementById('sph_sales').value = hitung.sales || '';

            let optKet = '<option value="">-- Keterangan --</option>';
            db.keterangan.forEach(k => optKet += `<option value="${k.isi_keterangan}">${k.isi_keterangan}</option>`);
            document.getElementById('sph_keterangan').innerHTML = optKet;
            
            document.getElementById('sph_status').value = 'Draft';

            let sphModalEl = document.getElementById('modalSPH');
            (bootstrap.Modal.getInstance(sphModalEl) || new bootstrap.Modal(sphModalEl)).show();
        }

        function saveSPH() {
            let refId = document.getElementById('sph_ref_id').value;
            let hitung = db.perhitungan.find(x => x.id === refId);
            let existingSPH = editingId ? db.sph.find(x => x.id === editingId) : null;

            let data = {
                id: editingId, // Penting agar bisa update data lama
                tanggal: document.getElementById('sph_tanggal').value,
                brand: document.getElementById('sph_brand').value,
                no_sph: document.getElementById('sph_no').value,
                nama_pt: document.getElementById('sph_pt').value,
                deskripsi: document.getElementById('sph_deskripsi').value,
                produk: hitung ? hitung.produk : (existingSPH ? existingSPH.produk : ''),
                qty: hitung ? hitung.qty : (existingSPH ? existingSPH.qty : 0),
                harga_jual: hitung ? hitung.harga_jual : (existingSPH ? existingSPH.harga_jual : 0),
                ref_id: refId,
                sales: document.getElementById('sph_sales').value,
                status_sph: document.getElementById('sph_status').value,
                keterangan: document.getElementById('sph_keterangan').value
            };

            if (!data.brand || !data.no_sph || !data.nama_pt) {
                Swal.fire('Oops', 'Harap isi Brand, Nomor SPH, dan Nama PT', 'warning'); return;
            }

            processSave('SPH', data, 'modalSPH');
        }

        function editData(sheetName, id) {
            editingId = id;
            let item;

            if (sheetName === 'Perhitungan') {
                item = db.perhitungan.find(x => x.id === id);
                if (item) {
                    populateSalesDropdown();
                    let uniqueProducts = [...new Set(db.modalProduk.map(p => p.produk))];
                    let optProduk = '<option value="">-- Pilih Produk --</option>';
                    uniqueProducts.forEach(p => optProduk += `<option value="${p}">${p}</option>`);
                    document.getElementById('calc_produk').innerHTML = optProduk;

                    document.getElementById('calc_sales').value = item.sales;
                    document.getElementById('calc_produk').value = item.produk;
                    handleProductChange();

                    document.getElementById('calc_kode').value = item.kode;
                    document.getElementById('calc_logo').value = item.proses_logo;
                    document.getElementById('calc_qty').value = item.qty;
                    calculatePreview();

                    let calcModalEl2 = document.getElementById('modalCalc');
                    (bootstrap.Modal.getInstance(calcModalEl2) || new bootstrap.Modal(calcModalEl2)).show();
                }
            } else if (sheetName === 'SPH') {
                item = db.sph.find(x => x.id === id);
                if (item) {
                    document.getElementById('formSPH').reset();
                    document.getElementById('sph_ref_id').value = item.ref_id;
                    document.getElementById('sph_tanggal').value = item.tanggal;

                    document.getElementById('sph_preview_item').innerText = item.produk;
                    document.getElementById('sph_preview_qty').innerText = item.qty;
                    document.getElementById('sph_preview_harga').innerText = formatRp(item.harga_jual);

                    let optBrand = '<option value="">-- Pilih Brand --</option>';
                    db.brands.forEach(b => optBrand += `<option value="${b.nama_brand}">${b.nama_brand}</option>`);
                    document.getElementById('sph_brand').innerHTML = optBrand;

                    let optSales = '<option value="">-- Pilih Sales --</option>';
                    db.users.forEach(u => optSales += `<option value="${u.nama}">${u.nama}</option>`);
                    document.getElementById('sph_sales').innerHTML = optSales;

                    let optKet = '<option value="">-- Keterangan --</option>';
                    db.keterangan.forEach(k => optKet += `<option value="${k.isi_keterangan}">${k.isi_keterangan}</option>`);
                    document.getElementById('sph_keterangan').innerHTML = optKet;

                    document.getElementById('sph_brand').value = item.brand;
                    document.getElementById('sph_no').value = item.no_sph;
                    document.getElementById('sph_pt').value = item.nama_pt;
                    document.getElementById('sph_deskripsi').value = item.deskripsi;
                    document.getElementById('sph_sales').value = item.sales || '';
                    document.getElementById('sph_status').value = item.status_sph || 'Draft';
                    document.getElementById('sph_keterangan').value = item.keterangan || '';

                    let sphModalEl2 = document.getElementById('modalSPH');
                    (bootstrap.Modal.getInstance(sphModalEl2) || new bootstrap.Modal(sphModalEl2)).show();
                }
            } else if (sheetName === 'modalProduk' || sheetName === 'users' || sheetName === 'divisi' || sheetName === 'brands') {
                item = db[sheetName].find(x => x.id === id);
                if (item) {
                    openGeneralModal(sheetName);
                    setTimeout(() => {
                        if (sheetName === 'modalProduk') {
                            document.getElementById('g_produk').value = item.produk;
                            document.getElementById('g_kode').value = item.kode;
                            document.getElementById('g_harga').value = item.harga_modal;
                        } else if (sheetName === 'users') {
                            document.getElementById('g_nama').value = item.nama;
                            document.getElementById('g_email').value = item.email;
                        } else if (sheetName === 'divisi') {
                            document.getElementById('g_nama_divisi').value = item.nama_divisi;
                        } else if (sheetName === 'brands') {
                            document.getElementById('g_nama_brand').value = item.nama_brand;
                            document.getElementById('g_singkatan').value = item.singkatan || '';
                        } else if (sheetName === 'produk') {
                            document.getElementById('g_nama_produk').value = item.nama_produk;
                        } else if (sheetName === 'keterangan') {
                            document.getElementById('g_isi_keterangan').value = item.isi_keterangan;
                        }
                    }, 100);
                }
            } else if (sheetName === 'modal_logo' || sheetName === 'margin') {
                let actualSheet = sheetName === 'modal_logo' ? 'modalLogo' : 'margin';
                item = db[actualSheet].find(x => x.id === id);
                if (item) {
                    openGeneralModal(sheetName);
                    setTimeout(() => {
                        document.getElementById('g_produk').value = item.produk;
                        if (sheetName === 'modal_logo') {
                            document.getElementById('g_logo').value = item.proses_logo;
                        }
                        ['12', '24', '50', '75', '100', '150', '200', '300', '500'].forEach(q => {
                            document.getElementById(`g_qty_${q}`).value = item[`qty_${q}`];
                        });
                    }, 100);
                }
            }
        }

        function openGeneralModal(type) {
            if (!editingId) editingId = null;
            currentFormType = type;
            let body = '';
            let title = '';

            let optProduk = '<option value="">-- Pilih Produk --</option>';
            if (db.produk && db.produk.length > 0) {
                db.produk.forEach(p => optProduk += `<option value="${p.nama_produk}">${p.nama_produk}</option>`);
            } else {
                let uniqueProducts = [...new Set(db.modalProduk.map(p => p.produk))];
                uniqueProducts.forEach(p => optProduk += `<option value="${p}">${p}</option>`);
            }

            if (type === 'modalProduk') {
                title = 'Tambah Modal Produk';
                body = `
                    <div class="mb-3"><label>Nama Produk</label><select id="g_produk" class="form-select" required>${optProduk}</select></div>
                    <div class="mb-3"><label>Kode Produk</label><input type="text" id="g_kode" class="form-control" required></div>
                    <div class="mb-3"><label>Harga Modal (Rp)</label><input type="number" id="g_harga" class="form-control" required></div>
                `;
            } else if (type === 'users') {
                title = 'Tambah User / Sales';
                body = `
                    <div class="mb-3"><label>Nama Lengkap</label><input type="text" id="g_nama" class="form-control" required></div>
                    <div class="mb-3"><label>Email</label><input type="email" id="g_email" class="form-control" required></div>
                `;
            } else if (type === 'divisi') {
                title = 'Tambah Divisi';
                body = `<div class="mb-3"><label>Nama Divisi</label><input type="text" id="g_nama_divisi" class="form-control" required></div>`;
            } else if (type === 'brands') {
                title = 'Tambah Brand';
                body = `
                    <div class="mb-3"><label>Nama Brand</label><input type="text" id="g_nama_brand" class="form-control" required></div>
                    <div class="mb-3"><label>Singkatan (Utk SPH)</label><input type="text" id="g_singkatan" class="form-control" placeholder="Cth: MH" required></div>
                `;
            } else if (type === 'produk') {
                title = 'Tambah Produk Master';
                body = `<div class="mb-3"><label>Nama Produk</label><input type="text" id="g_nama_produk" class="form-control" required></div>`;
            } else if (type === 'keterangan') {
                title = 'Tambah Keterangan SPH';
                body = `<div class="mb-3"><label>Isi Keterangan</label><textarea id="g_isi_keterangan" class="form-control" rows="3" required></textarea></div>`;
            } else if (type === 'modal_logo' || type === 'margin') {
                title = type === 'margin' ? 'Tambah Margin' : 'Tambah Modal Logo';
                let logoInput = type === 'modal_logo' ? `<div class="mb-3"><label>Proses Logo</label><input type="text" id="g_logo" class="form-control" placeholder="Kosongkan jika 'Tanpa Logo'"></div>` : '';
                body = `
                    <div class="mb-3"><label>Nama Produk</label><select id="g_produk" class="form-select" required>${optProduk}</select></div>
                    ${logoInput}
                    <div class="row">
                        ${['12', '24', '50', '75', '100', '150', '200', '300', '500'].map(q =>
                    `<div class="col-4 mb-2"><label>Qty ${q}</label><input type="${type === 'margin' ? 'number' : 'number'}" step="${type === 'margin' ? '0.01' : '1'}" id="g_qty_${q}" class="form-control form-control-sm" required></div>`
                ).join('')}
                    </div>
                `;
            }

            document.getElementById('modalGeneralTitle').innerText = title;
            document.getElementById('modalGeneralBody').innerHTML = body;

            if (!editingId) {
                document.getElementById('formGeneral').reset();
            }
            let genModalEl = document.getElementById('modalGeneral');
            (bootstrap.Modal.getInstance(genModalEl) || new bootstrap.Modal(genModalEl)).show();
        }

        function saveGeneralForm() {
            let data = {};
            let sheetName = '';

            if (currentFormType === 'modalProduk') {
                sheetName = 'ModalProduk';
                data = {
                    id: editingId,
                    produk: document.getElementById('g_produk').value,
                    kode: document.getElementById('g_kode').value,
                    harga_modal: document.getElementById('g_harga').value
                };
            } else if (currentFormType === 'users') {
                sheetName = 'Users';
                data = { id: editingId, nama: document.getElementById('g_nama').value, email: document.getElementById('g_email').value };
            } else if (currentFormType === 'divisi') {
                sheetName = 'Divisi';
                data = { id: editingId, nama_divisi: document.getElementById('g_nama_divisi').value };
            } else if (currentFormType === 'brands') {
                sheetName = 'Brands';
                data = { id: editingId, nama_brand: document.getElementById('g_nama_brand').value, singkatan: document.getElementById('g_singkatan').value };
            } else if (currentFormType === 'produk') {
                sheetName = 'Produk';
                data = { id: editingId, nama_produk: document.getElementById('g_nama_produk').value };
            } else if (currentFormType === 'keterangan') {
                sheetName = 'Keterangan';
                data = { id: editingId, isi_keterangan: document.getElementById('g_isi_keterangan').value };
            } else if (currentFormType === 'modal_logo' || currentFormType === 'margin') {
                sheetName = currentFormType === 'margin' ? 'Margin' : 'ModalLogo';
                data = { id: editingId, produk: document.getElementById('g_produk').value };
                if (currentFormType === 'modal_logo') {
                    data.proses_logo = document.getElementById('g_logo').value;
                }
                ['12', '24', '50', '75', '100', '150', '200', '300', '500'].forEach(q => {
                    data[`qty_${q}`] = document.getElementById(`g_qty_${q}`).value;
                });
            }

            processSave(sheetName, data, 'modalGeneral');
        }

        function processSave(sheetName, data, modalId) {
            startLoading();
            let modalEl = document.getElementById(modalId);
            if (modalEl) {
                let modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }
            editingId = null; // Reset setelah save dipanggil

            if (typeof google === 'undefined') {
                setTimeout(() => {
                    let key = sheetName === 'ModalProduk' ? 'modalProduk' :
                        sheetName === 'ModalLogo' ? 'modalLogo' :
                            sheetName === 'Margin' ? 'margin' :
                                sheetName === 'Users' ? 'users' :
                                    sheetName === 'Divisi' ? 'divisi' :
                                        sheetName === 'Brands' ? 'brands' :
                                            sheetName === 'SPH' ? 'sph' : 'perhitungan';

                    if (!data.id) {
                        data.id = "SIM-" + new Date().getTime();
                        if ((sheetName === 'Perhitungan' || sheetName === 'SPH') && !data.tanggal) {
                            data.tanggal = new Date().toLocaleDateString('id-ID');
                        }

                        if (sheetName === 'Perhitungan' || sheetName === 'SPH') db[key].unshift(data);
                        else db[key].push(data);
                    } else {
                        let index = db[key].findIndex(x => x.id === data.id);
                        if (index !== -1) {
                            if ((sheetName === 'Perhitungan' || sheetName === 'SPH') && !data.tanggal) {
                                data.tanggal = db[key][index].tanggal;
                            }
                            db[key][index] = { ...db[key][index], ...data };
                        }
                    }

                    Swal.fire('Sukses', 'Data berhasil disimpan (Mode Simulasi)', 'success');
                    renderUI();
                    endLoading();
                }, 500);
            } else {
                google.script.run
                    .withSuccessHandler(res => {
                        endLoading();
                        Swal.fire('Sukses', res, 'success');
                        silentLoadData();
                    })
                    .withFailureHandler(err => {
                        console.error(err);
                        endLoading();
                        Swal.fire('Oops', 'Gagal menyimpan data.', 'error');
                    })
                    .saveData(sheetName, data);
            }
        }

        function hapusData(sheetName, id) {
            Swal.fire({
                title: 'Hapus Data?', text: "Data ini tidak dapat dikembalikan!",
                icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!'
            }).then((result) => {
                if (result.isConfirmed) {
                    startLoading();
                    if (typeof google === 'undefined') {
                        setTimeout(() => {
                            let key = sheetName;
                            if (sheetName === 'ModalProduk') key = 'modalProduk';
                            if (sheetName === 'ModalLogo') key = 'modalLogo';
                            if (sheetName === 'Users') key = 'users';
                            if (sheetName === 'Divisi') key = 'divisi';
                            if (sheetName === 'Brands') key = 'brands';
                            if (sheetName === 'Produk') key = 'produk';
                            if (sheetName === 'Keterangan') key = 'keterangan';
                            if (sheetName === 'SPH') key = 'sph';
                            if (sheetName === 'Margin') key = 'margin';
                            if (sheetName === 'Perhitungan') key = 'perhitungan';

                            db[key] = db[key].filter(x => x.id !== id);
                            renderUI();
                            endLoading();
                            Swal.fire('Terhapus', 'Data dihapus (Mode Simulasi)', 'success');
                        }, 500);
                    } else {
                        google.script.run
                            .withSuccessHandler(res => { loadData(); })
                            .deleteData(sheetName, id);
                    }
                }
            });
        }

        function formatRp(angka) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
        }

        function filterTable(val) {
            val = val.toLowerCase();
            let table = document.getElementById('dataTable');
            let trs = table.getElementsByTagName('tr');

            for (let i = 1; i < trs.length; i++) {
                let rowText = trs[i].innerText.toLowerCase();
                trs[i].style.display = rowText.includes(val) ? '' : 'none';
            }
        }

        function getValidTierValue(row, tierKey) {
            if (!row) return 0;
            let tiers = ['qty_12', 'qty_24', 'qty_50', 'qty_75', 'qty_100', 'qty_150', 'qty_200', 'qty_300', 'qty_500'];
            let startIndex = tiers.indexOf(tierKey);
            if (startIndex === -1) return 0;

            for (let i = startIndex; i >= 0; i--) {
                let val = row[tiers[i]];
                // Abaikan jika kosong, string kosong, atau 0
                if (val !== "" && val !== undefined && val !== null && !isNaN(val) && Number(val) !== 0) {
                    return Number(val);
                }
            }
            return 0; // Fallback jika tidak ada data sama sekali
        }

        function getTierString(qty) {
            let q = Number(qty);
            if (q >= 500) return 'qty_500';
            if (q >= 300) return 'qty_300';
            if (q >= 200) return 'qty_200';
            if (q >= 150) return 'qty_150';
            if (q >= 100) return 'qty_100';
            if (q >= 75) return 'qty_75';
            if (q >= 50) return 'qty_50';
            if (q >= 24) return 'qty_24';
            if (q >= 12) return 'qty_12';
            return null;
        }
    