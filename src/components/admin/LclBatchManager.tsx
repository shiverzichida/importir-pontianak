'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarClock,
  Check,
  Container,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { formatDateOnly, formatNumberId } from '@/lib/format';
import type {
  LclBatch,
  LclBatchStatus,
  OriginCountry,
  ShippingMethod,
} from '@/lib/types';

const STATUS_OPTIONS: Array<{ value: LclBatchStatus; label: string }> = [
  { value: 'open', label: 'Masih Dibuka' },
  { value: 'almost_full', label: 'Hampir Penuh' },
  { value: 'closed', label: 'Stuffing Ditutup' },
  { value: 'sailing', label: 'Dalam Pelayaran' },
  { value: 'arrived', label: 'Tiba di Pontianak' },
];

const ORIGIN_OPTIONS: Array<{
  value: OriginCountry;
  label: string;
  defaultWh: string;
  defaultMethod: ShippingMethod;
  defaultContainer: string;
}> = [
  {
    value: 'china',
    label: 'China (Guangzhou / Yiwu)',
    defaultWh: 'Gudang Baiyun Guangzhou',
    defaultMethod: 'laut',
    defaultContainer: '20ft (28 CBM)',
  },
  {
    value: 'malaysia',
    label: 'Malaysia / Kuching',
    defaultWh: 'Gudang Pending Industrial Kuching',
    defaultMethod: 'darat',
    defaultContainer: 'Armada Box Lintas Batas (15 CBM)',
  },
  {
    value: 'singapura',
    label: 'Singapura (Tuas / Changi)',
    defaultWh: 'Gudang Tuas Singapura',
    defaultMethod: 'laut',
    defaultContainer: 'LCL Express (15 CBM)',
  },
];

interface BatchFormState {
  batch_code: string;
  title: string;
  origin_country: OriginCountry;
  origin_warehouse: string;
  shipping_method: ShippingMethod;
  container_size: string;
  capacity_cbm: string;
  filled_cbm: string;
  min_slot_cbm: string;
  cutoff_date: string;
  etd_date: string;
  eta_date: string;
  status: LclBatchStatus;
  notes: string;
  is_active: boolean;
  sort_order: string;
}

