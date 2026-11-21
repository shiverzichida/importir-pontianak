import type { ImpSettingRow, PublicSettings } from './types';

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
  operating_hours: 'Senin - Sabtu, 08:30 - 17:30 WIB',
  fx_mode: 'auto',
  fx_spread_percent: 1.5,
  fx_spread_flat_idr: 0,
  fx_spot_rmb_idr: 0,
  fx_spot_myr_idr: 0,
  fx_spot_sgd_idr: 0,
  fx_source: 'ECB (Frankfurter)',
  fx_last_synced_at: null,
};

export const SETTING_LABELS: Record<string, string> = {
  rate_rmb_idr: 'Kurs 1 RMB (Yuan) ke IDR',
  rate_myr_idr: 'Kurs 1 MYR (Ringgit) ke IDR',
  rate_sgd_idr: 'Kurs 1 SGD (Dolar Singapura) ke IDR',
  sourcing_fee_percent: 'Fee Jasa Titip Beli (%)',
  sourcing_fee_min_idr: 'Minimum Fee Titip Beli (IDR)',
  transfer_fee_idr: 'Fee Jasa Transfer Valas per Transaksi (IDR)',
  whatsapp_admin: 'Nomor WhatsApp Admin (format 628...)',
  company_name: 'Nama Brand / Perusahaan',
  company_address: 'Alamat Gudang & Kantor Pontianak',
  operating_hours: 'Jam Operasional',
  fx_mode: 'Mode Kurs Valas (auto / manual)',
  fx_spread_percent: 'Margin Spread Kurs (%)',
  fx_spread_flat_idr: 'Markup Tambahan Kurs Flat (IDR / unit)',
  fx_spot_rmb_idr: 'Kurs Spot Pasar 1 RMB (IDR)',
  fx_spot_myr_idr: 'Kurs Spot Pasar 1 MYR (IDR)',
  fx_spot_sgd_idr: 'Kurs Spot Pasar 1 SGD (IDR)',
  fx_source: 'Sumber Data Kurs Terakhir',
  fx_last_synced_at: 'Waktu Sinkronisasi Kurs Terakhir',
};

export function mapSettingsRows(
  rows: ImpSettingRow[] | null | undefined
): PublicSettings {
  const map = new Map<string, string>();
  for (const row of rows || []) {
    map.set(row.key, row.value);
  }

  const posNum = (key: string, fallback: number): number => {
    const raw = map.get(key);
    if (raw === undefined || raw === '') return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const nonNegNum = (key: string, fallback: number): number => {
    const raw = map.get(key);
    if (raw === undefined || raw === '') return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  const fxModeRaw = map.get('fx_mode');
  const fxMode: 'auto' | 'manual' =
    fxModeRaw === 'manual' ? 'manual' : 'auto';
  const syncedRaw = map.get('fx_last_synced_at') || '';

  return {
    rate_rmb_idr: posNum('rate_rmb_idr', DEFAULT_PUBLIC_SETTINGS.rate_rmb_idr),
    rate_myr_idr: posNum('rate_myr_idr', DEFAULT_PUBLIC_SETTINGS.rate_myr_idr),
    rate_sgd_idr: posNum('rate_sgd_idr', DEFAULT_PUBLIC_SETTINGS.rate_sgd_idr),
    sourcing_fee_percent: nonNegNum(
      'sourcing_fee_percent',
      DEFAULT_PUBLIC_SETTINGS.sourcing_fee_percent
    ),
    sourcing_fee_min_idr: nonNegNum(
      'sourcing_fee_min_idr',
      DEFAULT_PUBLIC_SETTINGS.sourcing_fee_min_idr
    ),
    transfer_fee_idr: nonNegNum(
      'transfer_fee_idr',
      DEFAULT_PUBLIC_SETTINGS.transfer_fee_idr
    ),
    whatsapp_admin:
      map.get('whatsapp_admin') || DEFAULT_PUBLIC_SETTINGS.whatsapp_admin,
    company_name:
      map.get('company_name') || DEFAULT_PUBLIC_SETTINGS.company_name,
    company_address:
      map.get('company_address') || DEFAULT_PUBLIC_SETTINGS.company_address,
    operating_hours:
      map.get('operating_hours') || DEFAULT_PUBLIC_SETTINGS.operating_hours,
    fx_mode: fxMode,
    fx_spread_percent: nonNegNum(
      'fx_spread_percent',
      DEFAULT_PUBLIC_SETTINGS.fx_spread_percent
    ),
    fx_spread_flat_idr: nonNegNum(
      'fx_spread_flat_idr',
      DEFAULT_PUBLIC_SETTINGS.fx_spread_flat_idr
    ),
    fx_spot_rmb_idr: nonNegNum(
      'fx_spot_rmb_idr',
      DEFAULT_PUBLIC_SETTINGS.fx_spot_rmb_idr
    ),
    fx_spot_myr_idr: nonNegNum(
      'fx_spot_myr_idr',
      DEFAULT_PUBLIC_SETTINGS.fx_spot_myr_idr
    ),
    fx_spot_sgd_idr: nonNegNum(
      'fx_spot_sgd_idr',
      DEFAULT_PUBLIC_SETTINGS.fx_spot_sgd_idr
    ),
    fx_source: map.get('fx_source') || DEFAULT_PUBLIC_SETTINGS.fx_source,
    fx_last_synced_at: syncedRaw ? syncedRaw : null,
  };
}
