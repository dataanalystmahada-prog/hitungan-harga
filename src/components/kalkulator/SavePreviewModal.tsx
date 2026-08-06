import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatRupiah } from '../../utils/formatters';
import { Save, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMasterData } from '../../hooks/useMasterData';
import { calculateMaxDiskon } from '../../utils/discountEngine';

interface SavePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (globalDiskon: number, deskripsi: string, finalNamaPt?: string) => Promise<void>;
  items: any[];
  totalKotor: number;
  isSaving: boolean;
  defaultNamaPt?: string;
}

export const SavePreviewModal: React.FC<SavePreviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  items,
  totalKotor,
  isSaving,
  defaultNamaPt = '',
}) => {
  const { role } = useAuth();
  const { keterangan } = useMasterData();
  const [diskon, setDiskon] = useState<number>(0);
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [namaPt, setNamaPt] = useState<string>(defaultNamaPt);

  useEffect(() => {
    if (isOpen) {
      setNamaPt(defaultNamaPt || '');
    }
  }, [isOpen, defaultNamaPt]);

  const totalBersih = totalKotor - diskon;
  const totalPcs = items.reduce((acc, it) => acc + (it.qty || 0), 0);
  const maxDiskonInfo = calculateMaxDiskon(totalBersih, totalPcs);

  const pesanDiskonObj = keterangan.find(
    k => k.id === 'PESAN_DISKON' || (k.isi_keterangan && k.isi_keterangan.toLowerCase().includes('sayangi diskon'))
  );
  const pesanDiskon = pesanDiskonObj?.isi_keterangan || 'Sayangi diskonnya seperti menyayangi gaji di tanggal 25. Jangan habis di awal bulan. 🤣';

  const handleSave = async () => {
    await onSave(diskon, deskripsi, namaPt);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Simpan Perhitungan"
      subtitle="Tinjau Nama Klien, total harga, dan diskon sebelum menyimpan ke database."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSave}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Simpan ke Database
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Client info */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Nama Klien / Perusahaan</span>
          </label>
          <textarea
            rows={2}
            value={namaPt}
            onChange={(e) => setNamaPt(e.target.value)}
            placeholder="Contoh: PT Bank Central Asia Tbk&#10;Up. Ibu Rina (Procurement)"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-y"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Nama klien ini akan tersimpan otomatis ke Data Perhitungan & SPH. (Bisa Enter untuk baris baru)</p>
        </div>

        {/* Item Summary list (max 3, then "...") */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <h4 className="font-semibold mb-1.5 text-slate-800 dark:text-slate-200">Rincian Item ({items.length})</h4>
          <ul className="space-y-1 mb-2">
            {items.slice(0, 3).map((it, idx) => (
              <li key={idx} className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{it.qty}x {it.produk || it.namaProduk}</span>
                <span className="font-mono">{formatRupiah(it.totalHargaJualKotor || it.calculation?.totalHargaJualKotor || 0)}</span>
              </li>
            ))}
            {items.length > 3 && (
              <li className="text-[10px] italic text-slate-400">+ {items.length - 3} item lainnya...</li>
            )}
          </ul>
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
            <span>Total Harga (Kotor)</span>
            <span className="font-mono">{formatRupiah(totalKotor)}</span>
          </div>
        </div>

        {/* Form Diskon & Deskripsi */}
        <div className="flex flex-col gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diskon Global (Rp)
            </label>
            <input
              type="number"
              min={0}
              max={totalKotor}
              value={diskon || ''}
              onChange={(e) => setDiskon(Math.min(totalKotor, Math.max(0, parseInt(e.target.value) || 0)))}
              placeholder="Contoh: 50000"
              className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            {role === 'sales' && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-500/30 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-amber-200">
                  <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                    Max Diskon (Kategori A - {maxDiskonInfo.persentase}%):
                  </span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                    {formatRupiah(maxDiskonInfo.maxNominal)}
                  </span>
                </div>
                <p className="text-[11px] italic text-slate-600 dark:text-slate-300 mt-1">
                  "{pesanDiskon}"
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Catatan Perhitungan
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tambahkan catatan khusus jika diperlukan..."
              className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-850 flex justify-between items-center font-bold text-indigo-900 dark:text-indigo-100">
          <span className="text-xs">Grand Total (Net)</span>
          <span className="text-sm sm:text-base font-mono">{formatRupiah(totalBersih)}</span>
        </div>
      </div>
    </Modal>
  );
};
