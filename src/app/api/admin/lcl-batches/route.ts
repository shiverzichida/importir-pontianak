import crypto from 'node:crypto';
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

function buildDefaultBatchCode(origin: OriginCountry): string {
  const prefix = origin === 'china' ? 'GZ' : origin === 'malaysia' ? 'KCH' : 'SG';
  const d = new Date();
  const yymm = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rnd = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LCL-${prefix}-PNK-${yymm}-${rnd}`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_lcl_batches')
      .select('*')
      .order('is_active', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('cutoff_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ batches: data ?? [] });
  } catch (err) {
    console.error('Admin LCL batches GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat jadwal kloter LCL.' },
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

    const originCountry = String(
      body.origin_country || 'china'
    ) as OriginCountry;
    const shippingMethod = String(
      body.shipping_method || 'laut'
    ) as ShippingMethod;
    const status = String(body.status || 'open') as LclBatchStatus;
    const title = String(body.title || '').trim();
    const rawCode = String(body.batch_code || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '');
    const batchCode = rawCode || buildDefaultBatchCode(originCountry);
    const originWarehouse = String(
      body.origin_warehouse || 'Gudang Guangzhou'
    ).trim();
    const containerSize = String(
      body.container_size || '20ft (28 CBM)'
    ).trim();
    const cutoffDate = String(body.cutoff_date || '').trim();
    const etdDate = String(body.etd_date || '').trim() || null;
    const etaDate = String(body.eta_date || '').trim() || null;
    const notes = String(body.notes || '').trim() || null;

    if (!title || title.length < 4) {
      return NextResponse.json(
        { error: 'Judul kloter kontainer wajib diisi (min. 4 karakter).' },
        { status: 400 }
      );
    }
    if (!VALID_ORIGINS.includes(originCountry)) {
      return NextResponse.json(
        { error: 'Negara asal tidak valid.' },
        { status: 400 }
      );
    }
    if (!VALID_METHODS.includes(shippingMethod)) {
      return NextResponse.json(
        { error: 'Jalur pengiriman tidak valid.' },
        { status: 400 }
      );
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Status kloter tidak valid.' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoffDate)) {
      return NextResponse.json(
        { error: 'Tanggal tutup stuffing (cutoff_date) wajib berformat YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const capacityCbm = Number(body.capacity_cbm);
    const filledCbm = Number(body.filled_cbm ?? 0);
    const minSlotCbm = Number(body.min_slot_cbm ?? 0.1);
    const sortOrder = Math.round(Number(body.sort_order) || 0);
    const isActive =
      body.is_active === undefined ? true : Boolean(body.is_active);

    if (!Number.isFinite(capacityCbm) || capacityCbm <= 0) {
      return NextResponse.json(
        { error: 'Kapasitas kontainer (CBM) harus lebih dari 0.' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(filledCbm) || filledCbm < 0) {
      return NextResponse.json(
        { error: 'Volume terisi (CBM) tidak boleh negatif.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_lcl_batches')
      .insert({
        batch_code: batchCode,
        title,
        origin_country: originCountry,
        origin_warehouse: originWarehouse,
        shipping_method: shippingMethod,
        container_size: containerSize,
        capacity_cbm: Number(capacityCbm.toFixed(2)),
        filled_cbm: Number(filledCbm.toFixed(2)),
        min_slot_cbm: Number.isFinite(minSlotCbm) && minSlotCbm > 0 ? Number(minSlotCbm.toFixed(2)) : 0.1,
        cutoff_date: cutoffDate,
        etd_date: etdDate,
        eta_date: etaDate,
        status,
        notes,
        is_active: isActive,
        sort_order: sortOrder,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Admin LCL batch POST error:', error);
      return NextResponse.json(
        {
          error:
            error?.code === '23505'
              ? `Kode kloter ${batchCode} sudah digunakan.`
              : 'Gagal membuat jadwal kloter LCL baru.',
        },
        { status: error?.code === '23505' ? 409 : 500 }
      );
    }

    return NextResponse.json({ batch: data }, { status: 201 });
  } catch (err) {
    console.error('Admin LCL batch POST exception:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan kloter LCL.' },
      { status: 500 }
    );
  }
}
