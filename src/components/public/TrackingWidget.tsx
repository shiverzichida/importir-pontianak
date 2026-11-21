'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  CATEGORY_LABELS,
  formatDateOnly,
  formatDateWib,
  formatIdr,
  METHOD_LABELS,
  ORIGIN_LABELS,
  PAYMENT_STATUS_META,
  SHIPMENT_STATUS_META,
  SHIPMENT_STEPS,
} from '@/lib/format';
import type { PublicSettings, PublicShipment, TrackingEvent } from '@/lib/types';

interface TrackingWidgetProps {
  initialQuery?: string;
  settings: PublicSettings;
}

const DEMO_CODES = [
  { code: 'IMP-PNK-2026-0001', label: 'China Laut (In Transit)' },
  { code: 'IMP-PNK-2026-0002', label: 'Kuching Darat (Tiba Pontianak)' },
  { code: 'IMP-PNK-2026-0003', label: 'Singapura Udara (Diterima)' },
];

export default function TrackingWidget({
  initialQuery = '',
  settings,
}: TrackingWidgetProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    shipment: PublicShipment;
    events: TrackingEvent[];
  } | null>(null);

  const performSearch = useCallback(async (searchCode: string) => {
    const trimmed = searchCode.trim();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/tracking?q=${encodeURIComponent(trimmed)}`,
        { cache: 'no-store' }
      );
      const data = (await res.json()) as {
        shipment?: PublicShipment;
        events?: TrackingEvent[];
        error?: string;
      };
      if (!res.ok || !data.shipment) {
        setResult(null);
        setErrorMsg(data.error || 'Data pengiriman tidak ditemukan.');
      } else {
        setResult({
          shipment: data.shipment,
          events: data.events || [],
        });
      }
    } catch {
      setErrorMsg('Gagal menghubungi server tracking. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery.trim()) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleChipClick = (code: string) => {
    setQuery(code);
    performSearch(code);
  };

  const statusMeta = result
    ? SHIPMENT_STATUS_META[result.shipment.current_status] ||
      SHIPMENT_STATUS_META.order_confirmed
    : null;

  const paymentMeta = result
    ? PAYMENT_STATUS_META[result.shipment.payment_status] ||
      PAYMENT_STATUS_META.belum_bayar
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Search Box Card */}
      <div className="rounded-2xl bg-navy-grid text-white p-6 sm:p-10 shadow-lg">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-400/30 px-3 py-1 text-xs font-semibold text-teal-200 mb-3">
            <Truck className="h-3.5 w-3.5" />
            Live Cargo Tracking — China, Malaysia, Singapura → Kalbar
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Cek Status Pengiriman & Resi Kargo Anda
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Cari menggunakan Nomor Resi (`IMP-PNK-...`), Marking Code
            (`PNK-CN-...`), atau Nomor Resi Lokal Supplier.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="h-5 w-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: IMP-PNK-2026-0001 atau PNK-CN-BUDI88"
              className="w-full rounded-xl bg-white text-slate-900 placeholder:text-slate-400 pl-11 pr-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal hover:bg-teal-light disabled:opacity-60 text-white font-bold px-6 py-3 text-sm shadow transition shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mencari...
              </>
            ) : (
              'Lacak Paket'
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span>Coba resi demo:</span>
          {DEMO_CODES.map((demo) => (
            <button
              key={demo.code}
              type="button"
              onClick={() => handleChipClick(demo.code)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 font-mono text-teal-200 transition"
            >
              <span className="font-bold">{demo.code}</span>
              <span className="font-sans text-[11px] text-slate-300">
                • {demo.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-800">{errorMsg}</p>
          <a
            href={buildWhatsAppUrl(
              settings.whatsapp_admin,
              `Halo Admin ${settings.company_name}, saya ingin menanyakan resi / marking code: ${query}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Tanya Admin via WhatsApp
          </a>
        </div>
      )}

      {/* Tracking Result */}
      {result && statusMeta && paymentMeta && (
        <div className="space-y-6">
          {/* Shipment Summary */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nomor Resi Importir Pontianak
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-navy">
                  {result.shipment.tracking_number}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                >
                  {statusMeta.label}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${paymentMeta.badgeClass}`}
                >
                  Pembayaran: {paymentMeta.label}
                </span>
              </div>
            </div>

            {/* 6-Step Progress Stepper */}
            <div className="px-6 py-6 border-b border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {SHIPMENT_STEPS.map((step, idx) => {
                  const done = idx <= statusMeta.stepIndex;
                  const current = idx === statusMeta.stepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3 transition ${
                        current
                          ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                          : done
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            done
                              ? 'bg-teal text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          0{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-navy leading-tight">
                        {step.shortLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {result.shipment.current_status === 'out_for_delivery' && (
                <div className="mt-4 rounded-xl bg-cyan-50 border border-cyan-200 px-4 py-2.5 text-xs font-semibold text-cyan-900 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cyan-700" />
                  Paket sedang dalam proses pengantaran kurir / ekspedisi menuju
                  alamat tujuan Anda di {result.shipment.destination_city}.
                </div>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Customer & Marking Code</div>
                <div className="font-bold text-navy mt-0.5">
                  {result.shipment.customer_name}
                </div>
                <div className="font-mono text-xs text-teal-700 font-semibold mt-0.5">
                  Marking: {result.shipment.marking_code}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Rute & Jalur</div>
                <div className="font-bold text-navy mt-0.5">
                  {ORIGIN_LABELS[result.shipment.origin_country]}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {METHOD_LABELS[result.shipment.shipping_method]} •{' '}
                  {CATEGORY_LABELS[result.shipment.cargo_category]}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Barang & Ukuran Gudang</div>
                <div className="font-semibold text-navy mt-0.5">
                  {result.shipment.item_summary}
                </div>
                <div className="text-xs font-mono text-slate-600 mt-0.5">
                  {result.shipment.colli_count} Koli
                  {result.shipment.actual_weight_kg
                    ? ` • ${result.shipment.actual_weight_kg} kg`
                    : ''}
                  {result.shipment.actual_cbm
                    ? ` • ${result.shipment.actual_cbm} CBM`
                    : ''}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Tujuan & Tagihan</div>
                <div className="font-bold text-navy mt-0.5">
                  {result.shipment.destination_city}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  ETA: {formatDateOnly(result.shipment.estimated_arrival)}
                  {result.shipment.invoice_amount_idr
                    ? ` • ${formatIdr(result.shipment.invoice_amount_idr)}`
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Timeline */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                Riwayat Perjalanan Kargo
              </h2>
              {result.shipment.supplier_tracking_no && (
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                  Resi Supplier: {result.shipment.supplier_tracking_no}
                </span>
              )}
            </div>

            {result.events.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">
                Belum ada log perjalanan tambahan untuk resi ini.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {result.events.map((ev, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={ev.id} className="relative">
                      <span
                        className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          isLatest
                            ? 'bg-teal border-teal-200 text-white'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isLatest ? 'bg-white' : 'bg-slate-300'
                          }`}
                        />
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h3
                          className={`text-sm font-bold ${
                            isLatest ? 'text-navy' : 'text-slate-700'
                          }`}
                        >
                          {ev.title}
                        </h3>
                        <span className="text-xs font-mono text-slate-500">
                          {formatDateWib(ev.event_time)}
                        </span>
                      </div>

                      <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                        <MapPin className="h-3.5 w-3.5" />
                        {ev.location}
                      </div>

                      {ev.description && (
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Butuh update jadwal pengambilan gudang Pontianak atau pembayaran?
              </div>
              <a
                href={buildWhatsAppUrl(
                  settings.whatsapp_admin,
                  `Halo Admin ${settings.company_name}, saya ingin menanyakan update resi ${result.shipment.tracking_number} (${result.shipment.marking_code}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs transition"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi Admin via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Back CTA when idle */}
      {!result && !errorMsg && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-navy text-sm">
                Belum punya nomor resi atau ingin ajukan pengiriman baru?
              </div>
              <div className="text-xs text-slate-500">
                Hitung estimasi ongkir atau daftarkan resi supplier Anda melalui
                form RFQ kami.
              </div>
            </div>
          </div>
          <Link
            href="/#rfq"
            className="rounded-xl bg-navy hover:bg-navy-light text-white font-bold px-5 py-2.5 text-xs transition shrink-0"
          >
            Ajukan Order / RFQ
          </Link>
        </div>
      )}
    </div>
  );
}
