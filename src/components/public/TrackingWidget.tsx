'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
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
  formatDateOnly,
  formatDateWib,
  formatIdr,
  PAYMENT_STATUS_META,
  SHIPMENT_STATUS_META,
  SHIPMENT_STEPS,
} from '@/lib/format';
import { formatDestinationLabel } from '@/lib/i18n/dictionaries';
import type { PublicSettings, PublicShipment, TrackingEvent } from '@/lib/types';
import { useLanguage } from './LanguageProvider';

interface TrackingWidgetProps {
  initialQuery?: string;
  settings: PublicSettings;
}

const DEMO_CODES = [
  'IMP-PNK-2026-0001',
  'IMP-PNK-2026-0002',
  'IMP-PNK-2026-0003',
] as const;

export default function TrackingWidget({
  initialQuery = '',
  settings,
}: TrackingWidgetProps) {
  const { locale, dict } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    shipment: PublicShipment;
    events: TrackingEvent[];
  } | null>(null);

  const performSearch = useCallback(
    async (searchCode: string) => {
      const trimmed = searchCode.trim();
      if (!trimmed) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/tracking?q=${encodeURIComponent(trimmed)}&lang=${locale}`,
          { cache: 'no-store' }
        );
        const data = (await res.json()) as {
          shipment?: PublicShipment;
          events?: TrackingEvent[];
          error?: string;
        };
        if (!res.ok || !data.shipment) {
          setResult(null);
          setErrorMsg(data.error || dict.tracking.errors.notFound);
        } else {
          setResult({
            shipment: data.shipment,
            events: data.events || [],
          });
        }
      } catch {
        setErrorMsg(dict.tracking.errors.serverError);
      } finally {
        setLoading(false);
      }
    },
    [locale, dict.tracking.errors.notFound, dict.tracking.errors.serverError]
  );

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
      <div className="relative rounded-2xl overflow-hidden bg-navy text-white p-6 sm:p-10 shadow-md">
        <img
          src="/images/tracking-ship-banner.jpg"
          alt=""
          width={1200}
          height={675}
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B2351] via-[#0B2351]/85 to-transparent"
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white text-navy flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {dict.tracking.title}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100">
                {dict.tracking.subtitle}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl p-1.5 shadow-sm"
          >
            <div className="relative flex-1">
              <label htmlFor="tracking-search-input" className="sr-only">
                {dict.tracking.searchAriaLabel}
              </label>
              <Search
                className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                aria-hidden="true"
              />
              <input
                id="tracking-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.tracking.searchPlaceholder}
                className="w-full min-h-[44px] rounded-lg bg-white text-ink placeholder:text-slate-500 pl-10 pr-3.5 py-2 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-extrabold px-6 text-sm transition-colors shrink-0"
            >
              {loading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {dict.tracking.searchingBtn}
                </>
              ) : (
                <>
                  {dict.tracking.searchBtn}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-100">
            <span>{dict.tracking.demoLabel}</span>
            {DEMO_CODES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleChipClick(code)}
                className="min-h-[34px] inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 font-mono text-white transition-colors"
              >
                <span className="font-bold">{code}</span>
                <span className="font-sans text-blue-100">
                  · {dict.tracking.demoLabels[code]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-center space-y-3"
        >
          <p className="text-sm font-semibold text-rose-900">{errorMsg}</p>
          <a
            href={buildWhatsAppUrl(
              settings.whatsapp_admin,
              dict.tracking.waInquiryQuery(settings.company_name, query)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white text-xs font-bold px-5 transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {dict.tracking.askWaBtn}
          </a>
        </div>
      )}

      {result && statusMeta && paymentMeta && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-[#DCE6F5] shadow-sm overflow-hidden">
            <div className="bg-ice border-b border-[#DCE6F5] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-600">
                  {dict.tracking.result.trackingNoLabel}
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-ink">
                  {result.shipment.tracking_number}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
                >
                  {dict.domain.shipmentStatusLabels[
                    result.shipment.current_status
                  ] || statusMeta.label}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${paymentMeta.badgeClass}`}
                >
                  {dict.tracking.result.paymentPrefix}{' '}
                  {dict.domain.paymentStatusLabels[
                    result.shipment.payment_status
                  ] || paymentMeta.label}
                </span>
              </div>
            </div>

            <div className="px-6 py-6 border-b border-[#E6EEF9]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {SHIPMENT_STEPS.map((step, idx) => {
                  const done = idx <= statusMeta.stepIndex;
                  const current = idx === statusMeta.stepIndex;
                  const stepShortLabel =
                    step.key !== 'out_for_delivery'
                      ? dict.domain.shipmentStepShortLabels[step.key]
                      : step.shortLabel;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3 ${
                        current
                          ? 'bg-[#EEF5FF] border-brand ring-1 ring-brand'
                          : done
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            done
                              ? 'bg-brand text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                          0{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-ink leading-tight">
                        {stepShortLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {result.shipment.current_status === 'out_for_delivery' && (
                <div className="mt-4 rounded-xl bg-[#EEF5FF] border border-[#BBD2F8] px-4 py-2.5 text-xs font-semibold text-ink flex items-center gap-2">
                  <Truck
                    className="h-4 w-4 text-brand shrink-0"
                    aria-hidden="true"
                  />
                  {dict.tracking.result.outForDeliveryNotice(
                    formatDestinationLabel(
                      result.shipment.destination_city,
                      locale
                    )
                  )}
                </div>
              )}
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-600">
                  {dict.tracking.result.customerMarking}
                </div>
                <div className="font-bold text-ink mt-0.5">
                  {result.shipment.customer_name}
                </div>
                <div className="font-mono text-xs text-brand font-semibold mt-0.5">
                  {dict.tracking.result.markingPrefix}{' '}
                  {result.shipment.marking_code}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600">
                  {dict.tracking.result.routeMethod}
                </div>
                <div className="font-bold text-ink mt-0.5">
                  {dict.domain.originLabels[result.shipment.origin_country]}
                </div>
                <div className="text-xs text-slate-700 mt-0.5">
                  {dict.domain.methodLabels[result.shipment.shipping_method]} ·{' '}
                  {dict.domain.categoryLabels[result.shipment.cargo_category]}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600">
                  {dict.tracking.result.goodsWarehouse}
                </div>
                <div className="font-semibold text-ink mt-0.5">
                  {result.shipment.item_summary}
                </div>
                <div className="text-xs font-mono text-slate-700 mt-0.5">
                  {result.shipment.colli_count}{' '}
                  {dict.tracking.result.colliUnit}
                  {result.shipment.actual_weight_kg
                    ? ` · ${result.shipment.actual_weight_kg} kg`
                    : ''}
                  {result.shipment.actual_cbm
                    ? ` · ${result.shipment.actual_cbm} CBM`
                    : ''}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-600">
                  {dict.tracking.result.destinationInvoice}
                </div>
                <div className="font-bold text-ink mt-0.5">
                  {formatDestinationLabel(
                    result.shipment.destination_city,
                    locale
                  )}
                </div>
                <div className="text-xs text-slate-700 mt-0.5">
                  {dict.tracking.result.etaPrefix}{' '}
                  {formatDateOnly(result.shipment.estimated_arrival, locale)}
                  {result.shipment.invoice_amount_idr
                    ? ` · ${formatIdr(result.shipment.invoice_amount_idr)}`
                    : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#DCE6F5] shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand" aria-hidden="true" />
                {dict.tracking.result.historyHeading}
              </h2>
              {result.shipment.supplier_tracking_no && (
                <span className="text-xs font-mono bg-ice border border-[#DCE6F5] text-ink px-3 py-1 rounded-lg">
                  {dict.tracking.result.supplierResiPrefix}{' '}
                  {result.shipment.supplier_tracking_no}
                </span>
              )}
            </div>

            {result.events.length === 0 ? (
              <p className="text-sm text-slate-600 py-4">
                {dict.tracking.result.noEvents}
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE6F5]">
                {result.events.map((ev, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={ev.id} className="relative">
                      <span
                        className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          isLatest
                            ? 'bg-brand border-blue-200 text-white'
                            : 'bg-white border-slate-400 text-slate-500'
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isLatest ? 'bg-white' : 'bg-slate-400'
                          }`}
                        />
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h3
                          className={`text-sm font-bold ${
                            isLatest ? 'text-ink' : 'text-slate-800'
                          }`}
                        >
                          {ev.title}
                        </h3>
                        <span className="text-xs font-mono text-slate-600">
                          {formatDateWib(ev.event_time, locale)}
                        </span>
                      </div>

                      <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {ev.location}
                      </div>

                      {ev.description && (
                        <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-[#E6EEF9] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck
                  className="h-4 w-4 text-brand shrink-0"
                  aria-hidden="true"
                />
                {dict.tracking.result.needUpdatePrompt}
              </div>
              <a
                href={buildWhatsAppUrl(
                  settings.whatsapp_admin,
                  dict.tracking.waUpdateResi(
                    settings.company_name,
                    result.shipment.tracking_number,
                    result.shipment.marking_code
                  )
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-5 text-xs shadow-sm transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {dict.tracking.result.contactAdminBtn}
              </a>
            </div>
          </div>
        </div>
      )}

      {!result && !errorMsg && !loading && (
        <div className="rounded-2xl border border-[#DCE6F5] bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-ink text-sm">
                {dict.tracking.empty.title}
              </div>
              <div className="text-xs text-slate-600">
                {dict.tracking.empty.desc}
              </div>
            </div>
          </div>
          <Link
            href="/#rfq"
            className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-white font-bold px-5 text-xs transition-colors shrink-0"
          >
            {dict.tracking.empty.cta}
          </Link>
        </div>
      )}
    </div>
  );
}
