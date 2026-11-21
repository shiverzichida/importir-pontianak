'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
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

export interface CalculatorScenarioPreset {
  originCountry: OriginCountry;
  shippingMethod: ShippingMethod;
  unit: RateUnit;
  cargoCategory: CargoCategory;
  actualWeightKg: string;
  directCbm: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  colliCount: string;
  destinationCity: string;
  includeGoodsValue: boolean;
  goodsValueForeign: string;
  quantity: string;
  nonce: number;
}

interface CalculatorSectionProps {
  rates: ShippingRate[];
  destinations: KalbarDestination[];
  settings: PublicSettings;
  scenarioPreset?: CalculatorScenarioPreset | null;
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
  scenarioPreset,
  onApplyToRfq,
}: CalculatorSectionProps) {
  const [originCountry, setOriginCountry] = useState<OriginCountry>('china');

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

  useEffect(() => {
    if (!scenarioPreset) return;
    setOriginCountry(scenarioPreset.originCountry);
    setSelectedRouteKey(`${scenarioPreset.shippingMethod}:${scenarioPreset.unit}`);
    setCargoCategory(scenarioPreset.cargoCategory);
    setActualWeightKg(scenarioPreset.actualWeightKg);
    setDirectCbm(scenarioPreset.directCbm);
    setLengthCm(scenarioPreset.lengthCm);
    setWidthCm(scenarioPreset.widthCm);
    setHeightCm(scenarioPreset.heightCm);
    setColliCount(scenarioPreset.colliCount);
    setUseDimForCbm(false);
    setDestinationCity(scenarioPreset.destinationCity);
    setIncludeGoodsValue(scenarioPreset.includeGoodsValue);
    setGoodsValueForeign(scenarioPreset.goodsValueForeign);
    setQuantity(scenarioPreset.quantity);
  }, [scenarioPreset]);

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
    if (method === 'udara') return <Plane className="h-4 w-4" aria-hidden="true" />;
    if (method === 'darat') return <Truck className="h-4 w-4" aria-hidden="true" />;
    return <Ship className="h-4 w-4" aria-hidden="true" />;
  };

  return (
    <section id="kalkulator" className="py-16 lg:py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Kalkulator Impor All-In ke Pontianak & Kalimantan Barat
          </h2>
          <p className="mt-3 text-slate-700 text-base">
            Hitung estimasi ongkos kirim internasional, pengurusan bea cukai,
            penerusan kabupaten Kalbar, hingga HPP per unit dalam satu rincian
            transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-paper rounded-xl border border-slate-300 p-5 sm:p-7 space-y-6">
            <div>
              <p className="block text-sm font-bold text-navy mb-2.5">
                1. Pilih Negara Asal Pengiriman
              </p>
              <div
                role="radiogroup"
                aria-label="Negara asal pengiriman"
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
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
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleOriginChange(item.id)}
                      className={`text-left min-h-[56px] p-3.5 rounded-lg border transition-colors ${
                        active
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-teal'
                      }`}
                    >
                      <div className="font-bold text-sm">{item.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          active ? 'text-teal-300' : 'text-slate-600'
                        }`}
                      >
                        {item.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="block text-sm font-bold text-navy mb-2.5">
                2. Pilih Jalur Pengiriman
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {routeOptions.map((opt) => {
                  const active = activeRoute?.key === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedRouteKey(opt.key)}
                      className={`flex items-start gap-3 text-left min-h-[64px] p-3.5 rounded-lg border transition-colors ${
                        active
                          ? 'bg-teal-50 border-teal text-navy ring-1 ring-teal'
                          : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md shrink-0 ${
                          active
                            ? 'bg-teal text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {methodIcon(opt.shipping_method)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-snug">
                          {opt.method_label}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Satuan: <strong className="uppercase">{opt.unit}</strong> · Min{' '}
                          {opt.min_charge} {opt.unit.toUpperCase()} · ETA {opt.eta_min_days}–
                          {opt.eta_max_days} hari
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="calc-cargo-category"
                  className="block text-sm font-bold text-navy mb-2"
                >
                  3. Kategori Barang
                </label>
                <select
                  id="calc-cargo-category"
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal"
                >
                  <option value="general">General Cargo (Barang Umum)</option>
                  <option value="fashion">Fashion, Tas, Sepatu & Tekstil</option>
                  <option value="elektronik">Elektronik / Mesin Ringan</option>
                  <option value="khusus">Lartas / Kosmetik / Khusus</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="calc-destination-city"
                  className="block text-sm font-bold text-navy mb-2"
                >
                  4. Tujuan di Kalimantan Barat
                </label>
                <div className="relative">
                  <MapPin
                    className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                    aria-hidden="true"
                  />
                  <select
                    id="calc-destination-city"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-teal"
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

            <div className="bg-white rounded-lg border border-slate-300 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-navy">
                  {activeRoute?.unit === 'cbm' ? (
                    <Box className="h-4 w-4 text-teal-dark" aria-hidden="true" />
                  ) : (
                    <Scale className="h-4 w-4 text-teal-dark" aria-hidden="true" />
                  )}
                  5. Berat & Dimensi Kargo (
                  {activeRoute?.unit === 'cbm' ? 'Satuan CBM' : 'Satuan Kg'})
                </div>
                {activeRoute?.unit === 'cbm' && (
                  <button
                    type="button"
                    onClick={() => setUseDimForCbm((prev) => !prev)}
                    className="min-h-[36px] px-2 text-xs font-bold text-teal-dark hover:underline"
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
                    <label
                      htmlFor="calc-direct-cbm"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Estimasi Volume (CBM / m³)
                    </label>
                    <input
                      id="calc-direct-cbm"
                      type="number"
                      step="0.01"
                      min="0"
                      value={directCbm}
                      onChange={(e) => setDirectCbm(e.target.value)}
                      className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="calc-actual-weight"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Perkiraan Berat Total (Kg, untuk ongkir lokal Kalbar)
                    </label>
                    <input
                      id="calc-actual-weight"
                      type="number"
                      step="0.5"
                      min="0"
                      value={actualWeightKg}
                      onChange={(e) => setActualWeightKg(e.target.value)}
                      className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {activeRoute?.unit === 'kg' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="calc-actual-weight"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Berat Aktual Total (Kg)
                        </label>
                        <input
                          id="calc-actual-weight"
                          type="number"
                          step="0.5"
                          min="0"
                          value={actualWeightKg}
                          onChange={(e) => setActualWeightKg(e.target.value)}
                          className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="calc-colli-count"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Jumlah Koli / Dus
                        </label>
                        <input
                          id="calc-colli-count"
                          type="number"
                          min="1"
                          value={colliCount}
                          onChange={(e) => setColliCount(e.target.value)}
                          className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label
                        htmlFor="calc-length"
                        className="block text-xs font-medium text-slate-700 mb-1"
                      >
                        Panjang (cm)
                      </label>
                      <input
                        id="calc-length"
                        type="number"
                        min="0"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(e.target.value)}
                        className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="calc-width"
                        className="block text-xs font-medium text-slate-700 mb-1"
                      >
                        Lebar (cm)
                      </label>
                      <input
                        id="calc-width"
                        type="number"
                        min="0"
                        value={widthCm}
                        onChange={(e) => setWidthCm(e.target.value)}
                        className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="calc-height"
                        className="block text-xs font-medium text-slate-700 mb-1"
                      >
                        Tinggi (cm)
                      </label>
                      <input
                        id="calc-height"
                        type="number"
                        min="0"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                      />
                    </div>
                    {activeRoute?.unit === 'cbm' && (
                      <div>
                        <label
                          htmlFor="calc-colli-count"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Jumlah Koli
                        </label>
                        <input
                          id="calc-colli-count"
                          type="number"
                          min="1"
                          value={colliCount}
                          onChange={(e) => setColliCount(e.target.value)}
                          className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {result && result.unit === 'kg' && (
                <div
                  className={`flex items-start gap-2 rounded-md px-3 py-2.5 text-xs ${
                    result.isVolumetricApplied
                      ? 'bg-amber-50 text-amber-950 border border-amber-300'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Berat aktual: <strong>{result.actualWeightKg} kg</strong> · Berat
                    volumetrik (P×L×T/{result.matchedRate.volumetric_divisor} × koli):{' '}
                    <strong>{result.volumetricWeightKg} kg</strong>.{' '}
                    {result.isVolumetricApplied
                      ? 'Perhitungan memakai berat volumetrik karena lebih besar dari berat timbangan.'
                      : 'Perhitungan memakai berat aktual atau minimum charge.'}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-slate-300 p-4 space-y-3">
              <label
                htmlFor="calc-include-goods"
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <span className="block text-sm font-bold text-navy">
                    6. Sertakan Harga Barang (Hitung Estimasi HPP All-In)
                  </span>
                  <span className="block text-xs text-slate-600">
                    Hitung modal barang ({currency}) ditambah fee titip beli{' '}
                    {settings.sourcing_fee_percent}%.
                  </span>
                </div>
                <input
                  id="calc-include-goods"
                  type="checkbox"
                  checked={includeGoodsValue}
                  onChange={(e) => setIncludeGoodsValue(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-400 text-teal focus:ring-teal shrink-0"
                />
              </label>

              {includeGoodsValue && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <label
                      htmlFor="calc-goods-value"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Total Harga Barang di Supplier ({currency})
                    </label>
                    <input
                      id="calc-goods-value"
                      type="number"
                      min="0"
                      value={goodsValueForeign}
                      onChange={(e) => setGoodsValueForeign(e.target.value)}
                      className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="calc-quantity"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Total Kuantitas Barang (Pcs / Unit)
                    </label>
                    <input
                      id="calc-quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full min-h-[44px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-teal"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="rounded-xl bg-navy text-white p-6 sm:p-7 shadow-lg border border-navy-light">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/15">
                <div>
                  <span className="text-xs font-semibold text-teal-300">
                    Rincian Estimasi Biaya All-In
                  </span>
                  <h3 className="text-xl font-bold mt-0.5">
                    {result ? result.matchedRate.origin_label : 'Pilih Rute'}
                  </h3>
                </div>
                {result && (
                  <span className="px-2.5 py-1 rounded-md bg-navy-light border border-white/15 text-xs font-mono text-teal-200 shrink-0">
                    ETA {result.etaMinDays}–{result.etaMaxDays} Hari
                  </span>
                )}
              </div>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-lg bg-navy-light border border-white/10 p-3.5 text-xs space-y-1.5">
                    <div className="flex justify-between gap-2 text-slate-300">
                      <span>Jalur & Kategori:</span>
                      <span className="font-semibold text-white text-right">
                        {result.matchedRate.method_label} ({result.matchedRate.category_label})
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-slate-300">
                      <span>Tarif Dasar All-In:</span>
                      <span className="font-mono font-semibold text-teal-300">
                        {formatIdr(result.matchedRate.rate_idr)} /{' '}
                        {result.unit.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-slate-300">
                      <span>Kuantitas Tertagih:</span>
                      <span className="font-mono font-semibold text-white">
                        {formatNumberId(result.chargeableQty, 3)}{' '}
                        {result.unit.toUpperCase()} (Min {result.matchedRate.min_charge}{' '}
                        {result.unit.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-300">
                        Ongkir Internasional + Bea Cukai
                      </span>
                      <span className="font-mono font-semibold">
                        {formatIdr(result.internationalShippingIdr)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
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
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-300">
                            Harga Barang ({goodsValueForeign} {result.currency} ×{' '}
                            {formatIdr(result.fxRate)})
                          </span>
                          <span className="font-mono font-semibold">
                            {formatIdr(result.goodsValueIdr)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
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
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-navy-light border border-teal-400/40 px-3 py-2.5 text-xs">
                        <span className="text-teal-200 font-medium">
                          Estimasi HPP per Unit ({quantity} pcs):
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {formatIdr(result.hppPerUnitIdr)} / pcs
                        </span>
                      </div>
                    )}
                  </div>

                  {result.matchedRate.notes && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Catatan rute: {result.matchedRate.notes}
                    </p>
                  )}

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleApplyToRfq}
                      className="w-full min-h-[48px] inline-flex items-center justify-center rounded-lg bg-teal hover:bg-teal-dark text-white font-bold px-4 text-sm transition-colors"
                    >
                      Lanjutkan ke Form RFQ dengan Estimasi Ini
                    </button>
                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-navy-light hover:bg-white/15 text-white font-semibold px-4 text-xs border border-white/20 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-teal-300" aria-hidden="true" />
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
