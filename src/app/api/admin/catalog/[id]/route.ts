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
      if (title.length < 3) {
        return NextResponse.json(
          { error: 'Nama produk minimal 3 karakter.' },
          { status: 400 }
        );
      }
      updates.title = title;
    }

    if (body.category !== undefined) {
      const cat = String(body.category) as CatalogCategory;
      if (!VALID_CATEGORIES.includes(cat)) {
        return NextResponse.json(
          { error: 'Kategori katalog tidak valid.' },
          { status: 400 }
        );
      }
      updates.category = cat;
    }

    if (body.cargo_category !== undefined) {
      const cc = String(body.cargo_category) as CargoCategory;
      if (!VALID_CARGO_CATEGORIES.includes(cc)) {
        return NextResponse.json(
          { error: 'Kategori kargo tidak valid.' },
          { status: 400 }
        );
      }
      updates.cargo_category = cc;
    }

    if (body.shipment_scale !== undefined) {
      const sc = String(body.shipment_scale) as ShipmentScale;
      if (!VALID_SCALES.includes(sc)) {
        return NextResponse.json(
          { error: 'Skala pengiriman tidak valid.' },
          { status: 400 }
        );
      }
      updates.shipment_scale = sc;
    }

    if (typeof body.image_url === 'string') {
      const img = body.image_url.trim();
      if (!img || !isValidImageUrl(img)) {
        return NextResponse.json(
          { error: 'URL gambar tidak valid.' },
          { status: 400 }
        );
      }
      updates.image_url = img;
    }

    if (typeof body.supplier_url === 'string') {
      const sup = body.supplier_url.trim();
      if (!sup || !isValidHttpUrl(sup)) {
        return NextResponse.json(
          { error: 'Link supplier utama harus diawali http:// atau https://.' },
          { status: 400 }
        );
      }
      updates.supplier_url = sup;
    }

    if (body.secondary_url !== undefined) {
      const sec = String(body.secondary_url || '').trim();
      if (sec && !isValidHttpUrl(sec)) {
        return NextResponse.json(
          { error: 'Link pembanding harus diawali http:// atau https://.' },
          { status: 400 }
        );
      }
      updates.secondary_url = sec || null;
    }

    for (const strField of [
      'origin_hub',
      'supplier_platform',
      'unit_label',
      'moq_note',
      'estimated_cbm_note',
      'margin_note',
      'why_pontianak',
    ] as const) {
      if (typeof body[strField] === 'string') {
        const val = body[strField].trim();
        if (strField === 'why_pontianak' && !val) {
          return NextResponse.json(
            { error: 'Alasan peluang di Pontianak wajib diisi.' },
            { status: 400 }
          );
        }
        if (val) updates[strField] = val;
      }
    }

    if (body.mandarin_keyword !== undefined) {
      updates.mandarin_keyword =
        String(body.mandarin_keyword || '').trim() || null;
    }
    if (body.lcl_tip !== undefined) {
      updates.lcl_tip = String(body.lcl_tip || '').trim() || null;
    }

    for (const numField of ['price_rmb_min', 'price_rmb_max'] as const) {
      if (body[numField] !== undefined) {
        const n = Number(body[numField]);
        if (Number.isFinite(n) && n >= 0) updates[numField] = n;
      }
    }

    for (const intField of [
      'est_landed_idr_min',
      'est_landed_idr_max',
      'est_sell_idr_min',
      'est_sell_idr_max',
      'sort_order',
    ] as const) {
      if (body[intField] !== undefined) {
        const n = Math.round(Number(body[intField]));
        if (Number.isFinite(n)) {
          updates[intField] = intField === 'sort_order' ? n : Math.max(0, n);
        }
      }
    }

    if (typeof body.is_featured === 'boolean') {
      updates.is_featured = body.is_featured;
    }
    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_catalog_products')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Gagal memperbarui produk katalog.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (err) {
    console.error('Admin catalog PATCH error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui katalog.' },
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
      .from('imp_catalog_products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('Admin catalog DELETE error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus produk katalog.' },
      { status: 500 }
    );
  }
}
