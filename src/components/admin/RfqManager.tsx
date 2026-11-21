'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightCircle,
  ExternalLink,
  Eye,
  Loader2,
  MessageCircle,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  CATEGORY_LABELS,
  formatDateWib,
  formatIdr,
  METHOD_LABELS,
  ORIGIN_LABELS,
  RFQ_STATUSES,
  SERVICE_LABELS,
} from '@/lib/format';
import type { RfqOrder, RfqStatus } from '@/lib/types';

export default function RfqManager() {
  const [orders, setOrders] = useState<RfqOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<RfqOrder | null>(null);

  const [editStatus, setEditStatus] = useState<RfqStatus>('baru');
  const [editQuote, setEditQuote] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
    trackingNo?: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (serviceFilter !== 'all') params.set('service_type', serviceFilter);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/admin/rfq?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoadError('Gagal memuat daftar RFQ dari server.');
        setOrders([]);
        return;
      }
      const data = (await res.json()) as { orders?: RfqOrder[] };
      setOrders(data.orders || []);
    } catch {
      setLoadError('Koneksi bermasalah saat memuat RFQ.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOrder(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedOrder]);

  const openModal = (order: RfqOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditQuote(
      order.quoted_total_idr ? String(order.quoted_total_idr) : ''
    );
    setEditNotes(order.admin_notes || '');
    setFeedback(null);
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/rfq/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          quoted_total_idr: editQuote ? Number(editQuote) : null,
          admin_notes: editNotes,
        }),
      });
      const data = (await res.json()) as { order?: RfqOrder; error?: string };
      if (!res.ok || !data.order) {
        setFeedback({ type: 'err', msg: data.error || 'Gagal menyimpan.' });
      } else {
        setSelectedOrder(data.order);
        setFeedback({ type: 'ok', msg: 'Perubahan RFQ disimpan.' });
        loadOrders();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedOrder) return;
    setConverting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/rfq/${selectedOrder.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as {
        shipment?: { tracking_number: string };
        error?: string;
      };
      if (!res.ok || !data.shipment) {
        setFeedback({
          type: 'err',
          msg: data.error || 'Gagal mengonversi ke pengiriman.',
        });
      } else {
        setFeedback({
          type: 'ok',
          msg: `Berhasil dikonversi ke resi ${data.shipment.tracking_number}.`,
          trackingNo: data.shipment.tracking_number,
        });
        loadOrders();
      }
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengajuan RFQ ini?')) return;
    const res = await fetch(`/api/admin/rfq/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedOrder?.id === id) setSelectedOrder(null);
      loadOrders();
    }
  };

  const buildCustomerWaUrl = (order: RfqOrder) => {
    const quoteDisplay = editQuote
      ? formatIdr(Number(editQuote))
      : order.quoted_total_idr
        ? formatIdr(order.quoted_total_idr)
        : order.estimated_total_idr
          ? `${formatIdr(order.estimated_total_idr)} (estimasi awal)`
          : 'sedang kami finalisasi';
    const text = [
      `Halo Kak ${order.customer_name}, kami dari tim Importir Pontianak menindaklanjuti RFQ *${order.rfq_code}* (${order.product_name}).`,
      ``,
      `Penawaran total all-in hingga *${order.destination_city}*: *${quoteDisplay}*.`,
      editNotes ? `Catatan tim: ${editNotes}` : '',
      ``,
      `Silakan konfirmasi apabila bersedia lanjut proses order & penerbitan marking code. Terima kasih!`,
    ]
      .filter(Boolean)
      .join('\n');
    return buildWhatsAppUrl(order.customer_whatsapp, text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">
          Manajemen RFQ & Order Masuk
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Tinjau pengajuan titip beli / forwarder, isi penawaran harga IDR, dan
          konversi menjadi resi pengiriman.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <label htmlFor="rfq-search" className="sr-only">
            Cari RFQ
          </label>
          <Search
            className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
            aria-hidden="true"
          />
          <input
            id="rfq-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode RFQ, nama customer, atau produk..."
            className="w-full min-h-[44px] rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:border-teal"
          />
        </div>

        <div>
          <label htmlFor="rfq-status-filter" className="sr-only">
            Filter status RFQ
          </label>
          <select
            id="rfq-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal"
          >
            <option value="all">Semua Status</option>
            <option value="baru">Baru Masuk</option>
            <option value="diproses">Sedang Dicek</option>
            <option value="penawaran_dikirim">Penawaran Dikirim</option>
            <option value="disetujui">Disetujui</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <div>
          <label htmlFor="rfq-service-filter" className="sr-only">
            Filter jenis layanan
          </label>
          <select
            id="rfq-service-filter"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal"
          >
            <option value="all">Semua Layanan</option>
            <option value="titip_beli">Titip Beli</option>
            <option value="forwarder">Forwarder</option>
            <option value="transfer_valas">Transfer Valas</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 overflow-x-auto">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-teal-dark" aria-hidden="true" />
            Memuat daftar RFQ...
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3" role="alert">
            <p className="text-sm font-semibold text-rose-800">{loadError}</p>
            <button
              type="button"
              onClick={loadOrders}
              className="min-h-[44px] px-4 rounded-lg bg-navy text-white text-xs font-bold"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            Tidak ada data RFQ yang cocok dengan filter.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-paper border-b border-slate-300 text-xs font-bold text-navy">
                <th className="px-4 py-3">Kode & Tanggal</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Produk & Layanan</th>
                <th className="px-4 py-3">Rute & Tujuan</th>
                <th className="px-4 py-3">Estimasi / Penawaran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => {
                const st = RFQ_STATUSES[order.status] || RFQ_STATUSES.baru;
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-teal-dark text-xs">
                        {order.rfq_code}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {formatDateWib(order.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-navy">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        +{order.customer_whatsapp}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {order.product_name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {SERVICE_LABELS[order.service_type]}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-navy">
                        {ORIGIN_LABELS[order.origin_country]}
                      </div>
                      <div className="text-xs text-slate-600">
                        {METHOD_LABELS[order.shipping_method]} →{' '}
                        {order.destination_city}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                      {order.quoted_total_idr ? (
                        <div>
                          <span className="font-bold text-emerald-800">
                            {formatIdr(order.quoted_total_idr)}
                          </span>
                          <div className="text-xs text-slate-600 font-sans">
                            Penawaran Final
                          </div>
                        </div>
                      ) : order.estimated_total_idr ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {formatIdr(order.estimated_total_idr)}
                          </span>
                          <div className="text-xs text-slate-600 font-sans">
                            Estimasi Web
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold border ${st.badgeClass}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openModal(order)}
                        className="min-h-[38px] inline-flex items-center gap-1 rounded-md bg-navy hover:bg-navy-light text-white text-xs font-bold px-3 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-md text-rose-700 hover:bg-rose-50 transition-colors"
                        aria-label={`Hapus RFQ ${order.rfq_code}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rfq-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300">
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-teal-300 font-bold">
                  {selectedOrder.rfq_code}
                </span>
                <h2 id="rfq-modal-title" className="font-bold text-base">
                  {selectedOrder.product_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Tutup detail RFQ"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-paper rounded-lg p-4 border border-slate-300">
                <div>
                  <div className="text-xs text-slate-600">Customer</div>
                  <div className="font-bold text-navy">
                    {selectedOrder.customer_name}
                    {selectedOrder.company_name
                      ? ` (${selectedOrder.company_name})`
                      : ''}
                  </div>
                  <div className="text-xs font-mono text-slate-700">
                    +{selectedOrder.customer_whatsapp}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Layanan & Rute</div>
                  <div className="font-bold text-navy">
                    {SERVICE_LABELS[selectedOrder.service_type]}
                  </div>
                  <div className="text-xs text-slate-700">
                    {ORIGIN_LABELS[selectedOrder.origin_country]} ·{' '}
                    {METHOD_LABELS[selectedOrder.shipping_method]} ·{' '}
                    {CATEGORY_LABELS[selectedOrder.cargo_category]}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Tujuan Kalbar</div>
                  <div className="font-semibold text-navy">
                    {selectedOrder.destination_city}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Kuantitas & Estimasi</div>
                  <div className="font-mono text-xs text-slate-800">
                    Qty: {selectedOrder.quantity ?? 1} · Nilai:{' '}
                    {selectedOrder.estimated_goods_value
                      ? `${selectedOrder.estimated_goods_value} ${selectedOrder.currency}`
                      : '-'}{' '}
                    · Berat: {selectedOrder.estimated_weight_kg ?? '-'} kg · Vol:{' '}
                    {selectedOrder.estimated_cbm ?? '-'} CBM
                  </div>
                </div>
              </div>

              {selectedOrder.product_url && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1">
                    Tautan Produk Supplier
                  </div>
                  <a
                    href={selectedOrder.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-dark hover:underline break-all"
                  >
                    {selectedOrder.product_url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              )}

              {selectedOrder.product_photo_url && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1.5">
                    Foto Produk / Lampiran
                  </div>
                  <img
                    src={selectedOrder.product_photo_url}
                    alt={`Foto lampiran untuk ${selectedOrder.product_name}`}
                    width={400}
                    height={240}
                    className="max-h-52 w-auto rounded-lg border border-slate-300 object-contain"
                  />
                </div>
              )}

              {selectedOrder.customer_notes && (
                <div className="rounded-lg bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-950">
                  <strong className="block mb-0.5">Catatan Customer:</strong>
                  {selectedOrder.customer_notes}
                </div>
              )}

              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="rfq-edit-status"
                      className="block text-xs font-bold text-navy mb-1"
                    >
                      Status RFQ
                    </label>
                    <select
                      id="rfq-edit-status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as RfqStatus)}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal"
                    >
                      <option value="baru">Baru Masuk</option>
                      <option value="diproses">Sedang Dicek Tim</option>
                      <option value="penawaran_dikirim">Penawaran Dikirim</option>
                      <option value="disetujui">Disetujui / Lanjut Order</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="rfq-edit-quote"
                      className="block text-xs font-bold text-navy mb-1"
                    >
                      Penawaran Resmi All-In (IDR)
                    </label>
                    <input
                      id="rfq-edit-quote"
                      type="number"
                      value={editQuote}
                      onChange={(e) => setEditQuote(e.target.value)}
                      placeholder="cth: 10150000"
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rfq-edit-notes"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Catatan Admin / Rincian Penawaran
                  </label>
                  <textarea
                    id="rfq-edit-notes"
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Catat konfirmasi supplier, estimasi waktu, atau DP..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal"
                  />
                </div>
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`rounded-lg px-4 py-3 text-xs font-semibold flex items-center justify-between gap-2 ${
                    feedback.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  <span>{feedback.msg}</span>
                  {feedback.trackingNo && (
                    <Link
                      href="/admin/shipments"
                      className="underline font-bold shrink-0"
                    >
                      Buka Pengiriman
                    </Link>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={buildCustomerWaUrl(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 text-xs transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Hubungi WA Customer
                  </a>

                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={converting}
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-amber hover:bg-amber-dark disabled:opacity-60 text-white font-bold px-4 text-xs transition-colors"
                  >
                    {converting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <ArrowRightCircle className="h-4 w-4" aria-hidden="true" />
                    )}
                    Konversi ke Pengiriman (Buat Resi)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-bold px-5 text-xs transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
