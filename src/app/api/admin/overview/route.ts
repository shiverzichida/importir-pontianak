import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const [
      totalRfqRes,
      newRfqRes,
      activeShipmentsRes,
      completedShipmentsRes,
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

    return NextResponse.json({
      stats: {
        totalRfq: totalRfqRes.count ?? 0,
        pendingRfq: newRfqRes.count ?? 0,
        activeShipments: activeShipmentsRes.count ?? 0,
        arrivedOrDelivered: completedShipmentsRes.count ?? 0,
      },
      latestRfqs: latestRfqsRes.data ?? [],
      latestShipments: latestShipmentsRes.data ?? [],
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat ringkasan admin.' },
      { status: 500 }
    );
  }
}
