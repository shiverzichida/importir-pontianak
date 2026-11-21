import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { recalculateRatesFromStoredSpot } from '@/lib/fx-sync';
import { SETTING_LABELS } from '@/lib/settings-mapper';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [settingsRes, ratesRes, destRes, whRes] = await Promise.all([
      supabase.from('imp_settings').select('*').order('key', { ascending: true }),
      supabase
        .from('imp_shipping_rates')
        .select('*')
        .order('origin_country', { ascending: true })
        .order('shipping_method', { ascending: true })
        .order('unit', { ascending: true })
        .order('cargo_category', { ascending: true }),
      supabase
        .from('imp_kalbar_destinations')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabase
        .from('imp_warehouses')
        .select('*')
        .order('origin_country', { ascending: true }),
    ]);

    return NextResponse.json({
      settings: settingsRes.data ?? [],
      rates: ratesRes.data ?? [],
      destinations: destRes.data ?? [],
      warehouses: whRes.data ?? [],
    });
  } catch (err) {
    console.error('Admin settings GET error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat pengaturan sistem.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const type = String(body.type || '');
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    if (type === 'settings') {
      const items = body.items as Array<{ key: string; value: string }>;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'Data pengaturan tidak valid.' },
          { status: 400 }
        );
      }

      const payload = items
        .filter((item) => Boolean(item.key))
        .map((item) => ({
          key: item.key,
          value: String(item.value ?? '').trim(),
          label: SETTING_LABELS[item.key] || item.key,
          updated_at: now,
        }));

      if (payload.length > 0) {
        const { error } = await supabase
          .from('imp_settings')
          .upsert(payload, { onConflict: 'key' });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }

      const modeItem = payload.find((p) => p.key === 'fx_mode');
      if (modeItem?.value === 'auto') {
        await recalculateRatesFromStoredSpot();
      } else if (modeItem?.value === 'manual') {
        await supabase.from('imp_settings').upsert(
          [
            {
              key: 'fx_source',
              value: 'Manual Admin',
              label: SETTING_LABELS.fx_source,
              updated_at: now,
            },
          ],
          { onConflict: 'key' }
        );
      }

      const { data: refreshed } = await supabase
        .from('imp_settings')
        .select('*')
        .order('key', { ascending: true });

      return NextResponse.json({ ok: true, settings: refreshed ?? [] });
    }

    if (type === 'rate') {
      const id = String(body.id || '');
      if (!id) {
        return NextResponse.json({ error: 'ID tarif wajib diisi.' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('imp_shipping_rates')
        .update({
          rate_idr: Number(body.rate_idr),
          min_charge: Number(body.min_charge),
          eta_min_days: Number(body.eta_min_days),
          eta_max_days: Number(body.eta_max_days),
          volumetric_divisor: Number(body.volumetric_divisor),
          notes: body.notes !== undefined ? String(body.notes || '') : undefined,
          is_active: Boolean(body.is_active),
          updated_at: now,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ rate: data });
    }

    if (type === 'destination') {
      const id = String(body.id || '');
      if (!id) {
        return NextResponse.json(
          { error: 'ID destinasi wajib diisi.' },
          { status: 400 }
        );
      }
      const { data, error } = await supabase
        .from('imp_kalbar_destinations')
        .update({
          extra_fee_per_kg: Number(body.extra_fee_per_kg),
          extra_fee_flat: Number(body.extra_fee_flat),
          extra_eta_days: Number(body.extra_eta_days),
          is_active: Boolean(body.is_active),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ destination: data });
    }

    if (type === 'warehouse') {
      const id = String(body.id || '');
      if (!id) {
        return NextResponse.json(
          { error: 'ID gudang wajib diisi.' },
          { status: 400 }
        );
      }
      const { data, error } = await supabase
        .from('imp_warehouses')
        .update({
          warehouse_name: String(body.warehouse_name || '').trim(),
          city: String(body.city || '').trim(),
          address_local: String(body.address_local || '').trim(),
          address_english: String(body.address_english || '').trim(),
          recipient_format: String(body.recipient_format || '').trim(),
          phone: String(body.phone || '').trim(),
          postal_code: String(body.postal_code || '').trim(),
          notes: String(body.notes || '').trim(),
          is_active: Boolean(body.is_active),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ warehouse: data });
    }

    return NextResponse.json(
      { error: 'Tipe pembaruan pengaturan tidak dikenal.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Admin settings PATCH error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengaturan.' },
      { status: 500 }
    );
  }
}
