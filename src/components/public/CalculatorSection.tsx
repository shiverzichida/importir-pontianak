'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  MapPin,
  MessageCircle,
  Plane,
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
import { ShipIllustrationSvg } from './BrandLogo';

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

  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('udara:kg');
  const activeRoute = useMemo(() => {
    return (
      routeOptions.find((opt) => opt.key === selectedRouteKey) ||
      routeOptions[0] ||
      null
    );
  }, [routeOptions, selectedRouteKey]);

  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('general');
  const [actualWeightKg, setActualWeightKg] = useState<string>('5');
  const [directCbm, setDirectCbm] = useState<string>('0.35');
  const [lengthCm, setLengthCm] = useState<string>('');
  const [widthCm, setWidthCm] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [colliCount, setColliCount] = useState<string>('1');

  const [destinationCity, setDestinationCity] = useState<string>(
    destinations[0]?.city_name || 'Pontianak (Ambil di Gudang)'
  );
  const [includeGoodsValue, setIncludeGoodsValue] = useState<boolean>(false);
  const [goodsValueForeign, setGoodsValueForeign] = useState<string>('1500');
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
        directCbm: Number(directCbm) || 0,
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

  const shortRouteLabel = (opt: RouteOption) => {
    if (opt.shipping_method === 'udara') return 'Jalur Udara';
    if (opt.shipping_method === 'laut') return 'Jalur Laut';
    return opt.unit === 'cbm' ? 'Darat (CBM)' : 'Darat (Kg)';
  };

  return (
    <div
      id="kalkulator"
      className="scroll-mt-24 rounded-2xl bg-white border border-[#DCE6F5] shadow-md overflow-hidden"
    >
      {/* Blue gradient header matching reference */}
      <div className="bg-gradient-to-r from-[#0C2B6B] to-[#1748A8] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Calculator className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold leading-tight">
              Kalkulator Impor
            </h2>
            <p className="text-xs text-blue-100">
              Hitung estimasi biaya impor ke Pontianak dengan mudah
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold text-ink px-3.5 py-1.5 text-xs font-extrabold shadow-sm">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          Pontianak &amp; Kalbar
        </span>
      </div>

      {/* Main split body */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Inputs (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Origin selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'china', label: 'China' },
                  { id: 'malaysia', label: 'Malaysia / Kuching' },
                  { id: 'singapura', label: 'Singapura' },
                ] as const
              ).map((item) => {
                const active = originCountry === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOriginChange(item.id)}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-bold border transition-colors ${
                      active
                        ? 'bg-navy text-white border-navy'
                        : 'bg-brand-soft text-ink border-[#D4E2F6] hover:border-brand'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Shipping route segmented tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {routeOptions.map((opt) => {
                const active = activeRoute?.key === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedRouteKey(opt.key)}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      active
                        ? 'bg-brand text-white border-brand shadow-sm'
                        : 'bg-brand-soft text-ink border-[#D4E2F6] hover:border-brand'
                    }`}
                  >
                    {methodIcon(opt.shipping_method)}
                    <span>{shortRouteLabel(opt)}</span>
                  </button>
                );
              })}
            </div>

            {/* Weight / CBM + Dimensions (P x L x T) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                {activeRoute?.unit === 'cbm' ? (
                  <>
                    <label
                      htmlFor="calc-direct-cbm"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      Volume (CBM)
                    </label>
                    <input
                      id="calc-direct-cbm"
                      type="number"
                      step="0.01"
                      min="0"
                      value={directCbm}
                      onChange={(e) => setDirectCbm(e.target.value)}
                      placeholder="cth: 0.35"
                      className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                    />
                  </>
                ) : (
                  <>
                    <label
                      htmlFor="calc-actual-weight"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      Berat Barang (Kg)
                    </label>
                    <input
                      id="calc-actual-weight"
                      type="number"
                      step="0.5"
                      min="0"
                      value={actualWeightKg}
                      onChange={(e) => setActualWeightKg(e.target.value)}
                      placeholder="Masukkan berat..."
                      className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                    />
                  </>
                )}
              </div>

              <div className="sm:col-span-7">
                <span className="block text-xs font-bold text-ink mb-1.5">
                  Dimensi (P × L × T cm)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    id="calc-length"
                    type="number"
                    min="0"
                    aria-label="Panjang cm"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    placeholder="P"
                    className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-2.5 py-2 text-sm font-mono text-center text-ink"
                  />
                  <input
                    id="calc-width"
                    type="number"
                    min="0"
                    aria-label="Lebar cm"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    placeholder="L"
                    className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-2.5 py-2 text-sm font-mono text-center text-ink"
                  />
                  <input
                    id="calc-height"
                    type="number"
                    min="0"
                    aria-label="Tinggi cm"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="T"
                    className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-2.5 py-2 text-sm font-mono text-center text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Category & Kalbar Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="calc-cargo-category"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  Kategori Barang
                </label>
                <select
                  id="calc-cargo-category"
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                  className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-3 py-2 text-xs font-semibold text-ink"
                >
                  <option value="general">General Cargo</option>
                  <option value="fashion">Fashion &amp; Tekstil</option>
                  <option value="elektronik">Elektronik / Mesin</option>
                  <option value="khusus">Lartas / Khusus</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="calc-destination-city"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  Kota Tujuan Kalbar
                </label>
                <select
                  id="calc-destination-city"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full min-h-[42px] rounded-lg border border-[#D4E2F6] bg-white px-3 py-2 text-xs font-semibold text-ink"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.city_name}>
                      {d.city_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Goods Value Toggle */}
            <div className="rounded-xl bg-ice border border-[#DCE6F5] p-3 space-y-2.5">
              <label
                htmlFor="calc-include-goods"
                className="flex items-center justify-between gap-3 text-xs font-bold text-ink"
              >
                <span>
                  Hitung juga modal barang ({currency}) &amp; fee titip beli{' '}
                  {settings.sourcing_fee_percent}%
                </span>
                <input
                  id="calc-include-goods"
                  type="checkbox"
                  checked={includeGoodsValue}
                  onChange={(e) => setIncludeGoodsValue(e.target.checked)}
                  className="h-4 w-4 rounded border-[#B8CBE8] text-brand"
                />
              </label>

              {includeGoodsValue && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label
                      htmlFor="calc-goods-value"
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Nilai Barang ({currency})
                    </label>
                    <input
                      id="calc-goods-value"
                      type="number"
                      min="0"
                      value={goodsValueForeign}
                      onChange={(e) => setGoodsValueForeign(e.target.value)}
                      className="w-full min-h-[38px] rounded-lg border border-[#D4E2F6] bg-white px-2.5 py-1.5 text-xs font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="calc-quantity"
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Qty (Pcs)
                    </label>
                    <input
                      id="calc-quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full min-h-[38px] rounded-lg border border-[#D4E2F6] bg-white px-2.5 py-1.5 text-xs font-mono text-ink"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyToRfq}
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold px-4 text-sm shadow-sm transition-colors"
          >
            Ajukan Penawaran dengan Estimasi Ini
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Right Pale Blue Summary Panel (5 cols) */}
        <div className="md:col-span-5 rounded-2xl bg-[#EEF5FF] border border-[#D4E4FA] p-5 flex flex-col justify-between text-center">
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-ink">
              Estimasi Biaya (All-In)
            </div>

            {result ? (
              <>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-ink tracking-tight">
                  {formatIdr(result.totalAllInIdr)}
                </div>
                <div className="text-xs font-semibold text-brand">
                  ETA {result.etaMinDays}–{result.etaMaxDays} hari ·{' '}
                  {formatNumberId(result.chargeableQty, 3)}{' '}
                  {result.unit.toUpperCase()}
                  {result.isVolumetricApplied ? ' (Volumetrik)' : ''}
                </div>

                <div className="mt-3 rounded-xl bg-white/85 border border-[#D4E4FA] p-3 text-left text-[11px] space-y-1.5 text-slate-700">
                  <div className="flex justify-between gap-2">
                    <span>Ongkir Int&apos;l + Bea Cukai:</span>
                    <span className="font-mono font-bold text-ink">
                      {formatIdr(result.internationalShippingIdr)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Penerusan Kalbar:</span>
                    <span className="font-mono font-bold text-ink">
                      {result.localKalbarFeeIdr === 0
                        ? 'Rp 0'
                        : formatIdr(result.localKalbarFeeIdr)}
                    </span>
                  </div>
                  {includeGoodsValue && result.goodsValueIdr > 0 && (
                    <>
                      <div className="flex justify-between gap-2">
                        <span>
                          Barang ({goodsValueForeign} {result.currency}):
                        </span>
                        <span className="font-mono font-bold text-ink">
                          {formatIdr(result.goodsValueIdr)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Fee Titip Beli:</span>
                        <span className="font-mono font-bold text-ink">
                          {formatIdr(result.sourcingFeeIdr)}
                        </span>
                      </div>
                      {result.hppPerUnitIdr !== null && (
                        <div className="flex justify-between gap-2 pt-1 border-t border-[#DCE6F5] font-bold text-brand">
                          <span>HPP / pcs ({quantity}):</span>
                          <span className="font-mono">
                            {formatIdr(result.hppPerUnitIdr)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {includeGoodsValue && (
                    <div className="pt-1 text-[10px] text-slate-600">
                      Kurs:{' '}
                      {settings.fx_mode === 'manual'
                        ? 'Manual Admin'
                        : `${settings.fx_source} + spread`}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-4 text-xs text-slate-600">
                Tarif rute sedang diperbarui.
              </div>
            )}
          </div>

          <div className="pt-4 space-y-2">
            <ShipIllustrationSvg />
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Konsultasi Tarif via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
