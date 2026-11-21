import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { normalizeWaPhone } from '@/lib/format';
import { generateMarkingCode, generateTrackingNumber } from '@/lib/server-codes';
import { getSupabaseAdmin } from '@/lib/supabase';
import type {
  CargoCategory,
  OriginCountry,
  PaymentStatus,
  ShippingMethod,
  TrackingEvent,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const statusFilter = req.nextUrl.searchParams.get('status') || '';
    const search = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_shipments')
      .select('*')
      .order('updated_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('current_status', statusFilter);
    }

    const { data: shipments, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: allEvents } = await supabase
      .from('imp_tracking_events')
      .select('*')
      .order('event_time', { ascending: false });

    const eventsByShipment = new Map<string, TrackingEvent[]>();
    for (const ev of (allEvents as TrackingEvent[] | null) ?? []) {
      const list = eventsByShipment.get(ev.shipment_id) || [];
      list.push(ev);
      eventsByShipment.set(ev.shipment_id, list);
    }

    let list = (shipments ?? []).map((s) => ({
      ...s,
      events: eventsByShipment.get(s.id as string) || [],
    }));

    if (search) {
      list = list.filter(
        (s) =>
          String(s.tracking_number || '').toLowerCase().includes(search) ||
          String(s.marking_code || '').toLowerCase().includes(search) ||
          String(s.supplier_tracking_no || '').toLowerCase().includes(search) ||
          String(s.customer_name || '').toLowerCase().includes(search) ||
          String(s.item_summary || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ shipments: list });
  } catch (err) {
    console.error('Admin shipments GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar pengiriman.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const customerName = String(body.customer_name || '').trim();
    const customerWhatsapp = normalizeWaPhone(
      String(body.customer_whatsapp || '').trim()
    );
    const originCountry = String(
      body.origin_country || 'china'
    ) as OriginCountry;
    const shippingMethod = String(
      body.shipping_method || 'laut'
    ) as ShippingMethod;
    const cargoCategory = String(
      body.cargo_category || 'general'
    ) as CargoCategory;
    const destinationCity = String(
      body.destination_city || 'Pontianak (Ambil di Gudang)'
    ).trim();
    const itemSummary = String(body.item_summary || '').trim();

    if (!customerName || !customerWhatsapp || !itemSummary) {
      return NextResponse.json(
        { error: 'Nama customer, WhatsApp, dan ringkasan barang wajib diisi.' },
        { status: 400 }
      );
    }

    const trackingNumber =
      String(body.tracking_number || '').trim() || generateTrackingNumber();
    const markingCode =
      String(body.marking_code || '').trim() ||
      generateMarkingCode(originCountry, customerName);

    const numOrNull = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };

    const supabase = getSupabaseAdmin();
    const { data: shipment, error } = await supabase
      .from('imp_shipments')
      .insert({
        tracking_number: trackingNumber,
        marking_code: markingCode,
        supplier_tracking_no: body.supplier_tracking_no
          ? String(body.supplier_tracking_no).trim()
          : null,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        origin_country: originCountry,
        shipping_method: shippingMethod,
        cargo_category: cargoCategory,
        destination_city: destinationCity,
        item_summary: itemSummary,
        actual_weight_kg: numOrNull(body.actual_weight_kg),
        actual_cbm: numOrNull(body.actual_cbm),
        colli_count: Math.max(1, Math.round(Number(body.colli_count || 1))),
        invoice_amount_idr: numOrNull(body.invoice_amount_idr)
          ? Math.round(Number(body.invoice_amount_idr))
          : null,
        payment_status: (String(body.payment_status || 'belum_bayar') as PaymentStatus),
        current_status: 'order_confirmed',
        estimated_arrival: body.estimated_arrival
          ? String(body.estimated_arrival)
          : null,
      })
      .select('*')
      .single();

    if (error || !shipment) {
      return NextResponse.json(
        { error: error?.message || 'Gagal membuat pengiriman baru.' },
        { status: 500 }
      );
    }

    await supabase.from('imp_tracking_events').insert({
      shipment_id: shipment.id,
      status: 'order_confirmed',
      title: 'Order & Marking Code Diterbitkan',
      location: 'Pontianak, Kalbar',
      description: `Pengiriman terdaftar dengan Marking Code ${markingCode}.`,
    });

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (err) {
    console.error('Admin shipments POST error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat pengiriman.' },
      { status: 500 }
    );
  }
}
