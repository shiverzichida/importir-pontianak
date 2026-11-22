import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Package,
  Truck,
} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { getAdminSession } from '@/lib/auth';
import {
  formatDateWib,
  formatIdr,
  ORIGIN_LABELS,
  RFQ_STATUSES,
  SERVICE_LABELS,
  SHIPMENT_STATUS_META,
} from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RfqOrder, Shipment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const supabase = getSupabaseAdmin();
  const [
    totalRfqRes,
    pendingRfqRes,
    activeShipmentsRes,
    arrivedShipmentsRes,
    latestRfqsRes,
    latestShipmentsRes,
  ] = await Promise.all([
    supabase
      .from('imp_rfq_orders')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('imp_rfq_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['baru', 'diproses']),
    supabase
      .from('imp_shipments')
      .select('id', { count: 'exact', head: true })
      .neq('current_status', 'delivered'),
    supabase
      .from('imp_shipments')
      .select('id', { count: 'exact', head: true })
      .in('current_status', ['arrived_pontianak', 'out_for_delivery', 'delivered']),
    supabase
      .from('imp_rfq_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('imp_shipments')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  const latestRfqs = (latestRfqsRes.data as RfqOrder[] | null) ?? [];
  const latestShipments = (latestShipmentsRes.data as Shipment[] | null) ?? [];

  const kpis = [
    {
      label: 'Total RFQ / Order Masuk',
      value: totalRfqRes.count ?? 0,
      icon: FileSpreadsheet,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      label: 'Perlu Penawaran (Baru / Dicek)',
      value: pendingRfqRes.count ?? 0,
      icon: Clock,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      label: 'Pengiriman Aktif Berjalan',
      value: activeShipmentsRes.count ?? 0,
      icon: Truck,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Tiba Pontianak / Selesai',
      value: arrivedShipmentsRes.count ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <AdminShell user={session}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">
              Overview Operasional
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Ringkasan pengajuan RFQ dan pergerakan kargo menuju Kalimantan
              Barat.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/rfq"
              className="min-h-[44px] inline-flex items-center rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-navy font-bold px-4 text-xs transition-colors"
            >
              Kelola RFQ
            </Link>
            <Link
              href="/admin/katalog"
              className="min-h-[44px] inline-flex items-center rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-navy font-bold px-4 text-xs transition-colors"
            >
              Kelola Katalog
            </Link>
            <Link
              href="/admin/shipments"
              className="min-h-[44px] inline-flex items-center rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-4 text-xs transition-colors"
            >
              Update Pengiriman
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-xl bg-white border border-slate-300 p-5 flex items-center gap-4"
              >
                <div
                  className={`h-12 w-12 rounded-lg border flex items-center justify-center shrink-0 ${kpi.color}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-navy font-mono">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white border border-slate-300 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-navy text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-teal-dark" aria-hidden="true" />
                RFQ / Order Terbaru
              </h2>
              <Link
                href="/admin/rfq"
                className="text-xs font-bold text-teal-dark hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="divide-y divide-slate-200">
              {latestRfqs.length === 0 ? (
                <p className="p-5 text-sm text-slate-600">Belum ada RFQ.</p>
              ) : (
                latestRfqs.map((r) => {
                  const st = RFQ_STATUSES[r.status] || RFQ_STATUSES.baru;
                  return (
                    <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-xs font-bold text-teal-dark">
                            {r.rfq_code}
                          </div>
                          <div className="font-bold text-sm text-navy mt-0.5">
                            {r.product_name}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {r.customer_name} · {SERVICE_LABELS[r.service_type]} ·{' '}
                            {ORIGIN_LABELS[r.origin_country]}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-bold border shrink-0 ${st.badgeClass}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                        <span>{formatDateWib(r.created_at)}</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {r.quoted_total_idr
                            ? `Penawaran: ${formatIdr(r.quoted_total_idr)}`
                            : r.estimated_total_idr
                              ? `Est: ${formatIdr(r.estimated_total_idr)}`
                              : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-300 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-navy text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-teal-dark" aria-hidden="true" />
                Pengiriman & Tracking Terbaru
              </h2>
              <Link
                href="/admin/shipments"
                className="text-xs font-bold text-teal-dark hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="divide-y divide-slate-200">
              {latestShipments.length === 0 ? (
                <p className="p-5 text-sm text-slate-600">
                  Belum ada data pengiriman.
                </p>
              ) : (
                latestShipments.map((s) => {
                  const meta =
                    SHIPMENT_STATUS_META[s.current_status] ||
                    SHIPMENT_STATUS_META.order_confirmed;
                  return (
                    <div key={s.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-xs font-bold text-navy">
                            {s.tracking_number}{' '}
                            <span className="text-slate-600 font-normal">
                              ({s.marking_code})
                            </span>
                          </div>
                          <div className="font-semibold text-sm text-slate-900 mt-0.5">
                            {s.item_summary}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {s.customer_name} → {s.destination_city}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-bold border shrink-0 ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
