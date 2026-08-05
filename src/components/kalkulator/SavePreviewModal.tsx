import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatRupiah } from '../../utils/formatters';
import { Save } from 'lucide-react';

interface SavePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (globalDiskon: number, deskripsi: string) => Promise<void>;
  items: any[];
  totalKotor: number;
  isSaving: boolean;
}

export const SavePreviewModal: React.FC<SavePreviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  items,
  totalKotor,
  isSaving,
}) => {
  const [diskon, setDiskon] = useState<number>(0);
  const [deskripsi, setDeskripsi] = useState<string>('');

  const totalBersih = totalKotor - diskon;

  const handleSave = async () => {
    await onSave(diskon, deskripsi);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Simpan Perhitungan"
      subtitle="Tinjau total harga dan tentukan diskon global sebelum menyimpan ke database."
      maxWidth="xl"
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
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan ke Database
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Item Summary list (max 3, then "...") */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
          <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Rincian Item ({items.length})</h4>
          <ul className="space-y-1 mb-2">
            {items.slice(0, 3).map((it, idx) => (
              <li key={idx} className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{it.qty}x {it.produk || it.namaProduk}</span>
                <span>{formatRupiah(it.totalHargaJualKotor || it.calculation?.totalHargaJualKotor || 0)}</span>
              </li>
            ))}
            {items.length > 3 && (
              <li className="text-xs italic text-slate-400">+ {items.length - 3} item lainnya...</li>
            )}
          </ul>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
            <span>Total Harga (Kotor)</span>
            <span>{formatRupiah(totalKotor)}</span>
          </div>
        </div>

        {/* Form Diskon & Deskripsi */}
        <div className="flex flex-col gap-3 mt-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diskon Global (Rp)
            </label>
            <input
              type="number"
              min={0}
              max={totalKotor}
              value={diskon || ''}
              onChange={(e) => setDiskon(Math.min(totalKotor, Math.max(0, parseInt(e.target.value) || 0)))}
              placeholder="Contoh: 50000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Nama Project (khusus SPH)
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Contoh: Pengadaan Merchandise & Apparel Promosi Resmi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex justify-between items-center font-bold text-indigo-900 dark:text-indigo-100">
          <span>Grand Total (Net)</span>
          <span className="text-lg">{formatRupiah(totalBersih)}</span>
        </div>
      </div>
    </Modal>
  );
};
