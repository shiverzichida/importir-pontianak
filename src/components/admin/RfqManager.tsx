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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<RfqOrder | null>(null);

  // Modal edit fields
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
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (serviceFilter !== 'all') params.set('service_type', serviceFilter);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/admin/rfq?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as { orders?: RfqOrder[] };
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            Manajemen RFQ & Order Masuk
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tinjau pengajuan titip beli / forwarder, isi penawaran harga IDR,
            dan konversi menjadi resi pengiriman.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode RFQ, nama customer, atau produk..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-600 focus:outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="baru">Baru Masuk</option>
          <option value="diproses">Sedang Dicek</option>
          <option value="penawaran_dikirim">Penawaran Dikirim</option>
          <option value="disetujui">Disetujui</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-600 focus:outline-none"
        >
          <option value="all">Semua Layanan</option>
          <option value="titip_beli">Titip Beli</option>
          <option value="forwarder">Forwarder</option>
          <option value="transfer_valas">Transfer Valas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            Memuat daftar RFQ...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Tidak ada data RFQ yang cocok dengan filter.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Kode & Tanggal</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Produk & Layanan</th>
                <th className="px-4 py-3">Rute & Tujuan</th>
                <th className="px-4 py-3">Estimasi / Penawaran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const st = RFQ_STATUSES[order.status] || RFQ_STATUSES.baru;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-teal-700 text-xs">
                        {order.rfq_code}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateWib(order.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-navy">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        +{order.customer_whatsapp}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        {order.product_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {SERVICE_LABELS[order.service_type]}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-navy">
                        {ORIGIN_LABELS[order.origin_country]}
                      </div>
                      <div className="text-xs text-slate-500">
                        {METHOD_LABELS[order.shipping_method]} →{' '}
                        {order.destination_city}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                      {order.quoted_total_idr ? (
                        <div>
                          <span className="font-bold text-emerald-700">
                            {formatIdr(order.quoted_total_idr)}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Penawaran Final
                          </div>
                        </div>
                      ) : order.estimated_total_idr ? (
                        <div>
                          <span className="font-semibold text-slate-700">
                            {formatIdr(order.estimated_total_idr)}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Estimasi Web
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.badgeClass}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openModal(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold px-3 py-1.5 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        className="inline-flex items-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus RFQ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail & Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-teal-300 font-bold">
                  {selectedOrder.rfq_code}
                </span>
                <h2 className="font-bold text-base">
                  {selectedOrder.product_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500">Customer</div>
                  <div className="font-bold text-navy">
                    {selectedOrder.customer_name}
                    {selectedOrder.company_name
                      ? ` (${selectedOrder.company_name})`
                      : ''}
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    +{selectedOrder.customer_whatsapp}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Layanan & Rute</div>
                  <div className="font-bold text-navy">
                    {SERVICE_LABELS[selectedOrder.service_type]}
                  </div>
                  <div className="text-xs text-slate-600">
                    {ORIGIN_LABELS[selectedOrder.origin_country]} •{' '}
                    {METHOD_LABELS[selectedOrder.shipping_method]} •{' '}
                    {CATEGORY_LABELS[selectedOrder.cargo_category]}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Tujuan Kalbar</div>
                  <div className="font-semibold text-navy">
                    {selectedOrder.destination_city}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Kuantitas & Estimasi</div>
                  <div className="font-mono text-xs text-slate-700">
                    Qty: {selectedOrder.quantity ?? 1} • Nilai:{' '}
                    {selectedOrder.estimated_goods_value
                      ? `${selectedOrder.estimated_goods_value} ${selectedOrder.currency}`
                      : '-'}{' '}
                    • Berat: {selectedOrder.estimated_weight_kg ?? '-'} kg • Vol:{' '}
                    {selectedOrder.estimated_cbm ?? '-'} CBM
                  </div>
                </div>
              </div>

              {selectedOrder.product_url && (
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1">
                    Tautan Produk Supplier
                  </div>
                  <a
                    href={selectedOrder.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline break-all"
                  >
                    {selectedOrder.product_url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              )}

              {selectedOrder.product_photo_url && (
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1.5">
                    Foto Produk / Lampiran
                  </div>
                  <img
                    src={selectedOrder.product_photo_url}
                    alt="Lampiran Produk"
                    className="max-h-52 rounded-xl border border-slate-200 object-contain"
                  />
                </div>
              )}

              {selectedOrder.customer_notes && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                  <strong className="block mb-0.5">Catatan Customer:</strong>
                  {selectedOrder.customer_notes}
                </div>
              )}

              {/* Admin Controls */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      Status RFQ
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as RfqStatus)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal-600 focus:outline-none"
                    >
                      <option value="baru">Baru Masuk</option>
                      <option value="diproses">Sedang Dicek Tim</option>
                      <option value="penawaran_dikirim">Penawaran Dikirim</option>
                      <option value="disetujui">Disetujui / Lanjut Order</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      Penawaran Resmi All-In (IDR)
                    </label>
                    <input
                      type="number"
                      value={editQuote}
                      onChange={(e) => setEditQuote(e.target.value)}
                      placeholder="cth: 10150000"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Catatan Admin / Rincian Penawaran
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Catat konfirmasi supplier, estimasi waktu, atau DP..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              {feedback && (
                <div
                  className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center justify-between gap-2 ${
                    feedback.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <span>{feedback.msg}</span>
                  {feedback.trackingNo && (
                    <Link
                      href="/admin/shipments"
                      className="underline font-bold shrink-0"
                    >
                      Buka Pengiriman →
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Hubungi WA Customer
                  </a>

                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={converting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber hover:bg-amber-dark disabled:opacity-60 text-white font-bold px-4 py-2.5 text-xs transition"
                  >
                    {converting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRightCircle className="h-4 w-4" />
                    )}
                    Konversi ke Pengiriman (Buat Resi)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-bold px-5 py-2.5 text-xs transition"
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
