'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  KeyRound,
  Loader2,
  MapPin,
  Save,
  Ship,
  Warehouse,
} from 'lucide-react';
import type {
  ImpSettingRow,
  KalbarDestination,
  ShippingRate,
  WarehouseInfo,
} from '@/lib/types';

type TabKey = 'umum' | 'tarif' | 'kota' | 'gudang' | 'password';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<TabKey>('umum');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [settingsRows, setSettingsRows] = useState<ImpSettingRow[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [destinations, setDestinations] = useState<KalbarDestination[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);

  const [savingId, setSavingId] = useState<string | null>(null);
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
    setTimeout(() => setNotice(null), 4000);
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
      if (res.ok) {
        showNotice('ok', 'Kurs, biaya jasa, & profil perusahaan berhasil disimpan.');
      } else {
        showNotice('err', 'Gagal menyimpan pengaturan.');
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
            <form
              onSubmit={handleSaveGeneral}
              className="bg-white rounded-xl border border-slate-300 p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settingsRows.map((row, idx) => (
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
                      onChange={(e) => {
                        const copy = [...settingsRows];
                        copy[idx] = { ...row, value: e.target.value };
                        setSettingsRows(copy);
                      }}
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
                  {savingId === 'umum' ? 'Menyimpan...' : 'Simpan Pengaturan Umum'}
                </button>
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
