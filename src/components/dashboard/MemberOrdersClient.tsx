'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Container,
  ExternalLink,
  Eye,
  Loader2,
  MessageCircle,
  Package,
  PlusCircle,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '@/components/public/LanguageProvider';
import {
  buildWhatsAppUrl,
  formatDateWib,
  formatIdr,
  RFQ_STATUSES,
} from '@/lib/format';
import { formatDestinationLabel } from '@/lib/i18n/dictionaries';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type { CustomerProfile, RfqOrder } from '@/lib/types';
import MemberShell from './MemberShell';

interface MemberOrderRow extends RfqOrder {
  shipment_tracking_number?: string | null;
}

interface MemberOrdersClientProps {
  profile: CustomerProfile;
  whatsappAdmin: string;
}

export default function MemberOrdersClient({
  profile,
  whatsappAdmin,
}: MemberOrdersClientProps) {
  const { locale, dict } = useLanguage();
  const portal = getPortalDictionary(locale);

  const [orders, setOrders] = useState<MemberOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<MemberOrderRow | null>(
    null
  );
  const [acting, setActing] = useState<'approve_quote' | 'cancel' | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('q', search.trim());
      const res = await fetch(`/api/customer/orders?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoadError('Gagal memuat data order.');
        setOrders([]);
        return;
      }
      const data = (await res.json()) as { orders?: MemberOrderRow[] };
      const list = data.orders || [];
      setOrders(list);
      setSelectedOrder((prev) =>
        prev ? list.find((o) => o.id === prev.id) || prev : null
      );
    } catch {
      setLoadError(portal.auth.errors.networkError);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, portal.auth.errors.networkError]);

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

  const handleOrderAction = async (action: 'approve_quote' | 'cancel') => {
    if (!selectedOrder) return;
    if (action === 'cancel' && !confirm(portal.orders.modal.cancelConfirm)) {
      return;
    }

    setActing(action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/customer/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as {
        order?: MemberOrderRow;
        error?: string;
      };
      if (!res.ok || !data.order) {
        setFeedback({
          type: 'err',
          msg: data.error || portal.orders.modal.actionFail,
        });
      } else {
        setSelectedOrder((prev) =>
          prev ? { ...prev, ...data.order } : data.order || null
        );
        setFeedback({
          type: 'ok',
          msg:
            action === 'approve_quote'
              ? portal.orders.modal.approveSuccess
              : portal.orders.modal.cancelSuccess,
        });
        loadOrders();
      }
    } catch {
      setFeedback({ type: 'err', msg: portal.auth.errors.networkError });
    } finally {
      setActing(null);
    }
  };

  const buildOrderWaUrl = (order: MemberOrderRow) => {
    const text = [
      `Halo Admin Importir Pontianak, saya ${profile.full_name} (${profile.member_code}).`,
      `Saya ingin menanyakan status order *${order.rfq_code}* (${order.product_name}).`,
    ].join('\n');
    return buildWhatsAppUrl(whatsappAdmin, text);
  };

  return (
    <MemberShell profile={profile}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {portal.orders.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {portal.orders.subtitle}
            </p>
          </div>
          <Link
            href="/dashboard/orders/new"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-5 text-xs sm:text-sm shadow-sm transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            {portal.orders.newOrderBtn}
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#DCE6F5] p-4 flex flex-wrap gap-3 items-center shadow-sm">
          <div className="relative flex-1 min-w-[220px]">
            <label htmlFor="member-order-search" className="sr-only">
              {portal.orders.searchPlaceholder}
            </label>
            <Search
              className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
              aria-hidden="true"
            />
            <input
              id="member-order-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={portal.orders.searchPlaceholder}
              className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="member-order-status" className="sr-only">
              {portal.orders.allStatusOption}
            </label>
            <select
              id="member-order-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[44px] rounded-xl border border-[#D4E2F6] px-3.5 py-2 text-sm bg-white text-ink focus:border-brand focus:outline-none"
            >
              <option value="all">{portal.orders.allStatusOption}</option>
              <option value="baru">{portal.orders.statusLabels.baru}</option>
              <option value="diproses">
                {portal.orders.statusLabels.diproses}
              </option>
              <option value="penawaran_dikirim">
                {portal.orders.statusLabels.penawaran_dikirim}
              </option>
              <option value="disetujui">
                {portal.orders.statusLabels.disetujui}
              </option>
              <option value="dibatalkan">
                {portal.orders.statusLabels.dibatalkan}
              </option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-[#DCE6F5] overflow-x-auto shadow-sm">
          {loading ? (
            <div className="p-10 flex items-center justify-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
              Loading...
            </div>
          ) : loadError ? (
            <div className="p-8 text-center space-y-3" role="alert">
              <p className="text-sm font-semibold text-rose-800">{loadError}</p>
              <button
                type="button"
                onClick={loadOrders}
                className="min-h-[42px] px-4 rounded-xl bg-navy text-white text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center space-y-2 max-w-md mx-auto">
              <div className="text-base font-extrabold text-ink">
                {portal.orders.emptyTitle}
              </div>
              <p className="text-sm text-slate-600">{portal.orders.emptyDesc}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-ice border-b border-[#DCE6F5] text-xs font-bold text-ink">
                  <th className="px-4 py-3">{portal.orders.columns.codeDate}</th>
                  <th className="px-4 py-3">{portal.orders.columns.product}</th>
                  <th className="px-4 py-3">{portal.orders.columns.route}</th>
                  <th className="px-4 py-3">{portal.orders.columns.price}</th>
                  <th className="px-4 py-3">{portal.orders.columns.status}</th>
                  <th className="px-4 py-3 text-right">
                    {portal.orders.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EEF9]">
                {orders.map((order) => {
                  const st = RFQ_STATUSES[order.status] || RFQ_STATUSES.baru;
                  return (
                    <tr key={order.id} className="hover:bg-ice/60">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-brand text-xs">
                          {order.rfq_code}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {formatDateWib(order.created_at, locale)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-ink truncate">
                          {order.product_name}
                        </div>
                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span>{dict.domain.serviceLabels[order.service_type]}</span>
                          {order.lcl_batch_code && (
                            <span className="inline-flex items-center gap-1 rounded bg-[#EEF5FF] border border-[#BFD6F9] px-1.5 py-0.5 font-mono text-[11px] font-bold text-brand">
                              <Container className="h-3 w-3" aria-hidden="true" />
                              {order.lcl_batch_code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-bold text-ink">
                          {dict.domain.originLabels[order.origin_country]}
                        </div>
                        <div className="text-xs text-slate-600">
                          {dict.domain.methodLabels[order.shipping_method]} →{' '}
                          {formatDestinationLabel(order.destination_city, locale)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                        {order.quoted_total_idr ? (
                          <div>
                            <span className="font-extrabold text-emerald-800">
                              {formatIdr(order.quoted_total_idr)}
                            </span>
                            <div className="text-[11px] text-emerald-700 font-sans font-semibold">
                              {portal.orders.quotedBadge}
                            </div>
                          </div>
                        ) : order.estimated_total_idr ? (
                          <div>
                            <span className="font-semibold text-ink">
                              {formatIdr(order.estimated_total_idr)}
                            </span>
                            <div className="text-[11px] text-slate-500 font-sans">
                              {portal.orders.estimatedBadge}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${st.badgeClass}`}
                        >
                          {portal.orders.statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setFeedback(null);
                          }}
                          className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light text-white text-xs font-bold px-3.5 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                          {portal.orders.detailBtn}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE6F5]">
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="font-mono text-xs text-gold font-bold">
                  {selectedOrder.rfq_code}
                  {selectedOrder.lcl_batch_code
                    ? ` · ${selectedOrder.lcl_batch_code}`
                    : ''}
                </span>
                <h2 className="font-extrabold text-base truncate">
                  {selectedOrder.product_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ice rounded-xl p-4 border border-[#DCE6F5]">
                <div>
                  <div className="text-xs text-slate-600">
                    {portal.orders.modal.serviceRoute}
                  </div>
                  <div className="font-bold text-ink">
                    {dict.domain.serviceLabels[selectedOrder.service_type]}
                  </div>
                  <div className="text-xs text-slate-700">
                    {dict.domain.originLabels[selectedOrder.origin_country]} ·{' '}
                    {dict.domain.methodLabels[selectedOrder.shipping_method]} ·{' '}
                    {dict.domain.categoryLabels[selectedOrder.cargo_category]}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">
                    {portal.orders.modal.destination}
                  </div>
                  <div className="font-bold text-ink">
                    {formatDestinationLabel(selectedOrder.destination_city, locale)}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-600">
                    {portal.orders.modal.qtySpec}
                  </div>
                  <div className="font-mono text-xs text-ink mt-0.5">
                    Qty: {selectedOrder.quantity ?? 1} ·{' '}
                    {selectedOrder.estimated_goods_value
                      ? `${selectedOrder.estimated_goods_value} ${selectedOrder.currency}`
                      : '-'}{' '}
                    · {selectedOrder.estimated_weight_kg ?? '-'} kg ·{' '}
                    {selectedOrder.estimated_cbm ?? '-'} CBM
                  </div>
                </div>
              </div>

              {selectedOrder.product_url && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1">
                    {portal.orders.modal.supplierLink}
                  </div>
                  <a
                    href={selectedOrder.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline break-all"
                  >
                    {selectedOrder.product_url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              )}

              {selectedOrder.product_photo_url && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1.5">
                    {portal.orders.modal.photoLabel}
                  </div>
                  <img
                    src={selectedOrder.product_photo_url}
                    alt={selectedOrder.product_name}
                    width={400}
                    height={240}
                    className="max-h-48 w-auto rounded-xl border border-[#DCE6F5] object-contain"
                  />
                </div>
              )}

              {selectedOrder.customer_notes && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-800">
                  <strong className="block mb-0.5">
                    {portal.orders.modal.yourNotes}:
                  </strong>
                  {selectedOrder.customer_notes}
                </div>
              )}

              {/* Admin Quote Box */}
              {selectedOrder.quoted_total_idr ? (
                <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-900">
                    {portal.orders.modal.adminQuoteBox}
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-800">
                    {formatIdr(selectedOrder.quoted_total_idr)}
                  </div>
                  {selectedOrder.admin_notes && (
                    <div className="text-xs text-emerald-950 pt-1 border-t border-emerald-200">
                      <strong className="block">
                        {portal.orders.modal.adminNotesLabel}:
                      </strong>
                      {selectedOrder.admin_notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-950 space-y-1">
                  <p>{portal.orders.modal.waitingQuoteHint}</p>
                  {selectedOrder.admin_notes && (
                    <p className="pt-1 border-t border-amber-200 font-semibold">
                      {portal.orders.modal.adminNotesLabel}:{' '}
                      {selectedOrder.admin_notes}
                    </p>
                  )}
                </div>
              )}

              {feedback && (
                <div
                  role="status"
                  className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                    feedback.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  {feedback.msg}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6EEF9]">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={buildOrderWaUrl(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-4 text-xs transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {portal.orders.modal.chatWaBtn}
                  </a>

                  {selectedOrder.shipment_tracking_number && (
                    <Link
                      href={`/dashboard/shipments?q=${encodeURIComponent(
                        selectedOrder.shipment_tracking_number
                      )}`}
                      className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full bg-brand hover:bg-brand-dark text-white font-bold px-4 text-xs transition-colors"
                    >
                      <Package className="h-4 w-4" aria-hidden="true" />
                      {portal.orders.modal.trackShipmentBtn} (
                      {selectedOrder.shipment_tracking_number})
                    </Link>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {['baru', 'diproses', 'penawaran_dikirim'].includes(
                    selectedOrder.status
                  ) && (
                    <button
                      type="button"
                      disabled={acting !== null}
                      onClick={() => handleOrderAction('cancel')}
                      className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-800 font-bold px-4 text-xs transition-colors"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      {acting === 'cancel'
                        ? portal.orders.modal.cancellingBtn
                        : portal.orders.modal.cancelOrderBtn}
                    </button>
                  )}

                  {selectedOrder.status === 'penawaran_dikirim' && (
                    <button
                      type="button"
                      disabled={acting !== null}
                      onClick={() => handleOrderAction('approve_quote')}
                      className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-extrabold px-5 text-xs shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {acting === 'approve_quote'
                        ? portal.orders.modal.approvingBtn
                        : portal.orders.modal.approveQuoteBtn}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MemberShell>
  );
}
