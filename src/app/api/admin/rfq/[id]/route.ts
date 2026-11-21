import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RfqStatus } from '@/lib/types';

const VALID_RFQ_STATUSES: RfqStatus[] = [
  'baru',
  'diproses',
  'penawaran_dikirim',
  'disetujui',
  'dibatalkan',
];

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

    if (body.status !== undefined) {
      const status = String(body.status) as RfqStatus;
      if (!VALID_RFQ_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Status RFQ tidak valid.' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (body.quoted_total_idr !== undefined) {
      updates.quoted_total_idr =
        body.quoted_total_idr === null || body.quoted_total_idr === ''
          ? null
          : Math.round(Number(body.quoted_total_idr));
    }

    if (body.admin_notes !== undefined) {
      updates.admin_notes =
        body.admin_notes === null ? null : String(body.admin_notes).trim();
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_rfq_orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'RFQ tidak ditemukan.' },
        { status: error ? 500 : 404 }
      );
    }

    return NextResponse.json({ order: data });
  } catch (err) {
    console.error('Admin RFQ PATCH error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui RFQ.' },
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
    const { error } = await supabase.from('imp_rfq_orders').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin RFQ DELETE error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus RFQ.' },
      { status: 500 }
    );
  }
}
