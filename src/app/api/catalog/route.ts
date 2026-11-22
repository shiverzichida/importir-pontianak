import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { CatalogProduct } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const category = (req.nextUrl.searchParams.get('category') || '').trim();
    const scale = (req.nextUrl.searchParams.get('scale') || '').trim();
    const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_catalog_products')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Public catalog query error:', error);
      return NextResponse.json(
        { error: 'Gagal memuat data katalog produk.' },
        { status: 500 }
      );
    }

    let products = (data as CatalogProduct[] | null) ?? [];

    if (scale === 'lcl') {
      products = products.filter(
        (p) => p.shipment_scale === 'lcl' || p.shipment_scale === 'lcl_fcl'
      );
    } else if (scale === 'fcl') {
      products = products.filter(
        (p) => p.shipment_scale === 'fcl' || p.shipment_scale === 'lcl_fcl'
      );
    }

    if (q) {
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.why_pontianak.toLowerCase().includes(q) ||
          (p.mandarin_keyword || '').toLowerCase().includes(q) ||
          p.origin_hub.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Public catalog endpoint error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memuat katalog.' },
      { status: 500 }
    );
  }
}
