'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Banknote,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Container,
  ExternalLink,
  MapPin,
  PlayCircle,
  Ship,
  ShoppingCart,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import { calculateImportEstimate } from '@/lib/calculator';
import { formatIdr, formatNumberId } from '@/lib/format';
import { getOptimizedImageUrl } from '@/lib/image';
import {
  catalogProductToPrefill,
  lclBatchToPrefill,
} from '@/lib/order-prefill';
import type {
  CalculatorPrefill,
  CatalogProduct,
  LclBatch,
  PublicConfig,
  ServiceType,
} from '@/lib/types';
import CalculatorSection, {
  type CalculatorScenarioPreset,
} from './CalculatorSection';
import ExplainerSection from './ExplainerSection';
import FaqSection from './FaqSection';
import { useLanguage } from './LanguageProvider';
import LclBatchSection from './LclBatchSection';
import Navbar from './Navbar';
import PublicFooter from './PublicFooter';
import RfqFormSection from './RfqFormSection';
import WarehouseSection from './WarehouseSection';

interface LandingClientProps {
  config: PublicConfig;
  featuredProducts?: CatalogProduct[];
  lclBatches?: LclBatch[];
  initialCatalogProduct?: CatalogProduct | null;
  initialLclBatch?: LclBatch | null;
}

const SCENARIO_SPECS: Array<{
  id: 'cn-lcl' | 'my-darat' | 'sg-udara';
  preset: Omit<CalculatorScenarioPreset, 'nonce'>;
}> = [
  {
    id: 'cn-lcl',
    preset: {
      originCountry: 'china',
      shippingMethod: 'laut',
      unit: 'cbm',
      cargoCategory: 'elektronik',
      actualWeightKg: '42',
      directCbm: '0.35',
      lengthCm: '',
      widthCm: '',
      heightCm: '',
      colliCount: '1',
      destinationCity: 'Pontianak (Kurir Dalam Kota)',
      includeGoodsValue: false,
      goodsValueForeign: '0',
      quantity: '1',
    },
  },
  {
    id: 'my-darat',
    preset: {
      originCountry: 'malaysia',
      shippingMethod: 'darat',
      unit: 'kg',
      cargoCategory: 'fashion',
      actualWeightKg: '25',
      directCbm: '0',
      lengthCm: '',
      widthCm: '',
      heightCm: '',
      colliCount: '1',
      destinationCity: 'Singkawang',
      includeGoodsValue: false,
      goodsValueForeign: '0',
      quantity: '1',
    },
  },
  {
    id: 'sg-udara',
    preset: {
      originCountry: 'singapura',
      shippingMethod: 'udara',
      unit: 'kg',
      cargoCategory: 'elektronik',
      actualWeightKg: '4',
      directCbm: '0',
      lengthCm: '',
      widthCm: '',
      heightCm: '',
      colliCount: '1',
      destinationCity: 'Pontianak (Ambil di Gudang)',
      includeGoodsValue: false,
      goodsValueForeign: '0',
      quantity: '1',
    },
  },
];

