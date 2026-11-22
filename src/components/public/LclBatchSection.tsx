'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  Container,
  MessageCircle,
  Ship,
  Truck,
  Plane,
} from 'lucide-react';
import { buildWhatsAppUrl, formatDateOnly, formatNumberId } from '@/lib/format';
import type { LclBatch, LclBatchStatus, PublicSettings } from '@/lib/types';
import { useCustomerAuth } from './CustomerAuthProvider';
import { useLanguage } from './LanguageProvider';

interface LclBatchSectionProps {
  batches: LclBatch[];
  settings: PublicSettings;
  compact?: boolean;
  onSelectBatch?: (batch: LclBatch) => void;
}

const STATUS_STYLE: Record<LclBatchStatus, string> = {
  open: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  almost_full: 'bg-amber-50 text-amber-900 border-amber-300',
  closed: 'bg-slate-100 text-slate-700 border-slate-300',
  sailing: 'bg-sky-50 text-sky-800 border-sky-200',
  arrived: 'bg-indigo-50 text-indigo-800 border-indigo-200',
};

const BAR_COLOR: Record<LclBatchStatus, string> = {
  open: 'bg-wa',
  almost_full: 'bg-amber-500',
  closed: 'bg-slate-500',
  sailing: 'bg-brand',
  arrived: 'bg-indigo-600',
};

export default function LclBatchSection({
  batches,
  settings,
  compact = false,
  onSelectBatch,
}: LclBatchSectionProps) {
  const { locale, dict } = useLanguage();
  const { customer } = useCustomerAuth();

  if (batches.length === 0) return null;

  const methodIcon = (method: LclBatch['shipping_method']) => {
    if (method === 'udara') return <Plane className="h-4 w-4" aria-hidden="true" />;
    if (method === 'darat') return <Truck className="h-4 w-4" aria-hidden="true" />;
    return <Ship className="h-4 w-4" aria-hidden="true" />;
  };

  return (
    <section
      id="kloter-lcl"
      className={`${
        compact ? 'py-8 sm:py-10' : 'py-12 lg:py-16'
      } bg-white border-b border-[#E2EAF6]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-7">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand mb-1">
              <span
                className="w-6 h-0.5 bg-brand rounded-full"
                aria-hidden="true"
              />
              {dict.lclBatches.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {dict.lclBatches.heading}
            </h2>
            <p className="mt-2 text-slate-700 text-sm sm:text-base">
              {dict.lclBatches.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const cap = Math.max(0.1, Number(batch.capacity_cbm) || 28);
            const filled = Math.max(0, Number(batch.filled_cbm) || 0);
            const remaining = Math.max(0, Number((cap - filled).toFixed(2)));
            const pct = Math.min(100, Math.round((filled / cap) * 100));
            const cutoffFormatted = formatDateOnly(batch.cutoff_date, locale);

            const waUrl = buildWhatsAppUrl(
              settings.whatsapp_admin,
              dict.lclBatches.waBookingTemplate({
                companyName: settings.company_name,
                batchCode: batch.batch_code,
                title: batch.title,
                remainingCbm: formatNumberId(remaining, 2),
                cutoff: cutoffFormatted,
              })
            );

            return (
              <article
                key={batch.id}
                className="rounded-2xl bg-ice border border-[#DCE6F5] p-5 shadow-sm hover:border-brand/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 font-mono text-xs font-extrabold text-navy bg-white border border-[#DCE6F5] px-2.5 py-1 rounded-lg">
                      <Container
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden="true"
                      />
                      {batch.batch_code}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                        STATUS_STYLE[batch.status]
                      }`}
                    >
                      {dict.lclBatches.statusLabels[batch.status]}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-ink text-base leading-snug">
                      {batch.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-semibold">
                      <span className="inline-flex items-center gap-1 text-brand">
                        {methodIcon(batch.shipping_method)}
                        {batch.origin_warehouse}
                      </span>
                      <span>· {batch.container_size}</span>
                    </div>
                  </div>

                  {/* Capacity progress bar */}
                  <div className="rounded-xl bg-white border border-[#DCE6F5] p-3.5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-bold text-ink">
                        {dict.lclBatches.filledLabel}:{' '}
                        <span className="font-mono text-brand">
                          {formatNumberId(filled, 1)} / {formatNumberId(cap, 0)}{' '}
                          CBM ({pct}%)
                        </span>
                      </span>
                      <span className="font-mono font-extrabold text-wa">
                        {dict.lclBatches.remainingLabel}:{' '}
                        {formatNumberId(remaining, 1)} CBM
                      </span>
                    </div>

                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={batch.batch_code}
                      className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          BAR_COLOR[batch.status]
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                      <span>
                        {dict.lclBatches.minSlotLabel}:{' '}
                        <strong className="font-mono text-ink">
                          {formatNumberId(Number(batch.min_slot_cbm), 2)} CBM
                        </strong>
                      </span>
                      <span>
                        <CalendarClock
                          className="h-3 w-3 inline mr-1 text-brand"
                          aria-hidden="true"
                        />
                        {dict.lclBatches.cutoffLabel}:{' '}
                        <strong className="text-ink">{cutoffFormatted}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {batch.etd_date && (
                      <div className="rounded-lg bg-white border border-[#E2EAF6] px-2.5 py-1.5">
                        <span className="text-slate-500 block">
                          {dict.lclBatches.etdLabel}
                        </span>
                        <span className="font-bold text-ink">
                          {formatDateOnly(batch.etd_date, locale)}
                        </span>
                      </div>
                    )}
                    {batch.eta_date && (
                      <div className="rounded-lg bg-white border border-[#E2EAF6] px-2.5 py-1.5">
                        <span className="text-slate-500 block">
                          {dict.lclBatches.etaLabel}
                        </span>
                        <span className="font-bold text-ink">
                          {formatDateOnly(batch.eta_date, locale)}
                        </span>
                      </div>
                    )}
                  </div>

                  {batch.notes && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {batch.notes}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DCE6F5]">
                  {onSelectBatch ? (
                    <button
                      type="button"
                      onClick={() => onSelectBatch(batch)}
                      className="min-h-[42px] inline-flex items-center justify-center gap-1 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold px-3 text-xs transition-colors"
                    >
                      {dict.lclBatches.bookSlotBtn}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      href={
                        customer
                          ? `/dashboard/orders/new?batch=${encodeURIComponent(batch.batch_code)}`
                          : `/?batch=${encodeURIComponent(batch.batch_code)}#rfq`
                      }
                      className="min-h-[42px] inline-flex items-center justify-center gap-1 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold px-3 text-xs transition-colors"
                    >
                      {dict.lclBatches.bookSlotBtn}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] inline-flex items-center justify-center gap-1 rounded-xl bg-wa hover:bg-wa-dark text-white font-bold px-3 text-xs transition-colors"
                  >
                    <MessageCircle
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    {dict.lclBatches.askSlotWaBtn}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
