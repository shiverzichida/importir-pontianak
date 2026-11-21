import { getSupabaseAdmin } from './supabase';
import type {
  ImpSettingRow,
  KalbarDestination,
  PublicConfig,
  PublicSettings,
  ShippingRate,
  WarehouseInfo,
} from './types';

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  rate_rmb_idr: 2280,
  rate_myr_idr: 3720,
  rate_sgd_idr: 12150,
  sourcing_fee_percent: 5,
  sourcing_fee_min_idr: 100000,
  transfer_fee_idr: 50000,
  whatsapp_admin: '6281256789012',
  company_name: 'Importir Pontianak',
  company_address: 'Jl. Ahmad Yani II, Pontianak / Kubu Raya, Kalimantan Barat',
  operating_hours: 'Senin – Sabtu, 08:30 – 17:30 WIB',
};

export function mapSettingsRows(rows: ImpSettingRow[] | null | undefined): PublicSettings {
  const map = new Map<string, string>();
  for (const row of rows || []) {
    map.set(row.key, row.value);
  }

  const num = (key: string, fallback: number): number => {
    const raw = map.get(key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    rate_rmb_idr: num('rate_rmb_idr', DEFAULT_PUBLIC_SETTINGS.rate_rmb_idr),
    rate_myr_idr: num('rate_myr_idr', DEFAULT_PUBLIC_SETTINGS.rate_myr_idr),
    rate_sgd_idr: num('rate_sgd_idr', DEFAULT_PUBLIC_SETTINGS.rate_sgd_idr),
    sourcing_fee_percent: num(
      'sourcing_fee_percent',
      DEFAULT_PUBLIC_SETTINGS.sourcing_fee_percent
    ),
    sourcing_fee_min_idr: num(
      'sourcing_fee_min_idr',
      DEFAULT_PUBLIC_SETTINGS.sourcing_fee_min_idr
    ),
    transfer_fee_idr: num('transfer_fee_idr', DEFAULT_PUBLIC_SETTINGS.transfer_fee_idr),
    whatsapp_admin: map.get('whatsapp_admin') || DEFAULT_PUBLIC_SETTINGS.whatsapp_admin,
    company_name: map.get('company_name') || DEFAULT_PUBLIC_SETTINGS.company_name,
    company_address:
      map.get('company_address') || DEFAULT_PUBLIC_SETTINGS.company_address,
    operating_hours:
      map.get('operating_hours') || DEFAULT_PUBLIC_SETTINGS.operating_hours,
  };
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

    return {
      settings: mapSettingsRows(settingsRes.data as ImpSettingRow[] | null),
      rates: (ratesRes.data as ShippingRate[] | null) ?? [],
      destinations: (destRes.data as KalbarDestination[] | null) ?? [],
      warehouses: (whRes.data as WarehouseInfo[] | null) ?? [],
    };
  } catch (err) {
    console.error('Failed to load public config:', err);
    return {
      settings: DEFAULT_PUBLIC_SETTINGS,
      rates: [],
      destinations: [],
      warehouses: [],
    };
  }
}
