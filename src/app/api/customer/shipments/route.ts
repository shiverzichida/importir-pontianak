import { NextRequest, NextResponse } from 'next/server';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Shipment, TrackingEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const search = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
    const supabase = getSupabaseAdmin();

    const { data: shipmentsData, error } = await supabase
      .from('imp_shipments')
      .select('*')
      .eq('customer_id', profile.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const shipments = (shipmentsData as Shipment[] | null) ?? [];
    const shipmentIds = shipments.map((s) => s.id);
    const eventsByShipment = new Map<string, TrackingEvent[]>();

    if (shipmentIds.length > 0) {
      const { data: eventsData } = await supabase
        .from('imp_tracking_events')
        .select('*')
        .in('shipment_id', shipmentIds)
        .order('event_time', { ascending: false });

      for (const ev of (eventsData as TrackingEvent[] | null) ?? []) {
        const list = eventsByShipment.get(ev.shipment_id) || [];
        list.push(ev);
        eventsByShipment.set(ev.shipment_id, list);
      }
    }

    let result = shipments.map((s) => ({
      ...s,
      events: eventsByShipment.get(s.id) || [],
    }));

    if (search) {
      result = result.filter(
        (s) =>
          String(s.tracking_number || '').toLowerCase().includes(search) ||
          String(s.marking_code || '').toLowerCase().includes(search) ||
          String(s.supplier_tracking_no || '').toLowerCase().includes(search) ||
          String(s.item_summary || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ shipments: result });
  } catch (err) {
    console.error('Customer shipments GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat data pengiriman Anda.' },
      { status: 500 }
    );
  }
}
