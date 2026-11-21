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
    const status = req.nextUrl.searchParams.get('status') || '';
    const serviceType = req.nextUrl.searchParams.get('service_type') || '';
    const search = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_rfq_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (serviceType && serviceType !== 'all') {
      query = query.eq('service_type', serviceType);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let orders = data ?? [];
    if (search) {
      orders = orders.filter(
        (o) =>
          String(o.rfq_code || '').toLowerCase().includes(search) ||
          String(o.customer_name || '').toLowerCase().includes(search) ||
          String(o.product_name || '').toLowerCase().includes(search) ||
          String(o.company_name || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Admin RFQ GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar RFQ.' },
      { status: 500 }
    );
  }
}