export default function LandingClient({
  config,
  featuredProducts = [],
  lclBatches = [],
  initialCatalogProduct = null,
  initialLclBatch = null,
}: LandingClientProps) {
  const { dict } = useLanguage();
  const router = useRouter();
  const defaultDest =
    config.destinations[0]?.city_name || 'Pontianak (Ambil di Gudang)';

  const toCatalogPrefill = (product: CatalogProduct): CalculatorPrefill =>
    catalogProductToPrefill(product, defaultDest);

  const toBatchPrefill = (batch: LclBatch): CalculatorPrefill =>
    lclBatchToPrefill(batch, defaultDest);

  const [quickResi, setQuickResi] = useState('');
  const [prefill, setPrefill] = useState<CalculatorPrefill | null>(() => {
    if (initialCatalogProduct) return toCatalogPrefill(initialCatalogProduct);
    if (initialLclBatch) return toBatchPrefill(initialLclBatch);
    return null;
  });
  const [serviceTrigger, setServiceTrigger] = useState<{
    service: ServiceType;
    nonce: number;
  } | null>(null);
  const [scenarioPreset, setScenarioPreset] =
    useState<CalculatorScenarioPreset | null>(null);
  const [explainerPlayNonce, setExplainerPlayNonce] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!initialCatalogProduct && !initialLclBatch) return;
    const timer = setTimeout(() => {
      const el = document.getElementById('rfq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [initialCatalogProduct, initialLclBatch]);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickResi.trim();
    if (!q) {
      router.push('/tracking');
      return;
    }
    router.push(`/tracking?q=${encodeURIComponent(q)}`);
  };

  const scrollToRfq = (service: ServiceType) => {
    setServiceTrigger({ service, nonce: Date.now() });
    const el = document.getElementById('rfq');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyToRfq = (data: CalculatorPrefill) => {
    setPrefill(data);
    const el = document.getElementById('rfq');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const loadScenarioToCalculator = (
    preset: Omit<CalculatorScenarioPreset, 'nonce'>
  ) => {
    setScenarioPreset({ ...preset, nonce: Date.now() });
    const el = document.getElementById('kalkulator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const liveScenarios = useMemo(() => {
    return SCENARIO_SPECS.map((item) => {
      const calc = calculateImportEstimate(
        {
          originCountry: item.preset.originCountry,
          shippingMethod: item.preset.shippingMethod,
          unit: item.preset.unit,
          cargoCategory: item.preset.cargoCategory,
          actualWeightKg: Number(item.preset.actualWeightKg),
          lengthCm: 0,
          widthCm: 0,
          heightCm: 0,
          colliCount: 1,
          directCbm: Number(item.preset.directCbm),
          destinationCity: item.preset.destinationCity,
          includeGoodsValue: false,
          goodsValueForeign: 0,
          quantity: 1,
        },
        config.rates,
        config.destinations,
        config.settings
      );
      const copy = dict.scenarios.items[item.id];
      return {
        ...item,
        title: copy.title,
        routeSummary: copy.routeSummary,
        detail: copy.detail,
        calc,
      };
    });
  }, [config.rates, config.destinations, config.settings, dict.scenarios.items]);

  const currentScenario = liveScenarios[activeSlide] || liveScenarios[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD]">
      <Navbar settings={config.settings} />

      <main id="main-content" className="flex-1">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-[#EFF5FF] border-b border-[#E2EAF6]">
          <img
            src="/images/hero-port-pontianak.webp"
            srcSet="/images/hero-port-pontianak-sm.webp 768w, /images/hero-port-pontianak.webp 1376w"
            sizes="100vw"
            alt={dict.hero.imageAlt}
            width={1376}
            height={768}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-right"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#F4F9FF] via-[#F4F9FF]/95 sm:via-[#F4F9FF]/85 to-[#F4F9FF]/20"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight leading-[1.12]">
                {dict.hero.headline}
              </h1>

              <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
                {dict.hero.subtitle}
              </p>

              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm font-bold text-ink">
                {dict.hero.bullets.map((point) => (
                  <li key={point} className="inline-flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-navy text-white inline-flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#kalkulator"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-6 text-sm shadow-sm transition-colors"
                >
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                  {dict.hero.ctaPrimary}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setExplainerPlayNonce((n) => n + 1);
                    const el = document.getElementById('alur-kerja');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-ice border border-[#BFD2EE] text-ink font-bold px-6 text-sm shadow-sm transition-colors"
                >
                  <PlayCircle
                    className="h-4 w-4 text-brand"
                    aria-hidden="true"
                  />
                  {dict.hero.ctaSecondary}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SPLIT SECTION: LAYANAN KAMI (2x2 LEFT) + KALKULATOR IMPOR (RIGHT) */}
        <section
          id="layanan"
          className="py-12 lg:py-16 bg-white border-b border-[#E2EAF6]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 5 cols: 2x2 Service Cards */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-brand">
                    <span
                      className="w-6 h-0.5 bg-brand rounded-full"
                      aria-hidden="true"
                    />
                    {dict.services.eyebrow}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
                    {dict.services.heading}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => scrollToRfq('titip_beli')}
                    className="text-left rounded-2xl bg-white border border-[#DCE6F5] hover:border-brand p-5 shadow-sm transition-all space-y-2.5 group"
                  >
                    <div className="h-11 w-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-ink text-sm leading-snug">
                      {dict.services.cards.titipBeli.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dict.services.cards.titipBeli.desc}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToRfq('forwarder')}
                    className="text-left rounded-2xl bg-white border border-[#DCE6F5] hover:border-brand p-5 shadow-sm transition-all space-y-2.5 group"
                  >
                    <div className="h-11 w-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                      <Ship className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-ink text-sm leading-snug">
                      {dict.services.cards.forwarder.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dict.services.cards.forwarder.desc}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToRfq('transfer_valas')}
                    className="text-left rounded-2xl bg-white border border-[#DCE6F5] hover:border-brand p-5 shadow-sm transition-all space-y-2.5 group"
                  >
                    <div className="h-11 w-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                      <Banknote className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-ink text-sm leading-snug">
                      {dict.services.cards.transferValas.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dict.services.cards.transferValas.desc(
                        formatIdr(config.settings.transfer_fee_idr)
                      )}
                    </p>
                  </button>

                  <a
                    href="#gudang"
                    className="text-left rounded-2xl bg-white border border-[#DCE6F5] hover:border-brand p-5 shadow-sm transition-all space-y-2.5 group block"
                  >
                    <div className="h-11 w-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                      <Warehouse className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-ink text-sm leading-snug">
                      {dict.services.cards.gudang.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dict.services.cards.gudang.desc}
                    </p>
                  </a>
                </div>
              </div>

              {/* Right 7 cols: Kalkulator Impor Card */}
              <div className="lg:col-span-7">
                <CalculatorSection
                  rates={config.rates}
                  destinations={config.destinations}
                  settings={config.settings}
                  scenarioPreset={scenarioPreset}
                  onApplyToRfq={handleApplyToRfq}
                />
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE EXPLAINER VIDEO & 4-STEP ALUR KERJA */}
        <ExplainerSection playTriggerNonce={explainerPlayNonce} />

        {/* SPLIT ROW: CEK RESI DARK CARD (LEFT 7) + ROUTE SIMULATION CAROUSEL (RIGHT 5) */}
        <section className="py-12 lg:py-16 bg-white border-b border-[#E2EAF6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 7 cols: Cek Resi / Live Tracking Dark Banner Card */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-navy text-white p-6 sm:p-8 flex flex-col justify-between min-h-[250px] shadow-md">
                <img
                  src="/images/tracking-ship-banner.webp"
                  srcSet="/images/tracking-ship-banner-sm.webp 768w, /images/tracking-ship-banner.webp 1200w"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  alt=""
                  width={1200}
                  height={670}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-right"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[#0B2351] via-[#0B2351]/85 to-transparent"
                />

                <div className="relative z-10 space-y-5 max-w-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-full bg-white text-navy flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold">
                        {dict.quickTrack.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                        {dict.quickTrack.subtitle}
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleQuickTrack}
                    className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl p-1.5 shadow-sm"
                  >
                    <label htmlFor="card-quick-resi" className="sr-only">
                      {dict.quickTrack.inputLabel}
                    </label>
                    <input
                      id="card-quick-resi"
                      type="text"
                      value={quickResi}
                      onChange={(e) => setQuickResi(e.target.value)}
                      placeholder={dict.quickTrack.inputPlaceholder}
                      className="flex-1 min-h-[42px] px-3.5 py-2 text-sm font-mono text-ink placeholder:text-slate-500 rounded-lg bg-white"
                    />
                    <button
                      type="submit"
                      className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold hover:bg-gold-dark text-ink font-extrabold px-5 text-sm transition-colors shrink-0"
                    >
                      {dict.quickTrack.trackBtn}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-blue-100">
                    <span>{dict.quickTrack.demoLabel}</span>
                    {[
                      'IMP-PNK-2026-0001',
                      'IMP-PNK-2026-0002',
                      'IMP-PNK-2026-0003',
                    ].map((code) => (
                      <Link
                        key={code}
                        href={`/tracking?q=${code}`}
                        className="font-mono px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors"
                      >
                        {code}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Real Live-Computed Kalbar Route Carousel Card */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#DCE6F5] shadow-sm p-6 sm:p-7 flex flex-col justify-between min-h-[250px]">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="text-3xl font-extrabold text-brand leading-none select-none"
                      aria-hidden="true"
                    >
                      “
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-ink">
                        {dict.scenarios.heading}
                      </h2>
                      <p className="text-xs text-brand font-semibold">
                        {currentScenario.routeSummary}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-ink">
                    {currentScenario.title}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentScenario.detail}
                  </p>

                  {currentScenario.calc && (
                    <div className="rounded-xl bg-ice border border-[#DCE6F5] p-3 text-xs space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span>{dict.scenarios.shippingForwardingLabel}</span>
                        <span className="font-mono font-extrabold text-ink">
                          {formatIdr(currentScenario.calc.totalAllInIdr)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-600">
                        <span>
                          {dict.scenarios.etaLabel}{' '}
                          {currentScenario.calc.etaMinDays}-
                          {currentScenario.calc.etaMaxDays}{' '}
                          {dict.scenarios.daysUnit}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            loadScenarioToCalculator(currentScenario.preset)
                          }
                          className="font-bold text-brand hover:underline"
                        >
                          {dict.scenarios.loadInCalcBtn} →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {liveScenarios.map((sc, idx) => (
                      <button
                        key={sc.id}
                        type="button"
                        aria-label={dict.scenarios.dotAria(idx + 1)}
                        aria-current={idx === activeSlide ? 'true' : undefined}
                        onClick={() => setActiveSlide(idx)}
                        className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-2 rounded-full transition-all ${
                            idx === activeSlide
                              ? 'w-5 bg-brand'
                              : 'w-2 bg-[#CBD8EE] hover:bg-brand/60'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={dict.scenarios.prevAria}
                      onClick={() =>
                        setActiveSlide(
                          (prev) =>
                            (prev - 1 + liveScenarios.length) %
                            liveScenarios.length
                        )
                      }
                      className="h-9 w-9 rounded-full border border-[#DCE6F5] text-ink hover:bg-ice inline-flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={dict.scenarios.nextAria}
                      onClick={() =>
                        setActiveSlide(
                          (prev) => (prev + 1) % liveScenarios.length
                        )
                      }
                      className="h-9 w-9 rounded-full border border-[#DCE6F5] text-ink hover:bg-ice inline-flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE SHARED LCL CONTAINER SCHEDULE */}
        <LclBatchSection
          batches={lclBatches}
          settings={config.settings}
          onSelectBatch={(batch) => handleApplyToRfq(toBatchPrefill(batch))}
        />

        {/* CURATED CHINA PRODUCTS & LCL CONSOLIDATION SHOWCASE */}
        {featuredProducts.length > 0 && (
          <section className="py-12 lg:py-16 bg-ice border-b border-[#E2EAF6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-brand mb-1">
                    <span
                      className="w-6 h-0.5 bg-brand rounded-full"
                      aria-hidden="true"
                    />
                    {dict.catalog.homeEyebrow}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {dict.catalog.homeHeading}
                  </h2>
                  <p className="mt-2 text-slate-700 text-sm sm:text-base">
                    {dict.catalog.homeSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-navy text-gold px-3.5 py-2 text-xs font-extrabold shadow-sm">
                    <Container className="h-3.5 w-3.5" aria-hidden="true" />
                    {dict.catalog.homeLclBadge}
                  </span>
                  <Link
                    href="/katalog"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-brand hover:bg-brand-dark text-white font-bold px-5 text-xs sm:text-sm shadow-sm transition-colors"
                  >
                    {dict.catalog.homeViewAllBtn}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 3).map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl bg-white border border-[#DCE6F5] shadow-sm hover:shadow-md hover:border-brand/60 transition-all overflow-hidden flex flex-col"
                  >
                    <Link
                      href={`/katalog/${item.slug}`}
                      className="relative aspect-[4/3] bg-[#F4F7FB] border-b border-[#E6EEF9] overflow-hidden block group"
                    >
                      <img
                        src={getOptimizedImageUrl(item.image_url)}
                        alt={item.title}
                        width={800}
                        height={598}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-navy/90 text-white shadow-sm">
                        {dict.catalog.categoryLabels[item.category]}
                      </span>
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#DCE6F5] text-[11px] font-bold text-ink shadow-sm">
                        {dict.catalog.scaleBadges[item.shipment_scale]}
                      </span>
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <Link
                          href={`/katalog/${item.slug}`}
                          className="block font-extrabold text-ink hover:text-brand text-sm sm:text-base leading-snug line-clamp-2 transition-colors"
                        >
                          <h3>{item.title}</h3>
                        </Link>

                        <div className="rounded-xl bg-ice border border-[#DCE6F5] p-3 text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-600">
                              {dict.catalog.factoryPriceLabel}:
                            </span>
                            <span className="font-mono font-extrabold text-brand">
                              RMB{' '}
                              {formatNumberId(
                                Number(item.price_rmb_min),
                                Number(item.price_rmb_min) % 1 === 0 ? 0 : 2
                              )}
                              {Number(item.price_rmb_max) >
                              Number(item.price_rmb_min)
                                ? `-${formatNumberId(
                                    Number(item.price_rmb_max),
                                    Number(item.price_rmb_max) % 1 === 0 ? 0 : 2
                                  )}`
                                : ''}{' '}
                              / {item.unit_label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-600">
                              {dict.catalog.estSellLabel}:
                            </span>
                            <span className="font-mono font-extrabold text-wa">
                              {formatIdr(item.est_sell_idr_min)} -{' '}
                              {formatIdr(item.est_sell_idr_max)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DCE6F5]">
                            <span className="inline-flex items-center gap-1 font-bold text-ink">
                              <TrendingUp
                                className="h-3.5 w-3.5 text-wa"
                                aria-hidden="true"
                              />
                              {dict.catalog.marginLabel}:
                            </span>
                            <span className="font-mono font-extrabold text-wa">
                              {item.margin_note}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {item.why_pontianak}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6EEF9]">
                        <a
                          href={item.supplier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[42px] inline-flex items-center justify-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold px-3 text-xs transition-colors"
                        >
                          <ExternalLink
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {item.supplier_platform}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleApplyToRfq(toCatalogPrefill(item))}
                          className="min-h-[42px] inline-flex items-center justify-center gap-1 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold px-3 text-xs transition-colors"
                        >
                          {dict.catalog.joinLclBtn}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FULL WORKING MVP SECTIONS */}
        <WarehouseSection warehouses={config.warehouses} />

        <RfqFormSection
          destinations={config.destinations}
          lclBatches={lclBatches}
          prefill={prefill}
          serviceTrigger={serviceTrigger}
          onClearPrefill={() => setPrefill(null)}
        />

        <FaqSection
          whatsappAdmin={config.settings.whatsapp_admin}
          companyName={config.settings.company_name}
        />
      </main>

      <PublicFooter settings={config.settings} />
    </div>
  );
}
