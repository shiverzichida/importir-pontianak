import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type {
  CargoCategory,
  CatalogCategory,
  ShipmentScale,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: CatalogCategory[] = [
  'kopi_fb',
  'walet',
  'otomotif',
  'fashion',
  'grooming',
  'bangunan',
  'industri_kebun',
  'rumah_tangga',
];

const VALID_CARGO_CATEGORIES: CargoCategory[] = [
  'general',
  'fashion',
  'elektronik',
  'khusus',
];

const VALID_SCALES: ShipmentScale[] = ['lcl', 'fcl', 'lcl_fcl'];

function isValidHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url);
}

function isValidImageUrl(url: string): boolean {
  return url.startsWith('/') || isValidHttpUrl(url);
}

function toSlugBase(title: string): string {
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || `produk-${crypto.randomBytes(3).toString('hex')}`;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const category = (req.nextUrl.searchParams.get('category') || '').trim();
    const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_catalog_products')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let products = data ?? [];
    if (q) {
      products = products.filter(
        (p) =>
          String(p.title || '').toLowerCase().includes(q) ||
          String(p.slug || '').toLowerCase().includes(q) ||
          String(p.mandarin_keyword || '').toLowerCase().includes(q) ||
          String(p.why_pontianak || '').toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Admin catalog GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar katalog produk.' },
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

    const title = String(body.title || '').trim();
    const category = String(body.category || '') as CatalogCategory;
    const cargoCategory = String(
      body.cargo_category || 'general'
    ) as CargoCategory;
    const shipmentScale = String(
      body.shipment_scale || 'lcl'
    ) as ShipmentScale;
    const originHub = String(body.origin_hub || 'Guangzhou / Yiwu').trim();
    const imageUrl = String(body.image_url || '').trim();
    const supplierPlatform = String(
      body.supplier_platform || '1688.com'
    ).trim();
    const supplierUrl = String(body.supplier_url || '').trim();
    const secondaryUrlRaw = String(body.secondary_url || '').trim();
    const secondaryUrl = secondaryUrlRaw || null;
    const mandarinKeyword = String(body.mandarin_keyword || '').trim() || null;
    const unitLabel = String(body.unit_label || 'pcs').trim();
    const moqNote = String(body.moq_note || 'Min. 20 pcs').trim();
    const estimatedCbmNote = String(
      body.estimated_cbm_note || 'Mulai 0,1 CBM (LCL Gabungan)'
    ).trim();
    const marginNote = String(body.margin_note || '100% - 200%').trim();
    const whyPontianak = String(body.why_pontianak || '').trim();
    const lclTip = String(body.lcl_tip || '').trim() || null;

    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: 'Nama produk katalog wajib diisi (min. 3 karakter).' },
        { status: 400 }
      );
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Kategori katalog tidak valid.' },
        { status: 400 }
      );
    }
    if (!VALID_CARGO_CATEGORIES.includes(cargoCategory)) {
      return NextResponse.json(
        { error: 'Kategori kargo ongkir tidak valid.' },
        { status: 400 }
      );
    }
    if (!VALID_SCALES.includes(shipmentScale)) {
      return NextResponse.json(
        { error: 'Skala pengiriman (LCL/FCL) tidak valid.' },
        { status: 400 }
      );
    }
    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: 'URL gambar produk atau foto unggahan wajib valid.' },
        { status: 400 }
      );
    }
    if (!supplierUrl || !isValidHttpUrl(supplierUrl)) {
      return NextResponse.json(
        { error: 'Link supplier utama harus diawali http:// atau https://.' },
        { status: 400 }
      );
    }
    if (secondaryUrl && !isValidHttpUrl(secondaryUrl)) {
      return NextResponse.json(
        { error: 'Link pembanding harus diawali http:// atau https://.' },
        { status: 400 }
      );
    }
    if (!whyPontianak) {
      return NextResponse.json(
        { error: 'Alasan peluang jual di Pontianak wajib diisi.' },
        { status: 400 }
      );
    }

    const toNonNegNumber = (v: unknown, def = 0): number => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : def;
    };

    const priceRmbMin = toNonNegNumber(body.price_rmb_min, 0);
    const priceRmbMax = Math.max(
      priceRmbMin,
      toNonNegNumber(body.price_rmb_max, priceRmbMin)
    );
    const estLandedIdrMin = Math.round(toNonNegNumber(body.est_landed_idr_min, 0));
    const estLandedIdrMax = Math.max(
      estLandedIdrMin,
      Math.round(toNonNegNumber(body.est_landed_idr_max, estLandedIdrMin))
    );
    const estSellIdrMin = Math.round(toNonNegNumber(body.est_sell_idr_min, 0));
    const estSellIdrMax = Math.max(
      estSellIdrMin,
      Math.round(toNonNegNumber(body.est_sell_idr_max, estSellIdrMin))
    );
    const sortOrder = Math.round(Number(body.sort_order) || 0);
    const isFeatured = Boolean(body.is_featured);
    const isActive =
      body.is_active === undefined ? true : Boolean(body.is_active);

    const supabase = getSupabaseAdmin();
    const rawSlug = String(body.slug || '').trim()
      ? toSlugBase(String(body.slug))
      : toSlugBase(title);

    const { data: existingSlug } = await supabase
      .from('imp_catalog_products')
      .select('id')
      .eq('slug', rawSlug)
      .maybeSingle();

    const finalSlug = existingSlug
      ? `${rawSlug}-${crypto.randomBytes(2).toString('hex')}`
      : rawSlug;

    const { data, error } = await supabase
      .from('imp_catalog_products')
      .insert({
        slug: finalSlug,
        title,
        category,
        cargo_category: cargoCategory,
        shipment_scale: shipmentScale,
        origin_hub: originHub || 'Guangzhou / Yiwu',
        image_url: imageUrl,
        supplier_platform: supplierPlatform || '1688.com',
        supplier_url: supplierUrl,
        secondary_url: secondaryUrl,
        mandarin_keyword: mandarinKeyword,
        price_rmb_min: priceRmbMin,
        price_rmb_max: priceRmbMax,
        unit_label: unitLabel || 'pcs',
        moq_note: moqNote || 'Min. 20 pcs',
        estimated_cbm_note:
          estimatedCbmNote || 'Mulai 0,1 CBM (LCL Gabungan)',
        est_landed_idr_min: estLandedIdrMin,
        est_landed_idr_max: estLandedIdrMax,
        est_sell_idr_min: estSellIdrMin,
        est_sell_idr_max: estSellIdrMax,
        margin_note: marginNote || '100% - 200%',
        why_pontianak: whyPontianak,
        lcl_tip: lclTip,
        is_featured: isFeatured,
        is_active: isActive,
        sort_order: sortOrder,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Admin catalog POST error:', error);
      return NextResponse.json(
        { error: 'Gagal menambahkan produk ke katalog.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err) {
    console.error('Admin catalog POST exception:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan produk katalog.' },
      { status: 500 }
    );
  }
}
