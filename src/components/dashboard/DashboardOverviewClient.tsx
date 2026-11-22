'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Check,
  Clock,
  Copy,
  FileSpreadsheet,
  Package,
  PlusCircle,
  ShoppingBag,
  Tag,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';
import {
  formatDateWib,
  formatIdr,
  RFQ_STATUSES,
  SHIPMENT_STATUS_META,
} from '@/lib/format';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type {
  CustomerProfile,
  RfqOrder,
  Shipment,
  TrackingEvent,
} from '@/lib/types';
import MemberShell from './MemberShell';

interface OverviewStats {
  totalOrders: number;
  pendingOrders: number;
  quotedOrders: number;
  activeShipments: number;
  totalInvoiceIdr: number;
}

interface ShipmentWithLatest extends Shipment {
  latest_event: TrackingEvent | null;
}

interface DashboardOverviewClientProps {
  profile: CustomerProfile;
  stats: OverviewStats;
  latestOrders: RfqOrder[];
  latestShipments: ShipmentWithLatest[];
}

export default function DashboardOverviewClient({
  profile,
  stats,
  latestOrders,
  latestShipments,
}: DashboardOverviewClientProps) {
  const { locale, dict } = useLanguage();
  const portal = getPortalDictionary(locale);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const markingCodes = [
    { hub: 'China (Guangzhou)', code: `PNK-CN-${profile.marking_code_base}` },
    { hub: 'Malaysia (Kuching)', code: `PNK-MY-${profile.marking_code_base}` },
    { hub: 'Singapura (Tuas)', code: `PNK-SG-${profile.marking_code_base}` },
  ];

  const copyMarking = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const kpis = [
    {
      label: portal.overview.kpis.totalOrders,
      value: String(stats.totalOrders),
      icon: FileSpreadsheet,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      label: portal.overview.kpis.pendingOrders,
      value: String(stats.pendingOrders),
      icon: Clock,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      label: portal.overview.kpis.quotedOrders,
      value: String(stats.quotedOrders),
      icon: Tag,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
    {
      label: portal.overview.kpis.activeShipments,
      value: String(stats.activeShipments),
      icon: Truck,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      label: portal.overview.kpis.totalInvoice,
      value: formatIdr(stats.totalInvoiceIdr),
      icon: Banknote,
      color: 'text-rose-800 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <MemberShell profile={profile}>
      <div className="space-y-7">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {portal.overview.welcome(profile.full_name)}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {portal.overview.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/katalog"
              className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-white border border-[#D4E2F6] hover:border-brand text-ink font-bold px-4 text-xs sm:text-sm transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-brand" aria-hidden="true" />
              {portal.overview.viewCatalogCta}
            </Link>
            <Link
              href="/dashboard/orders/new"
              className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-5 text-xs sm:text-sm shadow-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              {portal.overview.newOrderCta}
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-2xl bg-white border border-[#DCE6F5] p-4 flex items-center gap-3.5 shadow-sm"
              >
                <div
                  className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${kpi.color}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-extrabold text-ink font-mono truncate">
                    {kpi.value}
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    {kpi.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permanent Marking Code Strip */}
        <section className="rounded-2xl bg-gradient-to-r from-[#0B2351] to-[#1748A8] text-white p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold">
                {portal.overview.markingCardTitle}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5 max-w-3xl">
                {portal.overview.markingCardSubtitle}
              </p>
            </div>
            <Link
              href="/dashboard/warehouses"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-gold hover:underline shrink-0"
            >
              {portal.shell.nav.warehouses}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {markingCodes.map((item) => {
              const isCopied = copiedCode === item.code;
              return (
                <div
                  key={item.code}
                  className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] text-blue-200 font-semibold">
                      {item.hub}
                    </div>
                    <div className="font-mono font-extrabold text-sm text-gold truncate">
                      {item.code}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyMarking(item.code)}
                    className="min-h-[36px] px-3 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold text-white inline-flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        {portal.overview.copiedBtn}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        {portal.overview.copyBtn}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Orders & Recent Shipments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="rounded-2xl bg-white border border-[#DCE6F5] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#E6EEF9] flex items-center justify-between">
              <h2 className="font-extrabold text-ink text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-brand" aria-hidden="true" />
                {portal.overview.recentOrdersTitle}
              </h2>
              <Link
                href="/dashboard/orders"
                className="text-xs font-bold text-brand hover:underline"
              >
                {portal.overview.viewAllOrders}
              </Link>
            </div>
            <div className="divide-y divide-[#E6EEF9]">
              {latestOrders.length === 0 ? (
                <p className="p-6 text-sm text-slate-600">
                  {portal.overview.noOrders}
                </p>
              ) : (
                latestOrders.map((order) => {
                  const st = RFQ_STATUSES[order.status] || RFQ_STATUSES.baru;
                  return (
                    <Link
                      key={order.id}
                      href="/dashboard/orders"
                      className="block p-4 hover:bg-ice transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-bold text-brand">
                            {order.rfq_code}
                            {order.lcl_batch_code ? ` · ${order.lcl_batch_code}` : ''}
                          </div>
                          <div className="font-bold text-sm text-ink mt-0.5 truncate">
                            {order.product_name}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {dict.domain.serviceLabels[order.service_type]} ·{' '}
                            {dict.domain.originLabels[order.origin_country]}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${st.badgeClass}`}
                        >
                          {portal.orders.statusLabels[order.status]}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                        <span>{formatDateWib(order.created_at, locale)}</span>
                        <span className="font-mono font-bold text-ink">
                          {order.quoted_total_idr
                            ? `${portal.overview.quoteLabel}: ${formatIdr(order.quoted_total_idr)}`
                            : order.estimated_total_idr
                              ? `${portal.overview.estLabel}: ${formatIdr(order.estimated_total_idr)}`
                              : '-'}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Shipments */}
          <div className="rounded-2xl bg-white border border-[#DCE6F5] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#E6EEF9] flex items-center justify-between">
              <h2 className="font-extrabold text-ink text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-brand" aria-hidden="true" />
                {portal.overview.recentShipmentsTitle}
              </h2>
              <Link
                href="/dashboard/shipments"
                className="text-xs font-bold text-brand hover:underline"
              >
                {portal.overview.viewAllShipments}
              </Link>
            </div>
            <div className="divide-y divide-[#E6EEF9]">
              {latestShipments.length === 0 ? (
                <p className="p-6 text-sm text-slate-600">
                  {portal.overview.noShipments}
                </p>
              ) : (
                latestShipments.map((s) => {
                  const meta =
                    SHIPMENT_STATUS_META[s.current_status] ||
                    SHIPMENT_STATUS_META.order_confirmed;
                  return (
                    <Link
                      key={s.id}
                      href="/dashboard/shipments"
                      className="block p-4 hover:bg-ice transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-bold text-navy">
                            {s.tracking_number}{' '}
                            <span className="text-slate-600 font-normal">
                              ({s.marking_code})
                            </span>
                          </div>
                          <div className="font-bold text-sm text-ink mt-0.5 truncate">
                            {s.item_summary}
                          </div>
                          {s.latest_event && (
                            <div className="text-xs text-slate-600 mt-0.5 truncate">
                              {s.latest_event.location} · {s.latest_event.title}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${meta.badgeClass}`}
                        >
                          {dict.domain.shipmentStatusLabels[s.current_status]}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </MemberShell>
  );
}
