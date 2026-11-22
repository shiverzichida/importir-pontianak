import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = (req.nextUrl.searchParams.get('status') || '').trim();
    const search = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_customers')
      .select(
        'id, member_code, marking_code_base, email, full_name, whatsapp, company_name, default_destination_city, address_detail, is_active, admin_notes, last_login_at, created_at, updated_at'
      )
      .order('created_at', { ascending: false });

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const [custRes, ordersRes, shipmentsRes] = await Promise.all([
      query,
      supabase
        .from('imp_rfq_orders')
        .select('customer_id')
        .not('customer_id', 'is', null),
      supabase
        .from('imp_shipments')
        .select('customer_id')
        .not('customer_id', 'is', null),
    ]);

    if (custRes.error) {
      return NextResponse.json({ error: custRes.error.message }, { status: 500 });
    }

    const orderCountMap = new Map<string, number>();
    for (const o of ordersRes.data ?? []) {
      const cid = String(o.customer_id);
      orderCountMap.set(cid, (orderCountMap.get(cid) || 0) + 1);
    }

    const shipmentCountMap = new Map<string, number>();
    for (const s of shipmentsRes.data ?? []) {
      const cid = String(s.customer_id);
      shipmentCountMap.set(cid, (shipmentCountMap.get(cid) || 0) + 1);
    }

    let customers = (custRes.data ?? []).map((c) => ({
      ...c,
      orders_count: orderCountMap.get(String(c.id)) || 0,
      shipments_count: shipmentCountMap.get(String(c.id)) || 0,
    }));

    if (search) {
      customers = customers.filter(
        (c) =>
          String(c.member_code || '').toLowerCase().includes(search) ||
          String(c.marking_code_base || '').toLowerCase().includes(search) ||
          String(c.full_name || '').toLowerCase().includes(search) ||
          String(c.email || '').toLowerCase().includes(search) ||
          String(c.whatsapp || '').toLowerCase().includes(search) ||
          String(c.company_name || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ customers });
  } catch (err) {
    console.error('Admin customers GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar member.' },
      { status: 500 }
    );
  }
}
