import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { generateMarkingCode, generateTrackingNumber } from '@/lib/server-codes';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { RfqOrder, ShippingMethod } from '@/lib/types';

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
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const supabase = getSupabaseAdmin();
    const { data: rfqData, error: rfqErr } = await supabase
      .from('imp_rfq_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (rfqErr || !rfqData) {
      return NextResponse.json(
        { error: 'RFQ tidak ditemukan.' },
        { status: 404 }
      );
    }

    const rfq = rfqData as RfqOrder;

    // Check if shipment already exists for this RFQ
    const { data: existingShipment } = await supabase
      .from('imp_shipments')
      .select('*')
      .eq('rfq_id', rfq.id)
      .maybeSingle();

    if (existingShipment) {
      return NextResponse.json(
        {
          error: `RFQ ini sudah dikonversi ke resi ${existingShipment.tracking_number}.`,
          shipment: existingShipment,
        },
        { status: 409 }
      );
    }

    const shippingMethod: ShippingMethod =
      body.shipping_method &&
      ['udara', 'laut', 'darat'].includes(String(body.shipping_method))
        ? (String(body.shipping_method) as ShippingMethod)
        : rfq.shipping_method === 'transfer_only'
          ? 'udara'
          : (rfq.shipping_method as ShippingMethod);

    const trackingNumber = generateTrackingNumber();
    const markingCode = generateMarkingCode(
      rfq.origin_country,
      rfq.company_name || rfq.customer_name
    );

    const { data: shipment, error: shipErr } = await supabase
      .from('imp_shipments')
      .insert({
        tracking_number: trackingNumber,
        marking_code: markingCode,
        supplier_tracking_no: body.supplier_tracking_no
          ? String(body.supplier_tracking_no).trim()
          : null,
        rfq_id: rfq.id,
        customer_name: rfq.company_name
          ? `${rfq.company_name} (${rfq.customer_name})`
          : rfq.customer_name,
        customer_whatsapp: rfq.customer_whatsapp,
        origin_country: rfq.origin_country,
        shipping_method: shippingMethod,
        cargo_category: rfq.cargo_category,
        destination_city: rfq.destination_city,
        item_summary: rfq.product_name,
        actual_weight_kg: rfq.estimated_weight_kg,
        actual_cbm: rfq.estimated_cbm,
        colli_count: 1,
        invoice_amount_idr: rfq.quoted_total_idr ?? rfq.estimated_total_idr,
        payment_status: 'belum_bayar',
        current_status: 'order_confirmed',
      })
      .select('*')
      .single();

    if (shipErr || !shipment) {
      return NextResponse.json(
        { error: shipErr?.message || 'Gagal membuat resi pengiriman.' },
        { status: 500 }
      );
    }

    await supabase.from('imp_tracking_events').insert({
      shipment_id: shipment.id,
      status: 'order_confirmed',
      title: 'Order & Marking Code Diterbitkan',
      location: 'Pontianak, Kalbar',
      description: `Dikonversi dari ${rfq.rfq_code}. Marking code gudang asal: ${markingCode}.`,
    });

    await supabase
      .from('imp_rfq_orders')
      .update({
        status: 'disetujui',
        updated_at: new Date().toISOString(),
      })
      .eq('id', rfq.id);

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (err) {
    console.error('Convert RFQ error:', err);
    return NextResponse.json(
      { error: 'Gagal mengonversi RFQ ke pengiriman.' },
      { status: 500 }
    );
  }
}
