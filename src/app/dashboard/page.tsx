import { redirect } from 'next/navigation';
import DashboardOverviewClient from '@/components/dashboard/DashboardOverviewClient';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RfqOrder, Shipment, TrackingEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    redirect('/login?next=/dashboard');
  }

  const supabase = getSupabaseAdmin();
  const [ordersRes, shipmentsRes] = await Promise.all([
    supabase
      .from('imp_rfq_orders')
      .select('*')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('imp_shipments')
      .select('*')
      .eq('customer_id', profile.id)
      .order('updated_at', { ascending: false }),
  ]);

  const orders = (ordersRes.data as RfqOrder[] | null) ?? [];
  const shipments = (shipmentsRes.data as Shipment[] | null) ?? [];

  const shipmentIds = shipments.map((s) => s.id);
  const latestEventByShipment = new Map<string, TrackingEvent>();

  if (shipmentIds.length > 0) {
    const { data: eventsData } = await supabase
      .from('imp_tracking_events')
      .select('*')
      .in('shipment_id', shipmentIds)
      .order('event_time', { ascending: false });

    for (const ev of (eventsData as TrackingEvent[] | null) ?? []) {
      if (!latestEventByShipment.has(ev.shipment_id)) {
        latestEventByShipment.set(ev.shipment_id, ev);
      }
    }
  }

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(
      (o) => o.status === 'baru' || o.status === 'diproses'
    ).length,
    quotedOrders: orders.filter((o) => o.status === 'penawaran_dikirim').length,
    activeShipments: shipments.filter((s) => s.current_status !== 'delivered')
      .length,
    totalInvoiceIdr: shipments
      .filter((s) => s.payment_status !== 'lunas')
      .reduce((sum, s) => sum + (Number(s.invoice_amount_idr) || 0), 0),
  };

  const latestShipments = shipments.slice(0, 5).map((s) => ({
    ...s,
    latest_event: latestEventByShipment.get(s.id) || null,
  }));

  return (
    <DashboardOverviewClient
      profile={profile}
      stats={stats}
      latestOrders={orders.slice(0, 5)}
      latestShipments={latestShipments}
    />
  );
}
