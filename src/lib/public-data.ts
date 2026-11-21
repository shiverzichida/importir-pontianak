import { FX_SYNC_TTL_MS, syncFxRatesToDb } from './fx-sync';
import { DEFAULT_PUBLIC_SETTINGS, mapSettingsRows } from './settings-mapper';
import { getSupabaseAdmin } from './supabase';
import type {
  ImpSettingRow,
  KalbarDestination,
  PublicConfig,
  ShippingRate,
  WarehouseInfo,
} from './types';

export { DEFAULT_PUBLIC_SETTINGS, mapSettingsRows };

function isFxStale(settings: ReturnType<typeof mapSettingsRows>): boolean {
  if (settings.fx_mode !== 'auto') return false;
  if (settings.fx_spot_rmb_idr <= 0 || !settings.fx_last_synced_at) {
    return true;
  }
  const syncedMs = Date.parse(settings.fx_last_synced_at);
  if (!Number.isFinite(syncedMs)) return true;
  return Date.now() - syncedMs >= FX_SYNC_TTL_MS;
}

export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    const supabase = getSupabaseAdmin();
    const [settingsRes, ratesRes, destRes, whRes] = await Promise.all([
      supabase.from('imp_settings').select('key, value, label, updated_at'),
      supabase
        .from('imp_shipping_rates')
        .select('*')
        .eq('is_active', true)
        .order('origin_country', { ascending: true })
        .order('shipping_method', { ascending: true })
        .order('unit', { ascending: true }),
      supabase
        .from('imp_kalbar_destinations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('imp_warehouses')
        .select('*')
        .eq('is_active', true)
        .order('origin_country', { ascending: true }),
    ]);

    let settings = mapSettingsRows(settingsRes.data as ImpSettingRow[] | null);

    if (isFxStale(settings)) {
      try {
        const syncResult = await syncFxRatesToDb({ force: false });
        if (syncResult.synced) {
          const refreshedRes = await supabase
            .from('imp_settings')
            .select('key, value, label, updated_at');
          settings = mapSettingsRows(
            refreshedRes.data as ImpSettingRow[] | null
          );
        }
      } catch (fxErr) {
        console.error('FX auto-sync failed, using cached DB rates:', fxErr);
      }
    }

    return {
      settings: {
        ...settings,
        // Redact internal FX provider name from public payloads and SSR Flight data
        fx_source: '',
      },
      rates: (ratesRes.data as ShippingRate[] | null) ?? [],
      destinations: (destRes.data as KalbarDestination[] | null) ?? [],
      warehouses: (whRes.data as WarehouseInfo[] | null) ?? [],
    };
  } catch (err) {
    console.error('Failed to load public config:', err);
    return {
      settings: {
        ...DEFAULT_PUBLIC_SETTINGS,
        fx_source: '',
      },
      rates: [],
      destinations: [],
      warehouses: [],
    };
  }
}
