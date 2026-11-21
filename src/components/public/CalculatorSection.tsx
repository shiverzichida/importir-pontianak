'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Box,
  Calculator,
  Info,
  MapPin,
  MessageCircle,
  Plane,
  Scale,
  Ship,
  Truck,
} from 'lucide-react';
import {
  calculateImportEstimate,
  getCurrencyForOrigin,
} from '@/lib/calculator';
import {
  buildWhatsAppUrl,
  CATEGORY_LABELS,
  formatIdr,
  formatNumberId,
  ORIGIN_LABELS,
} from '@/lib/format';
import type {
  CalculatorPrefill,
  CargoCategory,
  KalbarDestination,
  OriginCountry,
  PublicSettings,
  RateUnit,
  ShippingMethod,
  ShippingRate,
} from '@/lib/types';

interface CalculatorSectionProps {
  rates: ShippingRate[];
  destinations: KalbarDestination[];
  settings: PublicSettings;
  onApplyToRfq: (prefill: CalculatorPrefill) => void;
}

interface RouteOption {
  key: string;
  shipping_method: ShippingMethod;
  unit: RateUnit;
  method_label: string;
  eta_min_days: number;
  eta_max_days: number;
  min_charge: number;
}

export default function CalculatorSection({
  rates,
  destinations,
  settings,
  onApplyToRfq,
}: CalculatorSectionProps) {
  const [originCountry, setOriginCountry] = useState<OriginCountry>('china');

  // Available unique route options (method + unit) for selected origin
  const routeOptions = useMemo<RouteOption[]>(() => {
    const map = new Map<string, RouteOption>();
    for (const r of rates) {
      if (!r.is_active || r.origin_country !== originCountry) continue;
      const key = `${r.shipping_method}:${r.unit}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          shipping_method: r.shipping_method,
          unit: r.unit,
          method_label: r.method_label,
          eta_min_days: r.eta_min_days,
          eta_max_days: r.eta_max_days,
          min_charge: Number(r.min_charge),
        });
      }
    }
    return Array.from(map.values());
  }, [rates, originCountry]);

  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('laut:cbm');
  const activeRoute = useMemo(() => {
    return (
      routeOptions.find((opt) => opt.key === selectedRouteKey) ||
      routeOptions[0] ||
      null
    );
  }, [routeOptions, selectedRouteKey]);

  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('general');
  const [actualWeightKg, setActualWeightKg] = useState<string>('15');
  const [directCbm, setDirectCbm] = useState<string>('0.35');
  const [lengthCm, setLengthCm] = useState<string>('50');
  const [widthCm, setWidthCm] = useState<string>('40');
  const [heightCm, setHeightCm] = useState<string>('35');
  const [colliCount, setColliCount] = useState<string>('2');
  const [useDimForCbm, setUseDimForCbm] = useState<boolean>(false);

  const [destinationCity, setDestinationCity] = useState<string>(
    destinations[0]?.city_name || 'Pontianak (Ambil di Gudang)'
  );
  const [includeGoodsValue, setIncludeGoodsValue] = useState<boolean>(true);
  const [goodsValueForeign, setGoodsValueForeign] = useState<string>('1800');
  const [quantity, setQuantity] = useState<string>('50');

  const handleOriginChange = (nextOrigin: OriginCountry) => {
    setOriginCountry(nextOrigin);
    const firstOpt = rates.find(
      (r) => r.is_active && r.origin_country === nextOrigin
    );
    if (firstOpt) {
      setSelectedRouteKey(`${firstOpt.shipping_method}:${firstOpt.unit}`);
    }
  };

  const result = useMemo(() => {
    if (!activeRoute) return null;
    return calculateImportEstimate(
      {
        originCountry,
        shippingMethod: activeRoute.shipping_method,
        unit: activeRoute.unit,
        cargoCategory,
        actualWeightKg: Number(actualWeightKg) || 0,
        lengthCm: Number(lengthCm) || 0,
        widthCm: Number(widthCm) || 0,
        heightCm: Number(heightCm) || 0,
        colliCount: Number(colliCount) || 1,
        directCbm: useDimForCbm ? 0 : Number(directCbm) || 0,
        destinationCity,
        includeGoodsValue,
        goodsValueForeign: Number(goodsValueForeign) || 0,
        quantity: Number(quantity) || 0,
      },
      rates,
      destinations,
      settings
    );
  }, [
    activeRoute,
    originCountry,
    cargoCategory,
    actualWeightKg,
    lengthCm,
    widthCm,
    heightCm,
    colliCount,
    useDimForCbm,
    directCbm,
    destinationCity,
    includeGoodsValue,
    goodsValueForeign,
    quantity,
    rates,
    destinations,
    settings,
  ]);

  const currency = getCurrencyForOrigin(originCountry);

  const handleApplyToRfq = () => {
    if (!result || !activeRoute) return;
    const prefill: CalculatorPrefill = {
      origin_country: originCountry,
      shipping_method: activeRoute.shipping_method,
      cargo_category: cargoCategory,
      destination_city: destinationCity,
      currency,
      estimated_goods_value:
        includeGoodsValue && Number(goodsValueForeign) > 0
          ? Number(goodsValueForeign)
          : undefined,
      quantity:
        includeGoodsValue && Number(quantity) > 0 ? Number(quantity) : 1,
      estimated_weight_kg:
        result.unit === 'kg'
          ? result.chargeableQty
          : Number(actualWeightKg) > 0
            ? Number(actualWeightKg)
            : undefined,
      estimated_cbm:
        result.unit === 'cbm'
          ? result.chargeableQty
          : result.calculatedCbm > 0
            ? result.calculatedCbm
            : undefined,
      estimated_total_idr: result.totalAllInIdr,
      summary_note: `Simulasi kalkulator: ${ORIGIN_LABELS[originCountry]} (${activeRoute.method_label}), ${result.chargeableQty} ${result.unit.toUpperCase()}, tujuan ${destinationCity}. Estimasi total ${formatIdr(result.totalAllInIdr)}.`,
    };
    onApplyToRfq(prefill);
  };

  const whatsappDirectUrl = useMemo(() => {
    if (!result || !activeRoute) return '#';
    const text = [
      `Halo Admin ${settings.company_name}, saya ingin konsultasi estimasi kalkulator:`,
      `- Asal: ${ORIGIN_LABELS[originCountry]}`,
      `- Jalur: ${activeRoute.method_label}`,
      `- Kategori: ${CATEGORY_LABELS[cargoCategory]}`,
      `- Kuantitas Tertagih: ${result.chargeableQty} ${result.unit.toUpperCase()}`,
      `- Tujuan: ${destinationCity}`,
      `- Estimasi All-In: ${formatIdr(result.totalAllInIdr)}`,
    ].join('\n');
    return buildWhatsAppUrl(settings.whatsapp_admin, text);
  }, [
    result,
    activeRoute,
    settings.company_name,
    settings.whatsapp_admin,
    originCountry,
    cargoCategory,
    destinationCity,
  ]);

  const methodIcon = (method: ShippingMethod) => {
    if (method === 'udara') return <Plane className="h-4 w-4" />;
    if (method === 'darat') return <Truck className="h-4 w-4" />;
    return <Ship className="h-4 w-4" />;
  };

  return (
    <section id="kalkulator" className="py-16 lg:py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3 border border-teal-200">
            <Calculator className="h-3.5 w-3.5" />
            Kalkulator Impor All-In Pontianak & Kalbar
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Hitung Estimasi Ongkir, Bea Cukai & HPP Langsung ke Kota Anda
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Tidak perlu menebak biaya double-shipping Jakarta–Kalbar. Pilih negara
            asal, jalur (Udara / Laut LCL / Darat Entikong-Aruk), dimensi paket,
            hingga kota penerusan di Kalimantan Barat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Inputs */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-6">
            {/* Step 1: Origin Country */}
            <div>
              <label className="block text-sm font-bold text-navy mb-2.5">
                1. Pilih Negara Asal Pengiriman
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { id: 'china', label: 'China', sub: 'Guangzhou / Yiwu' },
                    { id: 'malaysia', label: 'Malaysia', sub: 'Kuching / KL' },
                    { id: 'singapura', label: 'Singapura', sub: 'Tuas / Changi' },
                  ] as const
                ).map((item) => {
                  const active = originCountry === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOriginChange(item.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <div className="font-bold text-sm">{item.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          active ? 'text-teal-300' : 'text-slate-500'
                        }`}
                      >
                        {item.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Shipping Mode */}
            <div>
              <label className="block text-sm font-bold text-navy mb-2.5">
                2. Pilih Jalur Pengiriman
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {routeOptions.map((opt) => {
                  const active = activeRoute?.key === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedRouteKey(opt.key)}
                      className={`flex items-start gap-3 text-left p-3.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-teal-50 border-teal-600 text-navy ring-1 ring-teal-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          active
                            ? 'bg-teal text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {methodIcon(opt.shipping_method)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-snug">
                          {opt.method_label}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Satuan: <strong className="uppercase">{opt.unit}</strong> • Min{' '}
                          {opt.min_charge} {opt.unit.toUpperCase()} • ETA {opt.eta_min_days}–
                          {opt.eta_max_days} hari
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Cargo Category & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy mb-2">
                  3. Kategori Barang
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="general">General Cargo (Barang Umum)</option>
                  <option value="fashion">Fashion, Tas, Sepatu & Tekstil</option>
                  <option value="elektronik">Elektronik / Mesin Ringan</option>
                  <option value="khusus">Lartas / Kosmetik / Khusus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-navy mb-2">
                  4. Tujuan di Kalimantan Barat
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.city_name}>
                        {d.city_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Weight / Dimensions / CBM */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-navy">
                  {activeRoute?.unit === 'cbm' ? (
                    <Box className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Scale className="h-4 w-4 text-teal-600" />
                  )}
                  5. Berat & Dimensi Kargo (
                  {activeRoute?.unit === 'cbm' ? 'Satuan CBM' : 'Satuan Kg'})
                </div>
                {activeRoute?.unit === 'cbm' && (
                  <button
                    type="button"
                    onClick={() => setUseDimForCbm((prev) => !prev)}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    {useDimForCbm
                      ? 'Input CBM langsung'
                      : 'Hitung CBM dari P × L × T cm'}
                  </button>
                )}
              </div>

              {activeRoute?.unit === 'cbm' && !useDimForCbm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Estimasi Volume (CBM / m³)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={directCbm}
                      onChange={(e) => setDirectCbm(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Perkiraan Berat Total (Kg — untuk ongkir lokal Kalbar)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={actualWeightKg}
                      onChange={(e) => setActualWeightKg(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {activeRoute?.unit === 'kg' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Berat Aktual Total (Kg)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={actualWeightKg}
                          onChange={(e) => setActualWeightKg(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Jumlah Koli / Dus
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={colliCount}
                          onChange={(e) => setColliCount(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Panjang (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Lebar (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={widthCm}
                        onChange={(e) => setWidthCm(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Tinggi (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    {activeRoute?.unit === 'cbm' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Jumlah Koli
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={colliCount}
                          onChange={(e) => setColliCount(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {result && result.unit === 'kg' && (
                <div
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                    result.isVolumetricApplied
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Berat aktual: <strong>{result.actualWeightKg} kg</strong> • Berat
                    volumetrik (P×L×T/{result.matchedRate.volumetric_divisor} × koli):{' '}
                    <strong>{result.volumetricWeightKg} kg</strong>.{' '}
                    {result.isVolumetricApplied
                      ? 'Perhitungan memakai berat volumetrik karena lebih besar dari berat timbangan.'
                      : 'Perhitungan memakai berat aktual / minimum charge.'}
                  </span>
                </div>
              )}
            </div>

            {/* Step 5: Optional Goods Value & HPP */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-navy">
                    6. Sertakan Harga Barang (Hitung Estimasi HPP & Titip Beli)
                  </div>
                  <div className="text-xs text-slate-500">
                    Aktifkan jika ingin menghitung modal barang ({currency}) + fee
                    titip beli {settings.sourcing_fee_percent}%.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeGoodsValue}
                  onChange={(e) => setIncludeGoodsValue(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </label>

              {includeGoodsValue && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Total Harga Barang di Supplier ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={goodsValueForeign}
                      onChange={(e) => setGoodsValueForeign(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Total Kuantitas Barang (Pcs / Unit)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Breakdown Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-navy text-white p-6 sm:p-7 shadow-xl border border-navy-light">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                    Rincian Estimasi Biaya All-In
                  </span>
                  <h3 className="text-xl font-bold mt-0.5">
                    {result ? result.matchedRate.origin_label : 'Pilih Rute'}
                  </h3>
                </div>
                {result && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-teal-200">
                    ETA {result.etaMinDays}–{result.etaMaxDays} Hari
                  </span>
                )}
              </div>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Jalur & Kategori:</span>
                      <span className="font-semibold text-white text-right">
                        {result.matchedRate.method_label} ({result.matchedRate.category_label})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tarif Dasar All-In:</span>
                      <span className="font-mono font-semibold text-teal-300">
                        {formatIdr(result.matchedRate.rate_idr)} /{' '}
                        {result.unit.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Kuantitas Tertagih:</span>
                      <span className="font-mono font-semibold text-white">
                        {formatNumberId(result.chargeableQty, 3)}{' '}
                        {result.unit.toUpperCase()} (Min {result.matchedRate.min_charge}{' '}
                        {result.unit.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">
                        Ongkir Internasional + Bea Cukai
                      </span>
                      <span className="font-mono font-semibold">
                        {formatIdr(result.internationalShippingIdr)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">
                        Penerusan ({result.destination?.city_name || destinationCity})
                      </span>
                      <span className="font-mono font-semibold">
                        {result.localKalbarFeeIdr === 0
                          ? 'Rp 0 (Ambil Gudang)'
                          : formatIdr(result.localKalbarFeeIdr)}
                      </span>
                    </div>

                    {includeGoodsValue && result.goodsValueIdr > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">
                            Harga Barang ({goodsValueForeign} {result.currency} ×{' '}
                            {formatIdr(result.fxRate)})
                          </span>
                          <span className="font-mono font-semibold">
                            {formatIdr(result.goodsValueIdr)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">
                            Fee Jasa Titip Beli ({settings.sourcing_fee_percent}%)
                          </span>
                          <span className="font-mono font-semibold">
                            {formatIdr(result.sourcingFeeIdr)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/15">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-slate-300">
                        Estimasi Total All-In
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-300">
                        {formatIdr(result.totalAllInIdr)}
                      </span>
                    </div>

                    {includeGoodsValue && result.hppPerUnitIdr !== null && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-teal-500/15 border border-teal-400/30 px-3 py-2 text-xs">
                        <span className="text-teal-200 font-medium">
                          Estimasi Modal / HPP per Unit ({quantity} pcs):
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {formatIdr(result.hppPerUnitIdr)} / pcs
                        </span>
                      </div>
                    )}
                  </div>

                  {result.matchedRate.notes && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Catatan rute: {result.matchedRate.notes}
                    </p>
                  )}

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleApplyToRfq}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal hover:bg-teal-light text-white font-bold py-3.5 px-4 text-sm shadow-lg transition"
                    >
                      Lanjutkan ke Form RFQ dengan Estimasi Ini
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 px-4 text-xs border border-white/15 transition"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />
                      Tanya Detail Tarif ke WhatsApp Admin
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-300 py-8">
                  Data tarif untuk kombinasi ini sedang diperbarui. Silakan pilih
                  jalur lain atau hubungi admin.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
