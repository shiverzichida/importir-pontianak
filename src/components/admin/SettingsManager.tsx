'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  KeyRound,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Ship,
  Warehouse,
} from 'lucide-react';
import { formatDateWib, formatIdr } from '@/lib/format';
import { computeEffectiveRates } from '@/lib/fx-utils';
import type {
  ImpSettingRow,
  KalbarDestination,
  ShippingRate,
  WarehouseInfo,
} from '@/lib/types';

type TabKey = 'umum' | 'tarif' | 'kota' | 'gudang' | 'password';

const FX_KEYS = new Set([
  'fx_mode',
  'fx_spread_percent',
  'fx_spread_flat_idr',
  'fx_spot_rmb_idr',
  'fx_spot_myr_idr',
  'fx_spot_sgd_idr',
  'fx_source',
  'fx_last_synced_at',
  'rate_rmb_idr',
  'rate_myr_idr',
  'rate_sgd_idr',
]);

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<TabKey>('umum');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [settingsRows, setSettingsRows] = useState<ImpSettingRow[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [destinations, setDestinations] = useState<KalbarDestination[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [syncingFx, setSyncingFx] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!res.ok) {
        setLoadError('Gagal memuat pengaturan sistem.');
        return;
      }
      const data = (await res.json()) as {
        settings?: ImpSettingRow[];
        rates?: ShippingRate[];
        destinations?: KalbarDestination[];
        warehouses?: WarehouseInfo[];
      };
      setSettingsRows(data.settings || []);
      setRates(data.rates || []);
      setDestinations(data.destinations || []);
      setWarehouses(data.warehouses || []);
    } catch {
      setLoadError('Koneksi bermasalah saat memuat pengaturan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const showNotice = (type: 'ok' | 'err', msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 5000);
  };

  const getSettingVal = (key: string, fallback = '') =>
    settingsRows.find((r) => r.key === key)?.value ?? fallback;

  const setSettingVal = (key: string, value: string) => {
    setSettingsRows((prev) => {
      const exists = prev.some((r) => r.key === key);
      if (exists) {
        return prev.map((r) => (r.key === key ? { ...r, value } : r));
      }
      return [
        ...prev,
        { key, value, label: key, updated_at: new Date().toISOString() },
      ];
    });
  };

  const fxMode = getSettingVal('fx_mode', 'auto') === 'manual' ? 'manual' : 'auto';
  const spreadPercent = Number(getSettingVal('fx_spread_percent', '1.5')) || 0;
  const spreadFlat = Number(getSettingVal('fx_spread_flat_idr', '0')) || 0;
  const spotRmb = Number(getSettingVal('fx_spot_rmb_idr', '0')) || 0;
  const spotMyr = Number(getSettingVal('fx_spot_myr_idr', '0')) || 0;
  const spotSgd = Number(getSettingVal('fx_spot_sgd_idr', '0')) || 0;
  const fxSource = getSettingVal('fx_source', 'ECB (Frankfurter)');
  const fxLastSynced = getSettingVal('fx_last_synced_at', '');

  const previewAutoRates = useMemo(() => {
    if (spotRmb <= 0 || spotMyr <= 0 || spotSgd <= 0) return null;
    return computeEffectiveRates(
      { rmb: spotRmb, myr: spotMyr, sgd: spotSgd },
      spreadPercent,
      spreadFlat
    );
  }, [spotRmb, spotMyr, spotSgd, spreadPercent, spreadFlat]);

  const nonFxSettings = useMemo(
    () => settingsRows.filter((r) => !FX_KEYS.has(r.key)),
    [settingsRows]
  );

  const handleSyncFxNow = async () => {
    setSyncingFx(true);
    try {
      const res = await fetch('/api/admin/fx-sync', { method: 'POST' });
      const data = (await res.json()) as {
        settings?: ImpSettingRow[];
        source?: string;
        error?: string;
      };
      if (!res.ok) {
        showNotice('err', data.error || 'Gagal menyinkronkan kurs pasar.');
        return;
      }
      if (data.settings) {
        setSettingsRows(data.settings);
      }
      showNotice(
        'ok',
        `Kurs pasar berhasil disinkronkan dari ${data.source || 'API pasar'}.`
      );
    } catch {
      showNotice('err', 'Koneksi bermasalah saat menyinkronkan kurs pasar.');
    } finally {
      setSyncingFx(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingId('umum');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'settings',
          items: settingsRows.map((r) => ({ key: r.key, value: r.value })),
        }),
      });
      const data = (await res.json()) as {
        settings?: ImpSettingRow[];
        error?: string;
      };
      if (res.ok) {
        if (data.settings) setSettingsRows(data.settings);
        showNotice('ok', 'Pengaturan umum dan kurs valas berhasil disimpan.');
      } else {
        showNotice('err', data.error || 'Gagal menyimpan pengaturan.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveRate = async (rate: ShippingRate) => {
    setSavingId(rate.id);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rate', ...rate }),
      });
      if (res.ok) {
        showNotice(
          'ok',
          `Tarif ${rate.origin_label} | ${rate.method_label} (${rate.category_label}) diperbarui.`
        );
      } else {
        showNotice('err', 'Gagal memperbarui tarif ongkir.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveDestination = async (dest: KalbarDestination) => {
    setSavingId(dest.id);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'destination', ...dest }),
      });
      if (res.ok) {
        showNotice('ok', `Tarif penerusan ${dest.city_name} diperbarui.`);
      } else {
        showNotice('err', 'Gagal memperbarui tarif kota Kalbar.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveWarehouse = async (wh: WarehouseInfo) => {
    setSavingId(wh.id);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'warehouse', ...wh }),
      });
      if (res.ok) {
        showNotice('ok', `Data ${wh.warehouse_name} diperbarui.`);
      } else {
        showNotice('err', 'Gagal memperbarui data gudang.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotice('err', 'Konfirmasi password baru tidak cocok.');
      return;
    }
    setSavingId('password');
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showNotice('err', data.error || 'Gagal mengganti password.');
      } else {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showNotice('ok', 'Password admin berhasil diperbarui.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const tabs: Array<{ id: TabKey; label: string; icon: typeof Coins }> = [
    { id: 'umum', label: 'Kurs, Fee & Kontak', icon: Coins },
    { id: 'tarif', label: 'Tarif Ongkir Rute', icon: Ship },
    { id: 'kota', label: 'Penerusan Kalbar', icon: MapPin },
    { id: 'gudang', label: 'Gudang Transit', icon: Warehouse },
    { id: 'password', label: 'Ganti Password', icon: KeyRound },
  ];

  const currencyRows: Array<{
    code: string;
    rateKey: 'rate_rmb_idr' | 'rate_myr_idr' | 'rate_sgd_idr';
    spot: number;
    autoPreview: number | null;
  }> = [
    {
      code: '1 RMB (Yuan China)',
      rateKey: 'rate_rmb_idr',
      spot: spotRmb,
      autoPreview: previewAutoRates?.rate_rmb_idr ?? null,
    },
    {
      code: '1 MYR (Ringgit Malaysia)',
      rateKey: 'rate_myr_idr',
      spot: spotMyr,
      autoPreview: previewAutoRates?.rate_myr_idr ?? null,
    },
    {
      code: '1 SGD (Dolar Singapura)',
      rateKey: 'rate_sgd_idr',
      spot: spotSgd,
      autoPreview: previewAutoRates?.rate_sgd_idr ?? null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">
          Tarif & Pengaturan Sistem
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Perubahan kurs, tarif ongkir, kota Kalbar, dan gudang langsung
          tercermin di website publik dan kalkulator.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Kategori pengaturan"
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] inline-flex items-center gap-2 px-4 rounded-lg text-xs font-bold border transition-colors ${
                active
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-teal'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-lg px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'ok'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {notice.msg}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-300 p-10 flex items-center justify-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-teal-dark" aria-hidden="true" />
          Memuat pengaturan...
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-slate-300 p-8 text-center space-y-3" role="alert">
          <p className="text-sm font-semibold text-rose-800">{loadError}</p>
          <button
            type="button"
            onClick={loadAll}
            className="min-h-[44px] px-4 rounded-lg bg-navy text-white text-xs font-bold"
          >
            Coba Muat Ulang
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'umum' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-300 p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-navy">
                      Pengaturan Kurs Valas (Auto API + Spread / Manual Override)
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sumber terakhir: <strong>{fxSource}</strong> · Sinkronisasi:{' '}
                      <span className="font-mono">
                        {fxLastSynced ? formatDateWib(fxLastSynced) : 'Belum pernah'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncFxNow}
                    disabled={syncingFx}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-bold px-4 text-xs transition-colors"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${syncingFx ? 'animate-spin' : ''}`}
                      aria-hidden="true"
                    />
                    {syncingFx ? 'Menyinkronkan...' : 'Sinkronkan Kurs Pasar Sekarang'}
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-navy mb-2">
                    Mode Penentuan Kurs Transaksi
                  </p>
                  <div
                    role="radiogroup"
                    aria-label="Mode kurs valas"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={fxMode === 'auto'}
                      onClick={() => setSettingVal('fx_mode', 'auto')}
                      className={`text-left min-h-[56px] p-3.5 rounded-lg border transition-colors ${
                        fxMode === 'auto'
                          ? 'bg-teal-50 border-teal text-navy ring-1 ring-teal'
                          : 'bg-paper border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="text-sm font-bold">
                        Otomatis (Kurs Pasar API + Margin Spread)
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Refresh otomatis tiap 6 jam dari Frankfurter ECB / ExchangeRate-API.
                      </div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={fxMode === 'manual'}
                      onClick={() => setSettingVal('fx_mode', 'manual')}
                      className={`text-left min-h-[56px] p-3.5 rounded-lg border transition-colors ${
                        fxMode === 'manual'
                          ? 'bg-teal-50 border-teal text-navy ring-1 ring-teal'
                          : 'bg-paper border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="text-sm font-bold">
                        Manual (Override Penuh oleh Admin)
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Kurs tidak berubah otomatis; gunakan angka tetap yang Anda input.
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fx-spread-percent"
                      className="block text-xs font-bold text-navy mb-1"
                    >
                      Margin Spread Operasional (%)
                    </label>
                    <input
                      id="fx-spread-percent"
                      type="number"
                      step="0.1"
                      min="0"
                      value={getSettingVal('fx_spread_percent', '1.5')}
                      onChange={(e) =>
                        setSettingVal('fx_spread_percent', e.target.value)
                      }
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fx-spread-flat"
                      className="block text-xs font-bold text-navy mb-1"
                    >
                      Markup Tambahan Flat (IDR per 1 unit valas)
                    </label>
                    <input
                      id="fx-spread-flat"
                      type="number"
                      step="1"
                      min="0"
                      value={getSettingVal('fx_spread_flat_idr', '0')}
                      onChange={(e) =>
                        setSettingVal('fx_spread_flat_idr', e.target.value)
                      }
                      className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-300">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-paper border-b border-slate-300 font-bold text-navy">
                        <th className="px-4 py-3">Mata Uang</th>
                        <th className="px-4 py-3">Kurs Spot Pasar</th>
                        <th className="px-4 py-3">
                          Kurs Transaksi Aktif (IDR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currencyRows.map((c) => {
                        const manualVal = getSettingVal(c.rateKey, '0');
                        const displayAuto =
                          c.autoPreview !== null
                            ? c.autoPreview
                            : Number(manualVal) || 0;
                        return (
                          <tr key={c.rateKey}>
                            <td className="px-4 py-3 font-bold text-navy">
                              {c.code}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-700">
                              {c.spot > 0 ? formatIdr(c.spot) : 'Belum disinkronkan'}
                            </td>
                            <td className="px-4 py-3">
                              {fxMode === 'manual' ? (
                                <input
                                  type="number"
                                  min="1"
                                  aria-label={`Kurs manual ${c.code}`}
                                  value={manualVal}
                                  onChange={(e) =>
                                    setSettingVal(c.rateKey, e.target.value)
                                  }
                                  className="w-36 min-h-[40px] rounded-md border border-slate-300 px-3 py-1.5 font-mono font-bold text-navy focus:border-teal"
                                />
                              ) : (
                                <div className="font-mono font-bold text-teal-dark text-sm">
                                  {formatIdr(displayAuto)}{' '}
                                  <span className="text-xs font-sans font-normal text-slate-600">
                                    (Spot + {spreadPercent}%
                                    {spreadFlat > 0
                                      ? ` + ${formatIdr(spreadFlat)}`
                                      : ''}
                                    )
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-300 p-6 space-y-5">
                <h2 className="text-base font-extrabold text-navy">
                  Biaya Jasa, WhatsApp Admin & Profil Perusahaan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nonFxSettings.map((row) => (
                    <div key={row.key}>
                      <label
                        htmlFor={`setting-${row.key}`}
                        className="block text-xs font-bold text-navy mb-1"
                      >
                        {row.label}
                      </label>
                      <input
                        id={`setting-${row.key}`}
                        type="text"
                        value={row.value}
                        onChange={(e) => setSettingVal(row.key, e.target.value)}
                        className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-teal"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingId === 'umum'}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-5 text-xs transition-colors"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {savingId === 'umum'
                      ? 'Menyimpan...'
                      : 'Simpan Pengaturan Umum & Kurs'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'tarif' && (
            <div className="bg-white rounded-xl border border-slate-300 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-paper border-b border-slate-300 font-bold text-navy">
                    <th className="px-4 py-3">Rute & Kategori</th>
                    <th className="px-3 py-3">Unit</th>
                    <th className="px-3 py-3">Tarif (IDR)</th>
                    <th className="px-3 py-3">Min Charge</th>
                    <th className="px-3 py-3">ETA Min</th>
                    <th className="px-3 py-3">ETA Max</th>
                    <th className="px-3 py-3">Aktif</th>
                    <th className="px-4 py-3 text-right">Simpan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rates.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-navy">
                          {r.origin_label} ({r.method_label})
                        </div>
                        <div className="text-slate-600">{r.category_label}</div>
                      </td>
                      <td className="px-3 py-3 font-mono uppercase font-bold">
                        {r.unit}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          aria-label={`Tarif IDR ${r.origin_label} ${r.method_label} ${r.category_label}`}
                          value={r.rate_idr}
                          onChange={(e) => {
                            const copy = [...rates];
                            copy[idx] = { ...r, rate_idr: Number(e.target.value) };
                            setRates(copy);
                          }}
                          className="w-28 min-h-[38px] rounded-md border border-slate-300 px-2.5 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.1"
                          aria-label={`Min charge ${r.origin_label} ${r.category_label}`}
                          value={r.min_charge}
                          onChange={(e) => {
                            const copy = [...rates];
                            copy[idx] = {
                              ...r,
                              min_charge: Number(e.target.value),
                            };
                            setRates(copy);
                          }}
                          className="w-20 min-h-[38px] rounded-md border border-slate-300 px-2 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          aria-label={`ETA minimal ${r.origin_label} ${r.category_label}`}
                          value={r.eta_min_days}
                          onChange={(e) => {
                            const copy = [...rates];
                            copy[idx] = {
                              ...r,
                              eta_min_days: Number(e.target.value),
                            };
                            setRates(copy);
                          }}
                          className="w-16 min-h-[38px] rounded-md border border-slate-300 px-2 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          aria-label={`ETA maksimal ${r.origin_label} ${r.category_label}`}
                          value={r.eta_max_days}
                          onChange={(e) => {
                            const copy = [...rates];
                            copy[idx] = {
                              ...r,
                              eta_max_days: Number(e.target.value),
                            };
                            setRates(copy);
                          }}
                          className="w-16 min-h-[38px] rounded-md border border-slate-300 px-2 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Aktifkan tarif ${r.origin_label} ${r.category_label}`}
                          checked={r.is_active}
                          onChange={(e) => {
                            const copy = [...rates];
                            copy[idx] = { ...r, is_active: e.target.checked };
                            setRates(copy);
                          }}
                          className="h-4 w-4 rounded text-teal"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveRate(r)}
                          disabled={savingId === r.id}
                          className="min-h-[38px] rounded-md bg-navy hover:bg-navy-light text-white font-bold px-3"
                        >
                          {savingId === r.id ? '...' : 'Simpan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'kota' && (
            <div className="bg-white rounded-xl border border-slate-300 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-paper border-b border-slate-300 font-bold text-navy">
                    <th className="px-4 py-3">Kota / Kabupaten Kalbar</th>
                    <th className="px-3 py-3">Biaya Flat (IDR)</th>
                    <th className="px-3 py-3">Tambahan / Kg (IDR)</th>
                    <th className="px-3 py-3">Extra ETA (Hari)</th>
                    <th className="px-3 py-3">Aktif</th>
                    <th className="px-4 py-3 text-right">Simpan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {destinations.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-navy">
                        {d.city_name}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          aria-label={`Biaya flat ${d.city_name}`}
                          value={d.extra_fee_flat}
                          onChange={(e) => {
                            const copy = [...destinations];
                            copy[idx] = {
                              ...d,
                              extra_fee_flat: Number(e.target.value),
                            };
                            setDestinations(copy);
                          }}
                          className="w-28 min-h-[38px] rounded-md border border-slate-300 px-2.5 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          aria-label={`Tambahan per kg ${d.city_name}`}
                          value={d.extra_fee_per_kg}
                          onChange={(e) => {
                            const copy = [...destinations];
                            copy[idx] = {
                              ...d,
                              extra_fee_per_kg: Number(e.target.value),
                            };
                            setDestinations(copy);
                          }}
                          className="w-24 min-h-[38px] rounded-md border border-slate-300 px-2.5 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          aria-label={`Tambahan ETA ${d.city_name}`}
                          value={d.extra_eta_days}
                          onChange={(e) => {
                            const copy = [...destinations];
                            copy[idx] = {
                              ...d,
                              extra_eta_days: Number(e.target.value),
                            };
                            setDestinations(copy);
                          }}
                          className="w-16 min-h-[38px] rounded-md border border-slate-300 px-2 py-1.5 font-mono"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Aktifkan ${d.city_name}`}
                          checked={d.is_active}
                          onChange={(e) => {
                            const copy = [...destinations];
                            copy[idx] = { ...d, is_active: e.target.checked };
                            setDestinations(copy);
                          }}
                          className="h-4 w-4 rounded text-teal"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveDestination(d)}
                          disabled={savingId === d.id}
                          className="min-h-[38px] rounded-md bg-navy hover:bg-navy-light text-white font-bold px-3"
                        >
                          {savingId === d.id ? '...' : 'Simpan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'gudang' && (
            <div className="space-y-4">
              {warehouses.map((wh, idx) => (
                <div
                  key={wh.id}
                  className="bg-white rounded-xl border border-slate-300 p-6 space-y-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-bold text-navy text-base uppercase">
                      Gudang {wh.origin_country} ({wh.city})
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleSaveWarehouse(wh)}
                      disabled={savingId === wh.id}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-4 text-xs"
                    >
                      <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      {savingId === wh.id ? 'Menyimpan...' : 'Simpan Gudang'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`wh-name-${wh.id}`}
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        Nama Gudang
                      </label>
                      <input
                        id={`wh-name-${wh.id}`}
                        type="text"
                        value={wh.warehouse_name}
                        onChange={(e) => {
                          const copy = [...warehouses];
                          copy[idx] = { ...wh, warehouse_name: e.target.value };
                          setWarehouses(copy);
                        }}
                        className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Telepon & Kode Pos
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          aria-label={`Telepon gudang ${wh.origin_country}`}
                          value={wh.phone}
                          onChange={(e) => {
                            const copy = [...warehouses];
                            copy[idx] = { ...wh, phone: e.target.value };
                            setWarehouses(copy);
                          }}
                          className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                        />
                        <input
                          type="text"
                          aria-label={`Kode pos gudang ${wh.origin_country}`}
                          value={wh.postal_code}
                          onChange={(e) => {
                            const copy = [...warehouses];
                            copy[idx] = { ...wh, postal_code: e.target.value };
                            setWarehouses(copy);
                          }}
                          className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`wh-local-${wh.id}`}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Alamat Lokal (gunakan [MARKING_CODE] sebagai placeholder)
                    </label>
                    <textarea
                      id={`wh-local-${wh.id}`}
                      rows={2}
                      value={wh.address_local}
                      onChange={(e) => {
                        const copy = [...warehouses];
                        copy[idx] = { ...wh, address_local: e.target.value };
                        setWarehouses(copy);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`wh-eng-${wh.id}`}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Alamat Bahasa Inggris
                    </label>
                    <textarea
                      id={`wh-eng-${wh.id}`}
                      rows={2}
                      value={wh.address_english}
                      onChange={(e) => {
                        const copy = [...warehouses];
                        copy[idx] = { ...wh, address_english: e.target.value };
                        setWarehouses(copy);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`wh-notes-${wh.id}`}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Catatan / Instruksi Packing
                    </label>
                    <textarea
                      id={`wh-notes-${wh.id}`}
                      rows={2}
                      value={wh.notes || ''}
                      onChange={(e) => {
                        const copy = [...warehouses];
                        copy[idx] = { ...wh, notes: e.target.value };
                        setWarehouses(copy);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'password' && (
            <form
              onSubmit={handleChangePassword}
              className="bg-white rounded-xl border border-slate-300 p-6 max-w-md space-y-4"
            >
              <div>
                <label
                  htmlFor="pwd-current"
                  className="block text-xs font-bold text-navy mb-1"
                >
                  Password Saat Ini
                </label>
                <input
                  id="pwd-current"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="pwd-new"
                  className="block text-xs font-bold text-navy mb-1"
                >
                  Password Baru (Min. 8 karakter)
                </label>
                <input
                  id="pwd-new"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="pwd-confirm"
                  className="block text-xs font-bold text-navy mb-1"
                >
                  Ulangi Password Baru
                </label>
                <input
                  id="pwd-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={savingId === 'password'}
                className="min-h-[44px] rounded-lg bg-navy hover:bg-navy-light text-white font-bold px-5 text-xs"
              >
                {savingId === 'password'
                  ? 'Memperbarui...'
                  : 'Perbarui Password Admin'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
