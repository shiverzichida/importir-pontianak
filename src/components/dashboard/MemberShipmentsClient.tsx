'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';
import {
  formatDateOnly,
  formatDateWib,
  formatIdr,
  PAYMENT_STATUS_META,
  SHIPMENT_STATUS_META,
} from '@/lib/format';
import { formatDestinationLabel } from '@/lib/i18n/dictionaries';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type {
  CustomerProfile,
  Shipment,
  TrackingEvent,
} from '@/lib/types';
import MemberShell from './MemberShell';

interface ShipmentWithEvents extends Shipment {
  events: TrackingEvent[];
}

interface MemberShipmentsClientProps {
  profile: CustomerProfile;
  initialQuery?: string;
}

export default function MemberShipmentsClient({
  profile,
  initialQuery = '',
}: MemberShipmentsClientProps) {
  const { locale, dict } = useLanguage();
  const portal = getPortalDictionary(locale);

  const [shipments, setShipments] = useState<ShipmentWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialQuery);

  const [proofTarget, setProofTarget] = useState<ShipmentWithEvents | null>(
    null
  );
  const [proofUrl, setProofUrl] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savingProof, setSavingProof] = useState(false);
  const [proofFeedback, setProofFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/customer/shipments?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoadError('Gagal memuat data pengiriman.');
        setShipments([]);
        return;
      }
      const data = (await res.json()) as {
        shipments?: ShipmentWithEvents[];
      };
      setShipments(data.shipments || []);
    } catch {
      setLoadError(portal.auth.errors.networkError);
    } finally {
      setLoading(false);
    }
  }, [search, portal.auth.errors.networkError]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    if (!proofTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProofTarget(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [proofTarget]);

  const openProofModal = (shipment: ShipmentWithEvents) => {
    setProofTarget(shipment);
    setProofUrl(shipment.payment_proof_url || '');
    setProofNote(shipment.payment_proof_note || '');
    setProofFeedback(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFeedback(null);
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setProofFeedback({
          type: 'err',
          msg: data.error || portal.shipments.proofModal.uploadError,
        });
      } else {
        setProofUrl(data.url);
      }
    } catch {
      setProofFeedback({
        type: 'err',
        msg: portal.shipments.proofModal.uploadError,
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofTarget || !proofUrl) return;
    setSavingProof(true);
    setProofFeedback(null);
    try {
      const res = await fetch(
        `/api/customer/shipments/${proofTarget.id}/payment-proof`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_proof_url: proofUrl,
            payment_proof_note: proofNote,
          }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setProofFeedback({
          type: 'err',
          msg: data.error || portal.shipments.proofModal.saveError,
        });
      } else {
        setProofFeedback({
          type: 'ok',
          msg: portal.shipments.proofModal.successMsg,
        });
        await loadShipments();
      }
    } catch {
      setProofFeedback({
        type: 'err',
        msg: portal.auth.errors.networkError,
      });
    } finally {
      setSavingProof(false);
    }
  };

  return (
    <MemberShell profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {portal.shipments.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {portal.shipments.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#DCE6F5] p-4 shadow-sm">
          <div className="relative max-w-lg">
            <label htmlFor="member-shipment-search" className="sr-only">
              {portal.shipments.searchPlaceholder}
            </label>
            <Search
              className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
              aria-hidden="true"
            />
            <input
              id="member-shipment-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={portal.shipments.searchPlaceholder}
              className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#DCE6F5] p-10 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
            Loading...
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl border border-[#DCE6F5] p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-800">{loadError}</p>
            <button
              type="button"
              onClick={loadShipments}
              className="min-h-[42px] px-4 rounded-xl bg-navy text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE6F5] p-10 text-center space-y-2">
            <Package className="h-8 w-8 text-brand mx-auto" aria-hidden="true" />
            <div className="text-base font-extrabold text-ink">
              {portal.shipments.emptyTitle}
            </div>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {portal.shipments.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {shipments.map((s) => {
              const statusMeta =
                SHIPMENT_STATUS_META[s.current_status] ||
                SHIPMENT_STATUS_META.order_confirmed;
              const payMeta =
                PAYMENT_STATUS_META[s.payment_status] ||
                PAYMENT_STATUS_META.belum_bayar;

              return (
                <article
                  key={s.id}
                  className="bg-white rounded-2xl border border-[#DCE6F5] shadow-sm overflow-hidden"
                >
                  {/* Header Strip */}
                  <div className="bg-gradient-to-r from-[#0B2351] to-[#1748A8] text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-extrabold text-sm sm:text-base text-gold">
                          {s.tracking_number}
                        </span>
                        <span className="rounded-lg bg-white/15 border border-white/20 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                          {portal.shipments.markingLabel}: {s.marking_code}
                        </span>
                      </div>
                      <h2 className="font-bold text-sm sm:text-base text-white">
                        {s.item_summary}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                      >
                        {dict.domain.shipmentStatusLabels[s.current_status]}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${payMeta.badgeClass}`}
                      >
                        {dict.domain.paymentStatusLabels[s.payment_status]}
                      </span>
                    </div>
                  </div>

                  {/* Specs + Invoice & Payment Proof + Timeline */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs bg-ice rounded-xl p-4 border border-[#DCE6F5]">
                        <div>
                          <div className="text-slate-500 font-semibold">
                            {dict.rfq.fields.originLabel} / Jalur
                          </div>
                          <div className="font-bold text-ink mt-0.5">
                            {dict.domain.originLabels[s.origin_country]} ·{' '}
                            {dict.domain.methodLabels[s.shipping_method]}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-semibold">
                            {portal.orders.modal.destination}
                          </div>
                          <div className="font-bold text-ink mt-0.5">
                            {formatDestinationLabel(s.destination_city, locale)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-semibold">
                            {portal.shipments.colliLabel} /{' '}
                            {portal.shipments.weightVolLabel}
                          </div>
                          <div className="font-mono font-bold text-ink mt-0.5">
                            {s.colli_count} koli · {s.actual_weight_kg ?? '-'} kg
                            {s.actual_cbm !== null ? ` / ${s.actual_cbm} CBM` : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-semibold">
                            {portal.shipments.etaLabel}
                          </div>
                          <div className="font-bold text-ink mt-0.5">
                            {s.estimated_arrival
                              ? formatDateOnly(s.estimated_arrival, locale)
                              : '-'}
                          </div>
                        </div>
                        {s.supplier_tracking_no && (
                          <div className="col-span-2 pt-2 border-t border-[#DCE6F5]">
                            <div className="text-slate-500 font-semibold">
                              {portal.shipments.supplierResiLabel}
                            </div>
                            <div className="font-mono font-bold text-brand mt-0.5">
                              {s.supplier_tracking_no}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Invoice & Upload Payment Proof */}
                      <div className="rounded-xl border border-[#DCE6F5] p-4 space-y-3 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-600">
                              {portal.shipments.invoiceLabel}
                            </div>
                            <div className="text-lg font-extrabold font-mono text-ink">
                              {s.invoice_amount_idr
                                ? formatIdr(s.invoice_amount_idr)
                                : '-'}
                            </div>
                          </div>
                          {s.payment_status !== 'lunas' && (
                            <button
                              type="button"
                              onClick={() => openProofModal(s)}
                              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-4 text-xs shadow-sm transition-colors"
                            >
                              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                              {s.payment_proof_url
                                ? portal.shipments.updateProofBtn
                                : portal.shipments.uploadProofBtn}
                            </button>
                          )}
                        </div>

                        {s.payment_proof_url && (
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3">
                            <img
                              src={s.payment_proof_url}
                              alt="Bukti pembayaran"
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-lg object-cover border border-emerald-300 shrink-0"
                            />
                            <div className="min-w-0 text-xs">
                              <div className="inline-flex items-center gap-1 font-bold text-emerald-900">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                {portal.shipments.proofUploadedBadge}
                              </div>
                              {s.payment_proof_note && (
                                <p className="text-emerald-950 truncate mt-0.5">
                                  {s.payment_proof_note}
                                </p>
                              )}
                              {s.payment_proof_uploaded_at && (
                                <div className="text-[11px] text-emerald-700 mt-0.5">
                                  {formatDateWib(s.payment_proof_uploaded_at, locale)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-7">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                        {portal.shipments.timelineTitle}
                      </h3>

                      {s.events.length === 0 ? (
                        <p className="text-sm text-slate-600">
                          {portal.shipments.noEvents}
                        </p>
                      ) : (
                        <ol className="relative border-l-2 border-[#DCE6F5] ml-2 space-y-4 pl-5">
                          {s.events.map((ev, idx) => (
                            <li key={ev.id} className="relative">
                              <span
                                className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                                  idx === 0 ? 'bg-brand' : 'bg-slate-300'
                                }`}
                                aria-hidden="true"
                              />
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div className="font-bold text-sm text-ink">
                                  {ev.title}
                                </div>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {formatDateWib(ev.event_time, locale)}
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-brand flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {ev.location}
                              </div>
                              {ev.description && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {ev.description}
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {proofTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProofTarget(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#DCE6F5] overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base">
                  {portal.shipments.proofModal.title}
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  {portal.shipments.proofModal.subtitle(
                    proofTarget.tracking_number
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProofTarget(null)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveProof} className="p-6 space-y-4 text-sm">
              <div>
                <label
                  htmlFor="payment-proof-file"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  {portal.shipments.proofModal.selectFileLabel}
                </label>

                {proofUrl && (
                  <div className="mb-2.5 rounded-xl border border-[#DCE6F5] bg-ice p-2.5 flex items-center gap-3">
                    <img
                      src={proofUrl}
                      alt="Preview bukti bayar"
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-lg object-cover border border-[#DCE6F5]"
                    />
                    <span className="text-xs font-mono text-slate-600 truncate">
                      {proofUrl}
                    </span>
                  </div>
                )}

                <label
                  htmlFor="payment-proof-file"
                  className="flex items-center justify-center gap-2 min-h-[72px] rounded-xl border-2 border-dashed border-[#C2D5F2] bg-ice hover:border-brand px-4 py-4 cursor-pointer transition-colors"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2
                        className="h-5 w-5 animate-spin text-brand"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-ink">
                        {portal.shipments.proofModal.uploadingFile}
                      </span>
                    </>
                  ) : (
                    <>
                      <ImagePlus
                        className="h-5 w-5 text-brand"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-ink">
                        {portal.shipments.proofModal.pickFileBtn}
                      </span>
                    </>
                  )}
                  <input
                    id="payment-proof-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>

              <div>
                <label
                  htmlFor="payment-proof-note"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  {portal.shipments.proofModal.noteLabel}
                </label>
                <textarea
                  id="payment-proof-note"
                  rows={2}
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder={portal.shipments.proofModal.notePlaceholder}
                  className="w-full rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              {proofFeedback && (
                <div
                  role="status"
                  className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                    proofFeedback.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  {proofFeedback.msg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProofTarget(null)}
                  className="min-h-[42px] rounded-full border border-[#DCE6F5] px-4 text-xs font-bold text-ink"
                >
                  {portal.shipments.proofModal.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={!proofUrl || uploadingFile || savingProof}
                  className="min-h-[42px] rounded-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink font-extrabold px-5 text-xs shadow-sm transition-colors"
                >
                  {savingProof
                    ? portal.shipments.proofModal.savingBtn
                    : portal.shipments.proofModal.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MemberShell>
  );
}
