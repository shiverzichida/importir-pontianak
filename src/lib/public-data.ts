import { FX_SYNC_TTL_MS, syncFxRatesToDb } from './fx-sync';
import { DEFAULT_PUBLIC_SETTINGS, mapSettingsRows } from './settings-mapper';
import { getSupabaseAdmin } from './supabase';
import type {
  CatalogProduct,
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

export async function getPublicCatalogProducts(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<CatalogProduct[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('imp_catalog_products')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.limit && options.limit > 0) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to load catalog products:', error);
      return [];
    }
    return (data as CatalogProduct[] | null) ?? [];
  } catch (err) {
    console.error('Catalog fetch exception:', err);
    return [];
  }
}

export async function getCatalogProductBySlug(
  slug: string
): Promise<CatalogProduct | null> {
  const clean = slug.trim();
  if (!clean) return null;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_catalog_products')
      .select('*')
      .eq('slug', clean)
      .eq('is_active', true)
      .maybeSingle();
    if (error) {
      console.error('Failed to fetch catalog product by slug:', error);
      return null;
    }
    return (data as CatalogProduct | null) ?? null;
  } catch (err) {
    console.error('Catalog slug lookup error:', err);
    return null;
  }
}
