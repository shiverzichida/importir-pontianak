import { NextRequest, NextResponse } from 'next/server';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RfqOrder } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const statusFilter = (req.nextUrl.searchParams.get('status') || '').trim();
    const search = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_rfq_orders')
      .select('*')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: linkedShipments } = await supabase
      .from('imp_shipments')
      .select('rfq_id, tracking_number')
      .eq('customer_id', profile.id)
      .not('rfq_id', 'is', null);

    const trackingByRfq = new Map<string, string>();
    for (const s of linkedShipments ?? []) {
      if (s.rfq_id && s.tracking_number) {
        trackingByRfq.set(String(s.rfq_id), String(s.tracking_number));
      }
    }

    let orders = ((data as RfqOrder[] | null) ?? []).map((o) => ({
      ...o,
      shipment_tracking_number: trackingByRfq.get(o.id) || null,
    }));

    if (search) {
      orders = orders.filter(
        (o) =>
          String(o.rfq_code || '').toLowerCase().includes(search) ||
          String(o.product_name || '').toLowerCase().includes(search) ||
          String(o.lcl_batch_code || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Customer orders GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar order Anda.' },
      { status: 500 }
    );
  }
}
