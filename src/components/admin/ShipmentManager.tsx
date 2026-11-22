'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Edit3,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  formatDateWib,
  formatIdr,
  METHOD_LABELS,
  ORIGIN_LABELS,
  PAYMENT_STATUS_META,
  SHIPMENT_STATUS_META,
} from '@/lib/format';
import type {
  CargoCategory,
  CustomerProfile,
  OriginCountry,
  PaymentStatus,
  Shipment,
  ShipmentStatus,
  ShippingMethod,
  TrackingEvent,
} from '@/lib/types';

function formatMemberMarking(
  origin: OriginCountry,
  markingBase: string
): string {
  const prefix = origin === 'china' ? 'CN' : origin === 'malaysia' ? 'MY' : 'SG';
  return `PNK-${prefix}-${markingBase.toUpperCase()}`;
}

interface ShipmentWithEvents extends Shipment {
  events: TrackingEvent[];
}

export default function ShipmentManager() {
  const [shipments, setShipments] = useState<ShipmentWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    customer_id: '',
    marking_code: '',
    customer_name: '',
    customer_whatsapp: '',
    origin_country: 'china' as OriginCountry,
    shipping_method: 'laut' as ShippingMethod,
    cargo_category: 'general' as CargoCategory,
    destination_city: 'Pontianak (Ambil di Gudang)',
    item_summary: '',
    supplier_tracking_no: '',
    actual_weight_kg: '',
    actual_cbm: '',
    colli_count: '1',
    invoice_amount_idr: '',
  });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [editingShipment, setEditingShipment] =
    useState<ShipmentWithEvents | null>(null);
  const [editForm, setEditForm] = useState({
    supplier_tracking_no: '',
    actual_weight_kg: '',
    actual_cbm: '',
    colli_count: '1',
    invoice_amount_idr: '',
    payment_status: 'belum_bayar' as PaymentStatus,
    estimated_arrival: '',
    destination_city: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [trackingTarget, setTrackingTarget] =
    useState<ShipmentWithEvents | null>(null);
  const [eventStatus, setEventStatus] =
    useState<ShipmentStatus>('received_origin_warehouse');
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventErr, setEventErr] = useState<string | null>(null);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/admin/shipments?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoadError('Gagal memuat daftar pengiriman dari server.');
        setShipments([]);
        return;
      }
      const data = (await res.json()) as {
        shipments?: ShipmentWithEvents[];
      };
      const list = data.shipments || [];
      setShipments(list);
      if (trackingTarget) {
        const refreshed = list.find((s) => s.id === trackingTarget.id);
        if (refreshed) setTrackingTarget(refreshed);
      }
    } catch {
      setLoadError('Koneksi bermasalah saat memuat pengiriman.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, trackingTarget]);

  useEffect(() => {
    loadShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  useEffect(() => {
    fetch('/api/admin/customers?status=active', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { customers?: CustomerProfile[] } | null) => {
        if (data?.customers) {
          setCustomers(data.customers);
        }
      })
      .catch(() => {
        // Ignore optional customer list fetch failure
      });
  }, []);

  useEffect(() => {
    if (!showCreate && !editingShipment && !trackingTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreate(false);
        setEditingShipment(null);
        setTrackingTarget(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCreate, editingShipment, trackingTarget]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErr(null);
    setCreating(true);
    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setCreateErr(data.error || 'Gagal membuat pengiriman.');
      } else {
        setShowCreate(false);
        setCreateForm({
          customer_id: '',
          marking_code: '',
          customer_name: '',
          customer_whatsapp: '',
          origin_country: 'china',
          shipping_method: 'laut',
          cargo_category: 'general',
          destination_city: 'Pontianak (Ambil di Gudang)',
          item_summary: '',
          supplier_tracking_no: '',
          actual_weight_kg: '',
          actual_cbm: '',
          colli_count: '1',
          invoice_amount_idr: '',
        });
        loadShipments();
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (s: ShipmentWithEvents) => {
    setEditingShipment(s);
    setEditForm({
      supplier_tracking_no: s.supplier_tracking_no || '',
      actual_weight_kg:
        s.actual_weight_kg !== null ? String(s.actual_weight_kg) : '',
      actual_cbm: s.actual_cbm !== null ? String(s.actual_cbm) : '',
      colli_count: String(s.colli_count || 1),
      invoice_amount_idr:
        s.invoice_amount_idr !== null ? String(s.invoice_amount_idr) : '',
      payment_status: s.payment_status,
      estimated_arrival: s.estimated_arrival
        ? s.estimated_arrival.slice(0, 10)
        : '',
      destination_city: s.destination_city,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/shipments/${editingShipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingShipment(null);
        loadShipments();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const openTrackingModal = (s: ShipmentWithEvents) => {
    setTrackingTarget(s);
    setEventStatus(s.current_status);
    setEventTitle(SHIPMENT_STATUS_META[s.current_status].label);
    setEventLocation('Gudang Pontianak, Kalbar');
    setEventDesc('');
    setEventErr(null);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingTarget) return;
    setEventErr(null);
    setAddingEvent(true);
    try {
      const res = await fetch(
        `/api/admin/shipments/${trackingTarget.id}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: eventStatus,
            title: eventTitle,
            location: eventLocation,
            description: eventDesc,
          }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setEventErr(data.error || 'Gagal menambah event.');
      } else {
        setEventDesc('');
        await loadShipments();
      }
    } finally {
      setAddingEvent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data pengiriman ini beserta riwayat tracking-nya?'))
      return;
    const res = await fetch(`/api/admin/shipments/${id}`, { method: 'DELETE' });
    if (res.ok) loadShipments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            Pengiriman & Live Tracking
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Kelola berat/CBM aktual, tagihan invoice, serta update tahapan
            tracking real-time untuk halaman publik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-4 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Pengiriman Baru
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <label htmlFor="shipment-search" className="sr-only">
            Cari pengiriman
          </label>
          <Search
            className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
            aria-hidden="true"
          />
          <input
            id="shipment-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari resi IMP-PNK, marking code, resi supplier, customer..."
            className="w-full min-h-[44px] rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:border-teal"
          />
        </div>

        <div>
          <label htmlFor="shipment-status-filter" className="sr-only">
            Filter tahap pengiriman
          </label>
          <select
            id="shipment-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-teal"
          >
            <option value="all">Semua Tahap Pengiriman</option>
            {(Object.keys(SHIPMENT_STATUS_META) as ShipmentStatus[]).map((st) => (
              <option key={st} value={st}>
                {SHIPMENT_STATUS_META[st].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 overflow-x-auto">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-teal-dark" aria-hidden="true" />
            Memuat data pengiriman...
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3" role="alert">
            <p className="text-sm font-semibold text-rose-800">{loadError}</p>
            <button
              type="button"
              onClick={loadShipments}
              className="min-h-[44px] px-4 rounded-lg bg-navy text-white text-xs font-bold"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            Belum ada pengiriman yang sesuai.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-paper border-b border-slate-300 text-xs font-bold text-navy">
                <th className="px-4 py-3">Resi & Marking</th>
                <th className="px-4 py-3">Customer & Barang</th>
                <th className="px-4 py-3">Rute & Ukuran</th>
                <th className="px-4 py-3">Tagihan</th>
                <th className="px-4 py-3">Status Terkini</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {shipments.map((s) => {
                const statusMeta =
                  SHIPMENT_STATUS_META[s.current_status] ||
                  SHIPMENT_STATUS_META.order_confirmed;
                const payMeta =
                  PAYMENT_STATUS_META[s.payment_status] ||
                  PAYMENT_STATUS_META.belum_bayar;
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-navy text-xs">
                        {s.tracking_number}
                      </div>
                      <div className="font-mono text-xs text-teal-dark font-semibold">
                        {s.marking_code}
                      </div>
                      {s.supplier_tracking_no && (
                        <div className="text-xs text-slate-600">
                          Supp: {s.supplier_tracking_no}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-bold text-navy truncate">
                        {s.customer_name}
                      </div>
                      <div className="text-xs text-slate-700 truncate">
                        {s.item_summary}
                      </div>
                      <div className="text-xs text-slate-600">
                        Tujuan: {s.destination_city}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div className="font-semibold text-navy">
                        {ORIGIN_LABELS[s.origin_country]}
                      </div>
                      <div className="text-slate-600">
                        {METHOD_LABELS[s.shipping_method]}
                      </div>
                      <div className="font-mono text-slate-700 mt-0.5">
                        {s.colli_count} koli
                        {s.actual_weight_kg ? ` · ${s.actual_weight_kg} kg` : ''}
                        {s.actual_cbm ? ` · ${s.actual_cbm} CBM` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-xs text-navy">
                        {s.invoice_amount_idr
                          ? formatIdr(s.invoice_amount_idr)
                          : '-'}
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold border ${payMeta.badgeClass}`}
                      >
                        {payMeta.label}
                      </span>
                      {s.payment_proof_url && (
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                            Ada Bukti Bayar
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      <div className="text-xs text-slate-600 mt-1">
                        {s.events.length} log event
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openTrackingModal(s)}
                        className="min-h-[38px] inline-flex items-center gap-1 rounded-md bg-teal hover:bg-teal-dark text-white text-xs font-bold px-3 transition-colors"
                      >
                        <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                        Update Tracking
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="min-h-[38px] inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold px-2.5 transition-colors"
                        aria-label={`Edit pengiriman ${s.tracking_number}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-md text-rose-700 hover:bg-rose-50 transition-colors"
                        aria-label={`Hapus pengiriman ${s.tracking_number}`}
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

      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-shipment-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreate(false);
          }}
        >
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <h2 id="create-shipment-title" className="font-bold text-base">
                Tambah Pengiriman Baru
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Tutup modal tambah pengiriman"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-sm">
              {customers.length > 0 && (
                <div>
                  <label
                    htmlFor="create-select-member"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Pilih Member Terdaftar (Opsional)
                  </label>
                  <select
                    id="create-select-member"
                    value={createForm.customer_id}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const member = customers.find((c) => c.id === cid);
                      if (!member) {
                        setCreateForm((prev) => ({
                          ...prev,
                          customer_id: '',
                          marking_code: '',
                        }));
                        return;
                      }
                      setCreateForm((prev) => ({
                        ...prev,
                        customer_id: member.id,
                        customer_name: member.company_name
                          ? `${member.company_name} (${member.full_name})`
                          : member.full_name,
                        customer_whatsapp: member.whatsapp,
                        destination_city: member.default_destination_city,
                        marking_code: formatMemberMarking(
                          prev.origin_country,
                          member.marking_code_base
                        ),
                      }));
                    }}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">
                      -- Input Manual / Tanpa Tautan Member --
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.member_code} · {c.full_name}
                        {c.company_name ? ` (${c.company_name})` : ''} ·{' '}
                        {c.marking_code_base}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="create-customer-name"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Nama Customer *
                  </label>
                  <input
                    id="create-customer-name"
                    type="text"
                    required
                    value={createForm.customer_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        customer_name: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-customer-wa"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    WhatsApp Customer *
                  </label>
                  <input
                    id="create-customer-wa"
                    type="text"
                    required
                    value={createForm.customer_whatsapp}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        customer_whatsapp: e.target.value,
                      })
                    }
                    placeholder="0812..."
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="create-item-summary"
                  className="block text-xs font-bold text-navy mb-1"
                >
                  Ringkasan Barang *
                </label>
                <input
                  id="create-item-summary"
                  type="text"
                  required
                  value={createForm.item_summary}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, item_summary: e.target.value })
                  }
                  placeholder="cth: Sparepart Mesin & Kemasan (5 Koli)"
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="create-origin"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Asal
                  </label>
                  <select
                    id="create-origin"
                    value={createForm.origin_country}
                    onChange={(e) => {
                      const nextOrigin = e.target.value as OriginCountry;
                      const member = customers.find(
                        (c) => c.id === createForm.customer_id
                      );
                      setCreateForm({
                        ...createForm,
                        origin_country: nextOrigin,
                        marking_code: member
                          ? formatMemberMarking(
                              nextOrigin,
                              member.marking_code_base
                            )
                          : createForm.marking_code,
                      });
                    }}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="china">China</option>
                    <option value="malaysia">Malaysia</option>
                    <option value="singapura">Singapura</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="create-method"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Jalur
                  </label>
                  <select
                    id="create-method"
                    value={createForm.shipping_method}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        shipping_method: e.target.value as ShippingMethod,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="udara">Udara</option>
                    <option value="laut">Laut LCL</option>
                    <option value="darat">Darat</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="create-category"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Kategori
                  </label>
                  <select
                    id="create-category"
                    value={createForm.cargo_category}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        cargo_category: e.target.value as CargoCategory,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="general">General</option>
                    <option value="fashion">Fashion</option>
                    <option value="elektronik">Elektronik</option>
                    <option value="khusus">Khusus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label
                    htmlFor="create-weight"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Berat (Kg)
                  </label>
                  <input
                    id="create-weight"
                    type="number"
                    step="0.1"
                    value={createForm.actual_weight_kg}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        actual_weight_kg: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-cbm"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Vol (CBM)
                  </label>
                  <input
                    id="create-cbm"
                    type="number"
                    step="0.001"
                    value={createForm.actual_cbm}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, actual_cbm: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-colli"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Koli
                  </label>
                  <input
                    id="create-colli"
                    type="number"
                    min="1"
                    value={createForm.colli_count}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        colli_count: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-invoice"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Tagihan (IDR)
                  </label>
                  <input
                    id="create-invoice"
                    type="number"
                    value={createForm.invoice_amount_idr}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        invoice_amount_idr: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="create-destination"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Tujuan Kalbar
                  </label>
                  <input
                    id="create-destination"
                    type="text"
                    value={createForm.destination_city}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        destination_city: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-supplier-resi"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Resi Supplier (Opsional)
                  </label>
                  <input
                    id="create-supplier-resi"
                    type="text"
                    value={createForm.supplier_tracking_no}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        supplier_tracking_no: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              {createErr && (
                <div
                  role="alert"
                  className="rounded-lg bg-rose-50 border border-rose-300 px-3.5 py-2.5 text-xs font-semibold text-rose-800"
                >
                  {createErr}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-xs font-bold text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="min-h-[44px] rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-5 text-xs"
                >
                  {creating ? 'Menyimpan...' : 'Buat Resi Pengiriman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingShipment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-shipment-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingShipment(null);
          }}
        >
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-teal-300">
                  {editingShipment.tracking_number}
                </div>
                <h2 id="edit-shipment-title" className="font-bold text-base">
                  Edit Ukuran & Tagihan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingShipment(null)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Tutup modal edit pengiriman"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="edit-weight"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Berat (Kg)
                  </label>
                  <input
                    id="edit-weight"
                    type="number"
                    step="0.01"
                    value={editForm.actual_weight_kg}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        actual_weight_kg: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-cbm"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Volume (CBM)
                  </label>
                  <input
                    id="edit-cbm"
                    type="number"
                    step="0.001"
                    value={editForm.actual_cbm}
                    onChange={(e) =>
                      setEditForm({ ...editForm, actual_cbm: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-colli"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Jumlah Koli
                  </label>
                  <input
                    id="edit-colli"
                    type="number"
                    min="1"
                    value={editForm.colli_count}
                    onChange={(e) =>
                      setEditForm({ ...editForm, colli_count: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-invoice"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Nominal Invoice (IDR)
                  </label>
                  <input
                    id="edit-invoice"
                    type="number"
                    value={editForm.invoice_amount_idr}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        invoice_amount_idr: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-payment-status"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Status Pembayaran
                  </label>
                  <select
                    id="edit-payment-status"
                    value={editForm.payment_status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        payment_status: e.target.value as PaymentStatus,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="belum_bayar">Belum Bayar</option>
                    <option value="dp">DP / Sebagian</option>
                    <option value="lunas">Lunas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-eta"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Estimasi Tiba (ETA)
                  </label>
                  <input
                    id="edit-eta"
                    type="date"
                    value={editForm.estimated_arrival}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        estimated_arrival: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-supplier-resi"
                    className="block text-xs font-bold text-navy mb-1"
                  >
                    Resi Supplier
                  </label>
                  <input
                    id="edit-supplier-resi"
                    type="text"
                    value={editForm.supplier_tracking_no}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        supplier_tracking_no: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              {editingShipment.payment_proof_url && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 space-y-2">
                  <div className="text-xs font-bold text-emerald-900">
                    Bukti Pembayaran dari Member
                  </div>
                  <div className="flex items-start gap-3">
                    <a
                      href={editingShipment.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={editingShipment.payment_proof_url}
                        alt={`Bukti bayar ${editingShipment.tracking_number}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg object-cover border border-emerald-300"
                      />
                    </a>
                    <div className="min-w-0 text-xs space-y-1">
                      <a
                        href={editingShipment.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-teal-dark hover:underline"
                      >
                        Buka Gambar Penuh
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      {editingShipment.payment_proof_note && (
                        <p className="text-emerald-950">
                          {editingShipment.payment_proof_note}
                        </p>
                      )}
                      {editingShipment.payment_proof_uploaded_at && (
                        <div className="text-[11px] text-emerald-700">
                          Diunggah:{' '}
                          {formatDateWib(
                            editingShipment.payment_proof_uploaded_at
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-xs font-bold text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="min-h-[44px] rounded-lg bg-navy hover:bg-navy-light text-white font-bold px-5 text-xs"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {trackingTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tracking-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTrackingTarget(null);
          }}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300">
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-teal-300 font-bold">
                  {trackingTarget.tracking_number} ·{' '}
                  {trackingTarget.marking_code}
                </div>
                <h2 id="tracking-modal-title" className="font-bold text-base">
                  Update Status & Riwayat Tracking
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tracking?q=${encodeURIComponent(trackingTarget.tracking_number)}`}
                  target="_blank"
                  className="min-h-[38px] inline-flex items-center gap-1 rounded-md bg-navy-light hover:bg-white/15 border border-white/15 px-3 text-xs font-semibold text-teal-200"
                >
                  Lihat Halaman Publik
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => setTrackingTarget(null)}
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md hover:bg-white/10"
                  aria-label="Tutup modal update tracking"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <form
                onSubmit={handleAddEvent}
                className="rounded-lg bg-paper border border-slate-300 p-4 space-y-3"
              >
                <div className="text-xs font-bold text-navy">
                  Tambah Update Tracking Baru
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="event-status"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Tahap Status *
                    </label>
                    <select
                      id="event-status"
                      value={eventStatus}
                      onChange={(e) => {
                        const st = e.target.value as ShipmentStatus;
                        setEventStatus(st);
                        setEventTitle(SHIPMENT_STATUS_META[st].label);
                      }}
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      {(
                        Object.keys(SHIPMENT_STATUS_META) as ShipmentStatus[]
                      ).map((st) => (
                        <option key={st} value={st}>
                          {SHIPMENT_STATUS_META[st].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="event-location"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Lokasi Kejadian *
                    </label>
                    <input
                      id="event-location"
                      type="text"
                      required
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="cth: Pelabuhan Nansha / Gudang Pontianak"
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="event-title"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Judul Status (Tampil di Tracking Publik) *
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-desc"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Keterangan Detail
                  </label>
                  <textarea
                    id="event-desc"
                    rows={2}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="cth: Paket selesai clearance dan siap diambil di gudang Ahmad Yani II."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                {eventErr && (
                  <div role="alert" className="text-xs font-semibold text-rose-800">
                    {eventErr}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={addingEvent}
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-60 text-white font-bold px-5 text-xs transition-colors"
                  >
                    {addingEvent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Simpan & Update Status Resi
                  </button>
                </div>
              </form>

              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Riwayat Log ({trackingTarget.events.length})
                </h3>
                <div className="space-y-3">
                  {trackingTarget.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-lg border border-slate-300 p-3.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-navy">{ev.title}</span>
                        <span className="font-mono text-slate-600">
                          {formatDateWib(ev.event_time)}
                        </span>
                      </div>
                      <div className="text-teal-dark font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {ev.location}
                      </div>
                      {ev.description && (
                        <p className="text-slate-700">{ev.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
