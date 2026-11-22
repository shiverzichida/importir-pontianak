import { NextRequest, NextResponse } from 'next/server';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RfqOrder } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const profile = await getActiveCustomerProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as { action?: string };
    const action = String(body.action || '').trim();

    if (action !== 'approve_quote' && action !== 'cancel') {
      return NextResponse.json(
        { error: 'Aksi tidak valid.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: existingData, error: findErr } = await supabase
      .from('imp_rfq_orders')
      .select('*')
      .eq('id', id)
      .eq('customer_id', profile.id)
      .maybeSingle();

    if (findErr || !existingData) {
      return NextResponse.json(
        { error: 'Order tidak ditemukan.' },
        { status: 404 }
      );
    }

    const existing = existingData as RfqOrder;

    if (action === 'approve_quote') {
      if (existing.status !== 'penawaran_dikirim') {
        return NextResponse.json(
          {
            error:
              'Penawaran hanya dapat disetujui apabila status order adalah Penawaran Dikirim.',
          },
          { status: 400 }
        );
      }
    }

    if (action === 'cancel') {
      if (
        !['baru', 'diproses', 'penawaran_dikirim'].includes(existing.status)
      ) {
        return NextResponse.json(
          {
            error:
              'Order yang sudah disetujui atau dibatalkan tidak dapat dibatalkan ulang.',
          },
          { status: 400 }
        );
      }
    }

    const nextStatus = action === 'approve_quote' ? 'disetujui' : 'dibatalkan';
    const { data: updated, error: updateErr } = await supabase
      .from('imp_rfq_orders')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('customer_id', profile.id)
      .select('*')
      .single();

    if (updateErr || !updated) {
      return NextResponse.json(
        { error: updateErr?.message || 'Gagal memperbarui order.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error('Customer order PATCH error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui order.' },
      { status: 500 }
    );
  }
}
