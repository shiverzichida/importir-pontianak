import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { SHIPMENT_STATUS_META } from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { ShipmentStatus } from '@/lib/types';

export async function POST(
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

    const status = String(body.status || '') as ShipmentStatus;
    if (!(status in SHIPMENT_STATUS_META)) {
      return NextResponse.json(
        { error: 'Tahapan status tracking tidak valid.' },
        { status: 400 }
      );
    }

    const title =
      String(body.title || '').trim() || SHIPMENT_STATUS_META[status].label;
    const location = String(body.location || '').trim();
    const description = String(body.description || '').trim() || null;
    const eventTime = body.event_time
      ? new Date(String(body.event_time)).toISOString()
      : new Date().toISOString();

    if (!location) {
      return NextResponse.json(
        { error: 'Lokasi kejadian wajib diisi.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: event, error: evErr } = await supabase
      .from('imp_tracking_events')
      .insert({
        shipment_id: id,
        status,
        title,
        location,
        description,
        event_time: eventTime,
      })
      .select('*')
      .single();

    if (evErr || !event) {
      return NextResponse.json(
        { error: evErr?.message || 'Gagal menambah log tracking.' },
        { status: 500 }
      );
    }

    const { data: updatedShipment, error: upErr } = await supabase
      .from('imp_shipments')
      .update({
        current_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json(
      { event, shipment: updatedShipment },
      { status: 201 }
    );
  } catch (err) {
    console.error('Add tracking event error:', err);
    return NextResponse.json(
      { error: 'Gagal menambahkan pembaruan tracking.' },
      { status: 500 }
    );
  }
}
