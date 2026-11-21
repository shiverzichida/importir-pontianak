import { NextRequest, NextResponse } from 'next/server';
import {
  buildWhatsAppUrl,
  CATEGORY_LABELS,
  formatIdr,
  METHOD_LABELS,
  normalizeWaPhone,
  ORIGIN_LABELS,
  SERVICE_LABELS,
} from '@/lib/format';
import { generateRfqCode } from '@/lib/server-codes';
import { DEFAULT_PUBLIC_SETTINGS, mapSettingsRows } from '@/lib/public-data';
import { getSupabaseAdmin } from '@/lib/supabase';
import type {
  CargoCategory,
  CurrencyCode,
  ImpSettingRow,
  OriginCountry,
  RfqOrder,
  RfqShippingMethod,
  ServiceType,
} from '@/lib/types';

const VALID_SERVICES: ServiceType[] = ['titip_beli', 'forwarder', 'transfer_valas'];
const VALID_ORIGINS: OriginCountry[] = ['china', 'malaysia', 'singapura'];
const VALID_METHODS: RfqShippingMethod[] = [
  'udara',
  'laut',
  'darat',
  'transfer_only',
];
const VALID_CATEGORIES: CargoCategory[] = [
  'general',
  'fashion',
  'elektronik',
  'khusus',
];
const VALID_CURRENCIES: CurrencyCode[] = ['RMB', 'MYR', 'SGD', 'IDR'];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const serviceType = String(body.service_type || '') as ServiceType;
    const customerName = String(body.customer_name || '').trim();
    const customerWhatsappRaw = String(body.customer_whatsapp || '').trim();
    const customerWhatsapp = normalizeWaPhone(customerWhatsappRaw);
    const companyName = String(body.company_name || '').trim() || null;
    const destinationCity = String(body.destination_city || '').trim();
    const originCountry = String(body.origin_country || '') as OriginCountry;
    const shippingMethod = String(
      body.shipping_method || (serviceType === 'transfer_valas' ? 'transfer_only' : 'laut')
    ) as RfqShippingMethod;
    const cargoCategory = String(
      body.cargo_category || 'general'
    ) as CargoCategory;
    const productUrl = String(body.product_url || '').trim() || null;
    const productName = String(body.product_name || '').trim();
    const productPhotoUrl = String(body.product_photo_url || '').trim() || null;
    const currency = String(body.currency || 'RMB') as CurrencyCode;
    const customerNotes = String(body.customer_notes || '').trim() || null;

    if (!VALID_SERVICES.includes(serviceType)) {
      return NextResponse.json(
        { error: 'Jenis layanan tidak valid.' },
        { status: 400 }
      );
    }
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }
    if (!customerWhatsapp || customerWhatsapp.length < 9) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp aktif wajib diisi dengan benar.' },
        { status: 400 }
      );
    }
    if (!destinationCity) {
      return NextResponse.json(
        { error: 'Kota tujuan di Kalimantan Barat wajib dipilih.' },
        { status: 400 }
      );
    }
    if (!VALID_ORIGINS.includes(originCountry)) {
      return NextResponse.json(
        { error: 'Negara asal pengiriman tidak valid.' },
        { status: 400 }
      );
    }
    if (!VALID_METHODS.includes(shippingMethod)) {
      return NextResponse.json(
        { error: 'Jalur pengiriman tidak valid.' },
        { status: 400 }
      );
    }
    if (!VALID_CATEGORIES.includes(cargoCategory)) {
      return NextResponse.json(
        { error: 'Kategori barang tidak valid.' },
        { status: 400 }
      );
    }
    if (!productName) {
      return NextResponse.json(
        { error: 'Nama barang / deskripsi order wajib diisi.' },
        { status: 400 }
      );
    }

    const numOrNull = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };

    const estimatedGoodsValue = numOrNull(body.estimated_goods_value);
    const quantity = numOrNull(body.quantity)
      ? Math.max(1, Math.round(Number(body.quantity)))
      : 1;
    const estimatedWeightKg = numOrNull(body.estimated_weight_kg);
    const estimatedCbm = numOrNull(body.estimated_cbm);
    const estimatedTotalIdr = numOrNull(body.estimated_total_idr)
      ? Math.round(Number(body.estimated_total_idr))
      : null;

    const safeCurrency: CurrencyCode = VALID_CURRENCIES.includes(currency)
      ? currency
      : 'RMB';

    const supabase = getSupabaseAdmin();
    const rfqCode = generateRfqCode();

    const { data: inserted, error } = await supabase
      .from('imp_rfq_orders')
      .insert({
        rfq_code: rfqCode,
        service_type: serviceType,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        company_name: companyName,
        destination_city: destinationCity,
        origin_country: originCountry,
        shipping_method: shippingMethod,
        cargo_category: cargoCategory,
        product_url: productUrl,
        product_name: productName,
        product_photo_url: productPhotoUrl,
        currency: safeCurrency,
        estimated_goods_value: estimatedGoodsValue,
        quantity,
        estimated_weight_kg: estimatedWeightKg,
        estimated_cbm: estimatedCbm,
        estimated_total_idr: estimatedTotalIdr,
        customer_notes: customerNotes,
        status: 'baru',
      })
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('Insert RFQ failed:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan pengajuan RFQ. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    const { data: settingsRows } = await supabase
      .from('imp_settings')
      .select('key, value, label, updated_at');
    const settings = settingsRows
      ? mapSettingsRows(settingsRows as ImpSettingRow[])
      : DEFAULT_PUBLIC_SETTINGS;

    const order = inserted as RfqOrder;

    const lines = [
      `Halo Admin ${settings.company_name}, saya mengajukan permintaan penawaran (RFQ):`,
      '',
      `*Kode RFQ:* ${order.rfq_code}`,
      `*Layanan:* ${SERVICE_LABELS[order.service_type]}`,
      `*Nama:* ${order.customer_name}${order.company_name ? ` (${order.company_name})` : ''}`,
      `*Asal & Jalur:* ${ORIGIN_LABELS[order.origin_country]} — ${METHOD_LABELS[order.shipping_method]}`,
      `*Kategori:* ${CATEGORY_LABELS[order.cargo_category]}`,
      `*Produk:* ${order.product_name} (Qty: ${order.quantity ?? 1})`,
    ];

    if (order.product_url) {
      lines.push(`*Link Produk:* ${order.product_url}`);
    }
    if (order.estimated_goods_value) {
      lines.push(
        `*Nilai Barang:* ${order.estimated_goods_value} ${order.currency}`
      );
    }
    if (order.estimated_weight_kg) {
      lines.push(`*Estimasi Berat:* ${order.estimated_weight_kg} kg`);
    }
    if (order.estimated_cbm) {
      lines.push(`*Estimasi Volume:* ${order.estimated_cbm} CBM`);
    }
    if (order.estimated_total_idr) {
      lines.push(
        `*Estimasi Kalkulator:* ${formatIdr(order.estimated_total_idr)}`
      );
    }
    lines.push(`*Tujuan:* ${order.destination_city}`);
    if (order.customer_notes) {
      lines.push(`*Catatan:* ${order.customer_notes}`);
    }
    lines.push('', 'Mohon bantuannya untuk penawaran resmi & estimasi HPP-nya. Terima kasih!');

    const whatsappUrl = buildWhatsAppUrl(
      settings.whatsapp_admin,
      lines.join('\n')
    );

    return NextResponse.json(
      { order, whatsapp_url: whatsappUrl },
      { status: 201 }
    );
  } catch (err) {
    console.error('RFQ endpoint error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses pengajuan RFQ.' },
      { status: 500 }
    );
  }
}
