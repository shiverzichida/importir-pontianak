import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown>;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const numOrNull = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };

    if (body.supplier_tracking_no !== undefined) {
      updates.supplier_tracking_no = body.supplier_tracking_no
        ? String(body.supplier_tracking_no).trim()
        : null;
    }
    if (body.actual_weight_kg !== undefined) {
      updates.actual_weight_kg = numOrNull(body.actual_weight_kg);
    }
    if (body.actual_cbm !== undefined) {
      updates.actual_cbm = numOrNull(body.actual_cbm);
    }
    if (body.colli_count !== undefined) {
      updates.colli_count = Math.max(1, Math.round(Number(body.colli_count || 1)));
    }
    if (body.invoice_amount_idr !== undefined) {
      const inv = numOrNull(body.invoice_amount_idr);
      updates.invoice_amount_idr = inv !== null ? Math.round(inv) : null;
    }
    if (body.payment_status !== undefined) {
      updates.payment_status = String(body.payment_status);
    }
    if (body.current_status !== undefined) {
      updates.current_status = String(body.current_status);
    }
    if (body.estimated_arrival !== undefined) {
      updates.estimated_arrival = body.estimated_arrival
        ? String(body.estimated_arrival)
        : null;
    }
    if (body.destination_city !== undefined) {
      updates.destination_city = String(body.destination_city).trim();
    }
    if (body.item_summary !== undefined) {
      updates.item_summary = String(body.item_summary).trim();
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_shipments')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Pengiriman tidak ditemukan.' },
        { status: error ? 500 : 404 }
      );
    }

    return NextResponse.json({ shipment: data });
  } catch (err) {
    console.error('Admin shipment PATCH error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui data pengiriman.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('imp_shipments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin shipment DELETE error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus pengiriman.' },
      { status: 500 }
    );
  }
}
