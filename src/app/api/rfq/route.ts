import { NextRequest, NextResponse } from 'next/server';
import { getActiveCustomerProfile } from '@/lib/customer-data';
import {
  buildWhatsAppUrl,
  formatIdr,
  normalizeWaPhone,
} from '@/lib/format';
import { formatDestinationLabel, getDictionary } from '@/lib/i18n/dictionaries';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n/types';
import { DEFAULT_PUBLIC_SETTINGS, mapSettingsRows } from '@/lib/public-data';
import { generateRfqCode } from '@/lib/server-codes';
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

const VALID_SERVICES: ServiceType[] = [
  'titip_beli',
  'forwarder',
  'transfer_valas',
];
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
  let locale = normalizeLocale(req.cookies.get(LOCALE_COOKIE_NAME)?.value);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (typeof body.locale === 'string') {
      locale = normalizeLocale(body.locale);
    }
    const dict = getDictionary(locale);

    const customer = await getActiveCustomerProfile();
    if (!customer) {
      return NextResponse.json(
        { error: dict.api.authRequiredForOrder, code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const serviceType = String(body.service_type || '') as ServiceType;
    const customerName =
      String(body.customer_name || '').trim() || customer.full_name;
    const customerWhatsappRaw =
      String(body.customer_whatsapp || '').trim() || customer.whatsapp;
    const customerWhatsapp = normalizeWaPhone(customerWhatsappRaw);
    const companyName =
      body.company_name !== undefined
        ? String(body.company_name || '').trim() || null
        : customer.company_name;
    const destinationCity =
      String(body.destination_city || '').trim() ||
      customer.default_destination_city;
    const originCountry = String(body.origin_country || '') as OriginCountry;
    const shippingMethod = String(
      body.shipping_method ||
        (serviceType === 'transfer_valas' ? 'transfer_only' : 'laut')
    ) as RfqShippingMethod;
    const cargoCategory = String(
      body.cargo_category || 'general'
    ) as CargoCategory;
    const productUrl = String(body.product_url || '').trim() || null;
    const productName = String(body.product_name || '').trim();
    const productPhotoUrl = String(body.product_photo_url || '').trim() || null;
    const currency = String(body.currency || 'RMB') as CurrencyCode;
    const customerNotes = String(body.customer_notes || '').trim() || null;
    const lclBatchCode = String(body.lcl_batch_code || '').trim() || null;

    if (!VALID_SERVICES.includes(serviceType)) {
      return NextResponse.json(
        { error: dict.api.rfqInvalidService },
        { status: 400 }
      );
    }
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { error: dict.api.rfqMissingName },
        { status: 400 }
      );
    }
    if (!customerWhatsapp || customerWhatsapp.length < 9) {
      return NextResponse.json(
        { error: dict.api.rfqInvalidWhatsapp },
        { status: 400 }
      );
    }
    if (!destinationCity) {
      return NextResponse.json(
        { error: dict.api.rfqMissingDestination },
        { status: 400 }
      );
    }
    if (!VALID_ORIGINS.includes(originCountry)) {
      return NextResponse.json(
        { error: dict.api.rfqInvalidOrigin },
        { status: 400 }
      );
    }
    if (!VALID_METHODS.includes(shippingMethod)) {
      return NextResponse.json(
        { error: dict.api.rfqInvalidMethod },
        { status: 400 }
      );
    }
    if (!VALID_CATEGORIES.includes(cargoCategory)) {
      return NextResponse.json(
        { error: dict.api.rfqInvalidCategory },
        { status: 400 }
      );
    }
    if (!productName) {
      return NextResponse.json(
        { error: dict.api.rfqMissingProduct },
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
        customer_id: customer.id,
        lcl_batch_code: lclBatchCode,
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
        { error: dict.api.rfqSaveError },
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
    const tpl = dict.api.rfqWaTemplate;

    const lines = [
      tpl.greeting(settings.company_name),
      '',
      `*${tpl.code}:* ${order.rfq_code} (Member: ${customer.member_code})`,
      `*${tpl.service}:* ${dict.domain.serviceLabels[order.service_type]}`,
      `*${tpl.name}:* ${order.customer_name}${order.company_name ? ` (${order.company_name})` : ''}`,
      `*${tpl.originRoute}:* ${dict.domain.originLabels[order.origin_country]}, ${dict.domain.methodLabels[order.shipping_method]}`,
      `*${tpl.category}:* ${dict.domain.categoryLabels[order.cargo_category]}`,
      `*${tpl.product}:* ${order.product_name} (Qty: ${order.quantity ?? 1})`,
    ];

    if (order.lcl_batch_code) {
      lines.push(`*LCL Batch:* ${order.lcl_batch_code}`);
    }
    if (order.product_url) {
      lines.push(`*${tpl.productUrl}:* ${order.product_url}`);
    }
    if (order.estimated_goods_value) {
      lines.push(
        `*${tpl.goodsValue}:* ${order.estimated_goods_value} ${order.currency}`
      );
    }
    if (order.estimated_weight_kg) {
      lines.push(`*${tpl.weight}:* ${order.estimated_weight_kg} kg`);
    }
    if (order.estimated_cbm) {
      lines.push(`*${tpl.cbm}:* ${order.estimated_cbm} CBM`);
    }
    if (order.estimated_total_idr) {
      lines.push(
        `*${tpl.calcEstimate}:* ${formatIdr(order.estimated_total_idr)}`
      );
    }
    lines.push(
      `*${tpl.destination}:* ${formatDestinationLabel(order.destination_city, locale)}`
    );
    if (order.customer_notes) {
      lines.push(`*${tpl.notes}:* ${order.customer_notes}`);
    }
    lines.push('', tpl.closing);

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
    const dict = getDictionary(locale);
    return NextResponse.json(
      { error: dict.api.rfqServerError },
      { status: 500 }
    );
  }
}