function futureDateStr(daysFromNow: number): string {
  const d = new Date(Date.now() + daysFromNow * 86400_000);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM: BatchFormState = {
  batch_code: '',
  title: '',
  origin_country: 'china',
  origin_warehouse: 'Gudang Baiyun Guangzhou',
  shipping_method: 'laut',
  container_size: '20ft (28 CBM)',
  capacity_cbm: '28',
  filled_cbm: '0',
  min_slot_cbm: '0.1',
  cutoff_date: futureDateStr(7),
  etd_date: futureDateStr(10),
  eta_date: futureDateStr(38),
  status: 'open',
  notes: '',
  is_active: true,
  sort_order: '10',
};

function batchToForm(b: LclBatch): BatchFormState {
  return {
    batch_code: b.batch_code,
    title: b.title,
    origin_country: b.origin_country,
    origin_warehouse: b.origin_warehouse,
    shipping_method: b.shipping_method,
    container_size: b.container_size,
    capacity_cbm: String(b.capacity_cbm),
    filled_cbm: String(b.filled_cbm),
    min_slot_cbm: String(b.min_slot_cbm),
    cutoff_date: b.cutoff_date.slice(0, 10),
    etd_date: b.etd_date ? b.etd_date.slice(0, 10) : '',
    eta_date: b.eta_date ? b.eta_date.slice(0, 10) : '',
    status: b.status,
    notes: b.notes || '',
    is_active: b.is_active,
    sort_order: String(b.sort_order),
  };
}

export default function LclBatchManager() {
  const [batches, setBatches] = useState<LclBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BatchFormState>(EMPTY_FORM);
  const [savingModal, setSavingModal] = useState(false);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/lcl-batches', { cache: 'no-store' });
      const data = (await res.json()) as {
        batches?: LclBatch[];
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memuat jadwal kloter LCL.');
      } else {
        setBatches(data.batches ?? []);
      }
    } catch {
      setErrorMsg('Koneksi bermasalah saat memuat kloter LCL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      cutoff_date: futureDateStr(7),
      etd_date: futureDateStr(10),
      eta_date: futureDateStr(38),
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (batch: LclBatch) => {
    setEditingId(batch.id);
    setForm(batchToForm(batch));
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOriginChange = (origin: OriginCountry) => {
    const preset = ORIGIN_OPTIONS.find((o) => o.value === origin);
    setForm((prev) => ({
      ...prev,
      origin_country: origin,
      origin_warehouse: preset?.defaultWh || prev.origin_warehouse,
      shipping_method: preset?.defaultMethod || prev.shipping_method,
      container_size: editingId
        ? prev.container_size
        : preset?.defaultContainer || prev.container_size,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingModal(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const payload = {
        ...form,
        capacity_cbm: Number(form.capacity_cbm) || 28,
        filled_cbm: Number(form.filled_cbm) || 0,
        min_slot_cbm: Number(form.min_slot_cbm) || 0.1,
        sort_order: Number(form.sort_order) || 0,
      };

      const url = editingId
        ? `/api/admin/lcl-batches/${editingId}`
        : '/api/admin/lcl-batches';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal menyimpan kloter LCL.');
      } else {
        setModalOpen(false);
        setStatusMsg(
          editingId
            ? 'Jadwal kloter LCL berhasil diperbarui.'
            : 'Jadwal kloter LCL baru berhasil ditambahkan.'
        );
        await loadBatches();
      }
    } catch {
      setErrorMsg('Koneksi bermasalah saat menyimpan kloter LCL.');
    } finally {
      setSavingModal(false);
    }
  };

  const quickPatch = async (
    batch: LclBatch,
    updates: Partial<Pick<LclBatch, 'filled_cbm' | 'status' | 'is_active'>>
  ) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/lcl-batches/${batch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await loadBatches();
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error || 'Gagal memperbarui kloter.');
      }
    } catch {
      setErrorMsg('Gagal memperbarui kloter LCL.');
    }
  };

  const adjustCbm = async (batch: LclBatch, delta: number) => {
    const cap = Number(batch.capacity_cbm) || 28;
    const next = Math.max(
      0,
      Math.min(cap, Number((Number(batch.filled_cbm) + delta).toFixed(2)))
    );
    await quickPatch(batch, { filled_cbm: next });
  };

  const deleteBatch = async (batch: LclBatch) => {
    if (
      !window.confirm(`Hapus jadwal kloter "${batch.batch_code}" secara permanen?`)
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/lcl-batches/${batch.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMsg(`Kloter ${batch.batch_code} telah dihapus.`);
        await loadBatches();
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error || 'Gagal menghapus kloter.');
      }
    } catch {
      setErrorMsg('Gagal menghapus kloter.');
    }
  };

  const copyScheduleBroadcast = async (batch: LclBatch) => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://importir-pontianak.43-173-33-53.sslip.io';
    const cap = Number(batch.capacity_cbm) || 28;
    const filled = Number(batch.filled_cbm) || 0;
    const remaining = Math.max(0, Number((cap - filled).toFixed(2)));
    const pct = Math.min(100, Math.round((filled / cap) * 100));

    const lines = [
      `*JADWAL KONTAINER LCL BERSAMA -> PONTIANAK*`,
      ``,
      `*${batch.title}*`,
      `Kode Kloter: \`${batch.batch_code}\``,
      `Gudang Muat: ${batch.origin_warehouse} (${batch.container_size})`,
      `Terisi Saat Ini: *${formatNumberId(filled, 1)} / ${formatNumberId(cap, 0)} CBM (${pct}%)*`,
      `Sisa Kuota Slot: *${formatNumberId(remaining, 1)} CBM* (Min. ${formatNumberId(Number(batch.min_slot_cbm), 2)} CBM)`,
      `Tutup Barang (Cutoff): *${formatDateOnly(batch.cutoff_date)}*`,
      batch.etd_date ? `Berangkat (ETD): ${formatDateOnly(batch.etd_date)}` : '',
      batch.eta_date ? `Est. Tiba Pontianak: ${formatDateOnly(batch.eta_date)}` : '',
      ``,
      `Anggota yang mau belanja barang 1688/Taobao/supplier sendiri dan gabung kontainer ini, langsung booking slot atau cek katalog pilihan di:`,
      `Booking Slot: ${origin}/?batch=${encodeURIComponent(batch.batch_code)}#rfq`,
      `Katalog Produk: ${origin}/katalog`,
    ].filter((line, idx, arr) => line !== '' || arr[idx - 1] !== '');

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedId(batch.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      setErrorMsg('Browser tidak mengizinkan akses clipboard.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            Jadwal &amp; Kuota Kloter LCL
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Atur sisa kapasitas CBM kontainer LCL bersama menuju Pontianak dan
            bagikan jadwalnya ke grup WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBatches}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-navy font-bold px-3.5 text-xs"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-4 text-xs shadow-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Kloter LCL Baru
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 text-sm font-medium text-emerald-900">
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-300 px-4 py-3 text-sm font-medium text-rose-900"
        >
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white border border-slate-300 p-10 text-center text-sm text-slate-600 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-teal" aria-hidden="true" />
          Memuat jadwal kloter LCL...
        </div>
      ) : batches.length === 0 ? (
        <div className="rounded-xl bg-white border border-slate-300 p-10 text-center text-sm text-slate-600">
          Belum ada jadwal kloter LCL. Klik &quot;Buat Kloter LCL Baru&quot;.
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => {
            const cap = Math.max(0.1, Number(batch.capacity_cbm) || 28);
            const filled = Math.max(0, Number(batch.filled_cbm) || 0);
            const remaining = Math.max(0, Number((cap - filled).toFixed(2)));
            const pct = Math.min(100, Math.round((filled / cap) * 100));

            return (
              <div
                key={batch.id}
                className={`rounded-xl bg-white border p-5 space-y-4 ${
                  batch.is_active ? 'border-slate-300' : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-extrabold text-white bg-navy px-2.5 py-1 rounded">
                        <Container className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                        {batch.batch_code}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {batch.origin_warehouse} · {batch.container_size}
                      </span>
                      {!batch.is_active && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                          Disembunyikan
                        </span>
                      )}
                    </div>

                    <h2 className="font-extrabold text-navy text-base">
                      {batch.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>
                        <CalendarClock
                          className="h-3.5 w-3.5 inline mr-1 text-teal-dark"
                          aria-hidden="true"
                        />
                        Cutoff: <strong>{formatDateOnly(batch.cutoff_date)}</strong>
                      </span>
                      {batch.etd_date && (
                        <span>ETD: {formatDateOnly(batch.etd_date)}</span>
                      )}
                      {batch.eta_date && (
                        <span>ETA PNK: {formatDateOnly(batch.eta_date)}</span>
                      )}
                    </div>
                  </div>

                  {/* Quick CBM & Status Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustCbm(batch, -0.5)}
                      className="min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-navy"
                    >
                      -0.5 CBM
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustCbm(batch, 0.5)}
                      className="min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-navy"
                    >
                      +0.5 CBM
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustCbm(batch, 1)}
                      className="min-h-[36px] px-2.5 rounded-lg border border-teal bg-teal/10 hover:bg-teal/20 text-xs font-mono font-bold text-teal-dark"
                    >
                      +1 CBM
                    </button>

                    <select
                      value={batch.status}
                      aria-label={`Status ${batch.batch_code}`}
                      onChange={(e) =>
                        quickPatch(batch, {
                          status: e.target.value as LclBatchStatus,
                        })
                      }
                      className="min-h-[36px] rounded-lg border border-slate-300 px-2.5 text-xs font-bold text-navy bg-white"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                  <div className="flex flex-wrap justify-between gap-2 text-xs">
                    <span className="font-bold text-navy">
                      Terisi:{' '}
                      <span className="font-mono text-teal-dark">
                        {formatNumberId(filled, 2)} / {formatNumberId(cap, 2)} CBM (
                        {pct}%)
                      </span>
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      Sisa Slot: {formatNumberId(remaining, 2)} CBM
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Action row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => copyScheduleBroadcast(batch)}
                    className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg bg-wa hover:bg-wa-dark text-white font-bold px-3.5 text-xs shadow-sm"
                  >
                    {copiedId === batch.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Broadcast Jadwal Tersalin!
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                        Salin Broadcast Jadwal WA
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        quickPatch(batch, { is_active: !batch.is_active })
                      }
                      className={`min-h-[36px] px-3 rounded-lg text-xs font-bold border ${
                        batch.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {batch.is_active ? 'Tampil Publik' : 'Tersembunyi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(batch)}
                      className="min-h-[36px] inline-flex items-center gap-1 px-3 rounded-lg border border-slate-300 text-xs font-bold text-navy hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBatch(batch)}
                      className="min-h-[36px] inline-flex items-center justify-center px-2.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                      aria-label={`Hapus ${batch.batch_code}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 p-4 overflow-y-auto flex items-start justify-center"
        >
          <div className="bg-white rounded-2xl border border-slate-300 shadow-xl w-full max-w-2xl my-6 overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between gap-3">
              <h2 id="batch-modal-title" className="font-bold text-base">
                {editingId ? 'Edit Jadwal Kloter LCL' : 'Buat Kloter LCL Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg hover:bg-white/10"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Kode Kloter (kosongkan = otomatis)
                  </label>
                  <input
                    type="text"
                    value={form.batch_code}
                    onChange={(e) =>
                      setForm({ ...form, batch_code: e.target.value.toUpperCase() })
                    }
                    placeholder="cth: LCL-GZ-PNK-2612C"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Status Kloter
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as LclBatchStatus,
                      })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1">
                    Judul Jadwal Kontainer *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="cth: Kloter Konsolidasi LCL Guangzhou -> Pontianak #07"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Negara Asal
                  </label>
                  <select
                    value={form.origin_country}
                    onChange={(e) =>
                      handleOriginChange(e.target.value as OriginCountry)
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  >
                    {ORIGIN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Jalur Pengiriman
                  </label>
                  <select
                    value={form.shipping_method}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shipping_method: e.target.value as ShippingMethod,
                      })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  >
                    <option value="laut">Jalur Laut</option>
                    <option value="darat">Jalur Darat</option>
                    <option value="udara">Jalur Udara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Gudang Asal Muat
                  </label>
                  <input
                    type="text"
                    value={form.origin_warehouse}
                    onChange={(e) =>
                      setForm({ ...form, origin_warehouse: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Ukuran Kontainer / Armada
                  </label>
                  <input
                    type="text"
                    value={form.container_size}
                    onChange={(e) =>
                      setForm({ ...form, container_size: e.target.value })
                    }
                    placeholder="cth: 20ft (28 CBM) atau 40ft HC (65 CBM)"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Kapasitas (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={form.capacity_cbm}
                    onChange={(e) =>
                      setForm({ ...form, capacity_cbm: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Terisi (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.filled_cbm}
                    onChange={(e) =>
                      setForm({ ...form, filled_cbm: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Min. Slot (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={form.min_slot_cbm}
                    onChange={(e) =>
                      setForm({ ...form, min_slot_cbm: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Tanggal Cutoff Barang *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.cutoff_date}
                    onChange={(e) =>
                      setForm({ ...form, cutoff_date: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Est. Berangkat (ETD)
                  </label>
                  <input
                    type="date"
                    value={form.etd_date}
                    onChange={(e) =>
                      setForm({ ...form, etd_date: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Est. Tiba Pontianak (ETA)
                  </label>
                  <input
                    type="date"
                    value={form.eta_date}
                    onChange={(e) =>
                      setForm({ ...form, eta_date: e.target.value })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Catatan Kloter (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="cth: Cocok untuk aksesoris Yiwu, alat kopi, LED non-baterai..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-navy">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-teal"
                    />
                    Tampilkan di Website Publik
                  </label>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-navy">
                    <span>Urutan:</span>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm({ ...form, sort_order: e.target.value })
                      }
                      className="w-16 min-h-[34px] rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono text-navy"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="min-h-[42px] px-4 rounded-lg border border-slate-300 text-xs font-bold text-navy hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingModal}
                    className="min-h-[42px] inline-flex items-center gap-2 px-5 rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-60 text-white text-xs font-bold"
                  >
                    {savingModal && (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {editingId ? 'Simpan Perubahan' : 'Buat Kloter'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
