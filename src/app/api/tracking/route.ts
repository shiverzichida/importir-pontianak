import { NextRequest, NextResponse } from 'next/server';
import { maskCustomerName } from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { PublicShipment, Shipment, TrackingEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rawQuery = req.nextUrl.searchParams.get('q') || '';
    const query = rawQuery.trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Masukkan nomor resi, marking code, atau resi supplier minimal 3 karakter.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Sequential safe lookups across tracking_number, marking_code, and supplier_tracking_no
    let shipment: Shipment | null = null;
    for (const column of [
      'tracking_number',
      'marking_code',
      'supplier_tracking_no',
    ] as const) {
      const { data, error } = await supabase
        .from('imp_shipments')
        .select('*')
        .ilike(column, query)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`Tracking lookup error on ${column}:`, error);
        continue;
      }
      if (data) {
        shipment = data as Shipment;
        break;
      }
    }

    if (!shipment) {
      return NextResponse.json(
        {
          error: `Resi atau Marking Code "${query}" tidak ditemukan. Periksa kembali kode Anda atau hubungi admin WhatsApp.`,
        },
        { status: 404 }
      );
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from('imp_tracking_events')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('event_time', { ascending: false });

    if (eventsError) {
      console.error('Tracking events fetch error:', eventsError);
      return NextResponse.json(
        { error: 'Gagal memuat riwayat tracking.' },
        { status: 500 }
      );
    }

    const publicShipment: PublicShipment = {
      id: shipment.id,
      tracking_number: shipment.tracking_number,
      marking_code: shipment.marking_code,
      supplier_tracking_no: shipment.supplier_tracking_no,
      customer_name: maskCustomerName(shipment.customer_name),
      origin_country: shipment.origin_country,
      shipping_method: shipment.shipping_method,
      cargo_category: shipment.cargo_category,
      destination_city: shipment.destination_city,
      item_summary: shipment.item_summary,
      actual_weight_kg: shipment.actual_weight_kg,
      actual_cbm: shipment.actual_cbm,
      colli_count: shipment.colli_count,
      invoice_amount_idr: shipment.invoice_amount_idr,
      payment_status: shipment.payment_status,
      current_status: shipment.current_status,
      estimated_arrival: shipment.estimated_arrival,
      created_at: shipment.created_at,
      updated_at: shipment.updated_at,
    };

    return NextResponse.json({
      shipment: publicShipment,
      events: (eventsData as TrackingEvent[] | null) ?? [],
    });
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa status pengiriman.' },
      { status: 500 }
    );
  }
}
