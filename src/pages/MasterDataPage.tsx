import React, { useState } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatRupiah } from '../utils/formatters';
import {
  Database,
  Layers,
  FileSpreadsheet,
  Building,
  Users,
  Info,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ModalProduk,
  ModalLogo,
  Margin,
  Brand,
  UserSales,
  Divisi,
  Keterangan,
} from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import { MasterDataRepository } from '../repositories/masterDataRepository';

type MasterTab = 'modal_produk' | 'modal_logo' | 'margin' | 'brands' | 'users' | 'keterangan';

export const MasterDataPage: React.FC = () => {
  const { role } = useAuth();
  const { modalProduk, modalLogo, margin, brands, users, divisi, keterangan, refetch } = useMasterData();
  const [activeTab, setActiveTab] = useState<MasterTab>('modal_produk');

  // Form states for User
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserSales>>({ role: 'sales', pin: '123456' });

  // Form states for Divisi
  const [isAddingDivisi, setIsAddingDivisi] = useState(false);
  const [newDivisi, setNewDivisi] = useState<Partial<Divisi>>({});

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Lock className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Akses Ditolak</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Halaman Master Data hanya dapat diakses oleh Admin. Silakan hubungi administrator Anda jika membutuhkan akses.
        </p>
      </div>
    );
  }

  const handleSaveUser = async () => {
    if (!newUser.nama) return alert('Nama harus diisi');
    const userToSave = { ...newUser, id: newUser.id || `USR-${Date.now()}` };
    const success = await MasterDataRepository.createUser(userToSave);
    if (success) {
      alert('Berhasil menyimpan user');
      setIsAddingUser(false);
      setNewUser({ role: 'sales', pin: '123456' });
      refetch();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      await MasterDataRepository.deleteUser(id);
      refetch();
    }
  };

  const handleSaveDivisi = async () => {
    if (!newDivisi.nama_divisi) return alert('Nama divisi harus diisi');
    const divToSave = { ...newDivisi, id: newDivisi.id || `DIV-${Date.now()}` };
    const success = await MasterDataRepository.createDivisi(divToSave);
    if (success) {
      alert('Berhasil menyimpan divisi');
      setIsAddingDivisi(false);
      setNewDivisi({});
      refetch();
    }
  };

  const handleDeleteDivisi = async (id: string) => {
    if (confirm('Yakin ingin menghapus divisi ini?')) {
      await MasterDataRepository.deleteDivisi(id);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Master Data & Referensi Spreadsheet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data master tersinkronisasi dari Google Spreadsheet ke Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Master Data Dikelola di Google Sheet</span>
          </div>
          <Link to="/sync-monitor">
            <Button variant="outline" size="sm">
              Sync Sekarang
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('modal_produk')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'modal_produk'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Modal Produk ({modalProduk.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('modal_logo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'modal_logo'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Modal Logo Sablon/Bordir ({modalLogo.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('margin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'margin'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Matriks Margin ({margin.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'brands'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Brand & Rekening ({brands.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Sales & Divisi ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('keterangan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'keterangan'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Keterangan Terms ({keterangan.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'modal_produk' && (
        <Card className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4 font-mono">Kode</th>
                <th className="py-3 px-4 text-right">Harga Modal Dasar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {modalProduk.map((item: ModalProduk) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{item.produk}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{item.kode}</td>
                  <td className="py-3 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatRupiah(item.harga_modal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'modal_logo' && (
        <Card className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Produk</th>
                <th className="py-3 px-3">Proses Logo</th>
                <th className="py-3 px-2 text-right">Qty 12</th>
                <th className="py-3 px-2 text-right">Qty 24</th>
                <th className="py-3 px-2 text-right">Qty 50</th>
                <th className="py-3 px-2 text-right">Qty 75</th>
                <th className="py-3 px-2 text-right">Qty 100</th>
                <th className="py-3 px-2 text-right">Qty 150</th>
                <th className="py-3 px-2 text-right">Qty 200</th>
                <th className="py-3 px-2 text-right">Qty 300</th>
                <th className="py-3 px-2 text-right">Qty 500</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {modalLogo.map((item: ModalLogo) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{item.produk}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{item.proses_logo}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_12)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_24)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_50)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_75)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_100)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_150)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_200)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_300)}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatRupiah(item.qty_500)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'margin' && (
        <Card className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Produk</th>
                <th className="py-3 px-3">Proses Logo</th>
                <th className="py-3 px-2 text-center">12 pcs</th>
                <th className="py-3 px-2 text-center">24 pcs</th>
                <th className="py-3 px-2 text-center">50 pcs</th>
                <th className="py-3 px-2 text-center">75 pcs</th>
                <th className="py-3 px-2 text-center">100 pcs</th>
                <th className="py-3 px-2 text-center">150 pcs</th>
                <th className="py-3 px-2 text-center">200 pcs</th>
                <th className="py-3 px-2 text-center">300 pcs</th>
                <th className="py-3 px-2 text-center">500 pcs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {margin.map((item: Margin) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{item.produk}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{item.proses_logo}</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_12}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_24}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_50}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_75}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_100}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_150}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_200}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_300}%</td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-600">{item.qty_500}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((b: Brand) => (
            <Card key={b.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{b.nama_brand}</h4>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-brand-500/10 text-brand-600">
                    {b.singkatan}
                  </span>
                </div>
                <div className="flex flex-col gap-2 my-3 text-xs text-slate-600 dark:text-slate-400">
                  <p><b>Alamat:</b> {b.alamat}</p>
                  <p><b>Kontak:</b> {b.no_telp_kantor} | {b.no_telp_wa} ({b.email})</p>
                  <p><b>Sosmed / Web:</b> {b.sosial_media} | {b.website}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100">Rekening Resmi:</p>
                <p className="font-mono text-slate-800 dark:text-slate-200 font-bold mt-0.5">
                  {b.bank} - {b.no_rekening}
                </p>
                <p className="text-[11px] text-slate-400">A.N: {b.atas_nama}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Sales & Admin</h4>
              <Button size="sm" onClick={() => setIsAddingUser(!isAddingUser)}>
                {isAddingUser ? 'Batal' : 'Tambah'}
              </Button>
            </div>
            
            {isAddingUser && (
              <div className="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 bg-slate-50 dark:bg-slate-800">
                <input 
                  type="text" placeholder="Nama Lengkap" 
                  className="w-full text-sm p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={newUser.nama || ''} onChange={e => setNewUser({...newUser, nama: e.target.value})} 
                />
                <input 
                  type="email" placeholder="Email" 
                  className="w-full text-sm p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})} 
                />
                <select 
                  className="w-full text-sm p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={newUser.role || 'sales'} onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                  <option value="purchasing">Purchasing</option>
                </select>
                <input 
                  type="text" placeholder="PIN (Default: 123456)" 
                  className="w-full text-sm p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={newUser.pin || ''} onChange={e => setNewUser({...newUser, pin: e.target.value})} 
                />
                <Button size="sm" variant="primary" onClick={handleSaveUser} className="w-full">Simpan</Button>
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {users.map((u: UserSales) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between group">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">{u.nama}</span>
                    <span className="text-slate-400 font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 mt-1 inline-block">
                      {u.role || 'sales'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono hidden sm:inline-block">{u.email}</span>
                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Divisi</h4>
              <Button size="sm" onClick={() => setIsAddingDivisi(!isAddingDivisi)}>
                {isAddingDivisi ? 'Batal' : 'Tambah'}
              </Button>
            </div>

            {isAddingDivisi && (
              <div className="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 bg-slate-50 dark:bg-slate-800">
                <input 
                  type="text" placeholder="Nama Divisi" 
                  className="w-full text-sm p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  value={newDivisi.nama_divisi || ''} onChange={e => setNewDivisi({...newDivisi, nama_divisi: e.target.value})} 
                />
                <Button size="sm" variant="primary" onClick={handleSaveDivisi} className="w-full">Simpan</Button>
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {divisi.map((d: Divisi) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between group">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">{d.nama_divisi}</span>
                    <span className="text-[10px] font-mono text-slate-400">{d.id}</span>
                  </div>
                  <button onClick={() => handleDeleteDivisi(d.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">Hapus</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'keterangan' && (
        <Card className="p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Template Syarat & Ketentuan SPH</h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {keterangan.map((k: Keterangan, idx: number) => (
              <div key={k.id} className="py-3 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500 flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{k.isi_keterangan}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
