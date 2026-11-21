import {
  computeEffectiveRates,
  type EffectiveRates,
  type SpotRates,
} from './fx-utils';
import { mapSettingsRows, SETTING_LABELS } from './settings-mapper';
import { getSupabaseAdmin } from './supabase';
import type { ImpSettingRow } from './types';

export const FX_SYNC_TTL_MS = 6 * 60 * 60 * 1000;

export interface LiveSpotFetchResult {
  spot: SpotRates;
  source: string;
  marketDate: string;
}

export interface FxSyncResult {
  synced: boolean;
  skipped?: 'manual' | 'fresh';
  spot?: SpotRates;
  effective?: EffectiveRates;
  source?: string;
  syncedAt?: string;
}

let inflightSync: Promise<FxSyncResult> | null = null;

function extractCrossRates(
  rates: Record<string, number> | undefined
): SpotRates | null {
  if (!rates) return null;
  const { IDR, CNY, MYR, SGD } = rates;
  if (
    !Number.isFinite(IDR) ||
    !Number.isFinite(CNY) ||
    !Number.isFinite(MYR) ||
    !Number.isFinite(SGD) ||
    IDR <= 0 ||
    CNY <= 0 ||
    MYR <= 0 ||
    SGD <= 0
  ) {
    return null;
  }
  return {
    rmb: Number((IDR / CNY).toFixed(2)),
    myr: Number((IDR / MYR).toFixed(2)),
    sgd: Number((IDR / SGD).toFixed(2)),
  };
}

export async function fetchLiveSpotRates(): Promise<LiveSpotFetchResult> {
  try {
    const res = await fetch(
      'https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR,CNY,MYR,SGD',
      {
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const data = (await res.json()) as {
        date?: string;
        rates?: Record<string, number>;
      };
      const spot = extractCrossRates(data.rates);
      if (spot) {
        return {
          spot,
          source: 'ECB (Frankfurter)',
          marketDate: data.date || new Date().toISOString().slice(0, 10),
        };
      }
    }
  } catch {
    // Fall through to secondary provider
  }

  const fallbackRes = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
  });
  if (fallbackRes.ok) {
    const data = (await fallbackRes.json()) as {
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };
    const spot = extractCrossRates(data.rates);
    if (spot) {
      return {
        spot,
        source: 'ExchangeRate-API',
        marketDate: data.time_last_update_utc || new Date().toISOString(),
      };
    }
  }

  throw new Error(
    'Gagal mengambil kurs pasar dari Frankfurter dan ExchangeRate-API.'
  );
}

async function upsertSettingEntries(
  entries: Array<{ key: string; value: string }>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const payload = entries.map((e) => ({
    key: e.key,
    value: e.value,
    label: SETTING_LABELS[e.key] || e.key,
    updated_at: now,
  }));

  const { error } = await supabase
    .from('imp_settings')
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    throw new Error(`Gagal menyimpan pengaturan kurs: ${error.message}`);
  }
}

async function runSyncFxRates(options: {
  force: boolean;
  updateRatesEvenIfManual: boolean;
}): Promise<FxSyncResult> {
  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from('imp_settings')
    .select('key, value, label, updated_at');
  const settings = mapSettingsRows(rows as ImpSettingRow[] | null);

  if (!options.force && settings.fx_mode !== 'auto') {
    return { synced: false, skipped: 'manual' };
  }

  if (!options.force && settings.fx_last_synced_at && settings.fx_spot_rmb_idr > 0) {
    const syncedMs = Date.parse(settings.fx_last_synced_at);
    if (Number.isFinite(syncedMs) && Date.now() - syncedMs < FX_SYNC_TTL_MS) {
      return { synced: false, skipped: 'fresh' };
    }
  }

  const fetched = await fetchLiveSpotRates();
  const syncedAt = new Date().toISOString();
  const effective = computeEffectiveRates(
    fetched.spot,
    settings.fx_spread_percent,
    settings.fx_spread_flat_idr
  );

  const updates: Array<{ key: string; value: string }> = [
    { key: 'fx_spot_rmb_idr', value: String(fetched.spot.rmb) },
    { key: 'fx_spot_myr_idr', value: String(fetched.spot.myr) },
    { key: 'fx_spot_sgd_idr', value: String(fetched.spot.sgd) },
    { key: 'fx_source', value: fetched.source },
    { key: 'fx_last_synced_at', value: syncedAt },
  ];

  if (settings.fx_mode === 'auto' || options.updateRatesEvenIfManual) {
    updates.push(
      { key: 'rate_rmb_idr', value: String(effective.rate_rmb_idr) },
      { key: 'rate_myr_idr', value: String(effective.rate_myr_idr) },
      { key: 'rate_sgd_idr', value: String(effective.rate_sgd_idr) }
    );
  }

  await upsertSettingEntries(updates);

  return {
    synced: true,
    spot: fetched.spot,
    effective,
    source: fetched.source,
    syncedAt,
  };
}

export async function syncFxRatesToDb(options?: {
  force?: boolean;
  updateRatesEvenIfManual?: boolean;
}): Promise<FxSyncResult> {
  const force = options?.force ?? false;
  const updateRatesEvenIfManual = options?.updateRatesEvenIfManual ?? false;

  if (!force && inflightSync) {
    return inflightSync;
  }

  const promise = runSyncFxRates({ force, updateRatesEvenIfManual }).finally(
    () => {
      if (!force || inflightSync === promise) {
        inflightSync = null;
      }
    }
  );

  if (!force) {
    inflightSync = promise;
  }
  return promise;
}

export async function recalculateRatesFromStoredSpot(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from('imp_settings')
    .select('key, value, label, updated_at');
  const settings = mapSettingsRows(rows as ImpSettingRow[] | null);

  if (
    settings.fx_spot_rmb_idr <= 0 ||
    settings.fx_spot_myr_idr <= 0 ||
    settings.fx_spot_sgd_idr <= 0
  ) {
    await syncFxRatesToDb({ force: true, updateRatesEvenIfManual: true });
    return;
  }

  const effective = computeEffectiveRates(
    {
      rmb: settings.fx_spot_rmb_idr,
      myr: settings.fx_spot_myr_idr,
      sgd: settings.fx_spot_sgd_idr,
    },
    settings.fx_spread_percent,
    settings.fx_spread_flat_idr
  );

  const updates: Array<{ key: string; value: string }> = [
    { key: 'rate_rmb_idr', value: String(effective.rate_rmb_idr) },
    { key: 'rate_myr_idr', value: String(effective.rate_myr_idr) },
    { key: 'rate_sgd_idr', value: String(effective.rate_sgd_idr) },
  ];

  if (settings.fx_source === 'Manual Admin') {
    updates.push({ key: 'fx_source', value: 'ECB (Frankfurter)' });
  }

  await upsertSettingEntries(updates);
}
