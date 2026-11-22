import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type {
  LclBatchStatus,
  OriginCountry,
  ShippingMethod,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_ORIGINS: OriginCountry[] = ['china', 'malaysia', 'singapura'];
const VALID_METHODS: ShippingMethod[] = ['laut', 'darat', 'udara'];
const VALID_STATUSES: LclBatchStatus[] = [
  'open',
  'almost_full',
  'closed',
  'sailing',
  'arrived',
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

    if (typeof body.title === 'string') {
      const title = body.title.trim();
      if (title.length < 4) {
        return NextResponse.json(
          { error: 'Judul kloter minimal 4 karakter.' },
          { status: 400 }
        );
      }
      updates.title = title;
    }

    if (typeof body.batch_code === 'string') {
      const code = body.batch_code
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '');
      if (!code) {
        return NextResponse.json(
          { error: 'Kode kloter tidak valid.' },
          { status: 400 }
        );
      }
      updates.batch_code = code;
    }

    if (body.origin_country !== undefined) {
      const origin = String(body.origin_country) as OriginCountry;
      if (!VALID_ORIGINS.includes(origin)) {
        return NextResponse.json(
          { error: 'Negara asal tidak valid.' },
          { status: 400 }
        );
      }
      updates.origin_country = origin;
    }

    if (body.shipping_method !== undefined) {
      const method = String(body.shipping_method) as ShippingMethod;
      if (!VALID_METHODS.includes(method)) {
        return NextResponse.json(
          { error: 'Jalur pengiriman tidak valid.' },
          { status: 400 }
        );
      }
      updates.shipping_method = method;
    }

    if (body.status !== undefined) {
      const status = String(body.status) as LclBatchStatus;
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Status kloter tidak valid.' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    for (const f of ['origin_warehouse', 'container_size'] as const) {
      if (typeof body[f] === 'string' && body[f].trim()) {
        updates[f] = body[f].trim();
      }
    }

    if (body.cutoff_date !== undefined) {
      const d = String(body.cutoff_date || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        return NextResponse.json(
          { error: 'Format cutoff_date harus YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      updates.cutoff_date = d;
    }

    for (const df of ['etd_date', 'eta_date'] as const) {
      if (body[df] !== undefined) {
        const d = String(body[df] || '').trim();
        updates[df] = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
      }
    }

    if (body.notes !== undefined) {
      updates.notes = String(body.notes || '').trim() || null;
    }

    if (body.capacity_cbm !== undefined) {
      const n = Number(body.capacity_cbm);
      if (!Number.isFinite(n) || n <= 0) {
        return NextResponse.json(
          { error: 'Kapasitas CBM harus lebih dari 0.' },
          { status: 400 }
        );
      }
      updates.capacity_cbm = Number(n.toFixed(2));
    }

    if (body.filled_cbm !== undefined) {
      const n = Number(body.filled_cbm);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json(
          { error: 'Terisi CBM tidak boleh negatif.' },
          { status: 400 }
        );
      }
      updates.filled_cbm = Number(n.toFixed(2));
    }

    if (body.min_slot_cbm !== undefined) {
      const n = Number(body.min_slot_cbm);
      if (Number.isFinite(n) && n > 0) {
        updates.min_slot_cbm = Number(n.toFixed(2));
      }
    }

    if (body.sort_order !== undefined) {
      updates.sort_order = Math.round(Number(body.sort_order) || 0);
    }

    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_lcl_batches')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Gagal memperbarui jadwal kloter LCL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ batch: data });
  } catch (err) {
    console.error('Admin LCL batch PATCH error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat update kloter LCL.' },
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
    const { error } = await supabase
      .from('imp_lcl_batches')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('Admin LCL batch DELETE error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus jadwal kloter LCL.' },
      { status: 500 }
    );
  }
}
