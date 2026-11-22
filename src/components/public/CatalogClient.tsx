'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Calculator,
  Check,
  Container,
  Copy,
  ExternalLink,
  MessageCircle,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { buildWhatsAppUrl, formatIdr, formatNumberId } from '@/lib/format';
import type {
  CatalogCategory,
  CatalogProduct,
  LclBatch,
  PublicConfig,
  ShipmentScale,
} from '@/lib/types';
import { useCustomerAuth } from './CustomerAuthProvider';
import { useLanguage } from './LanguageProvider';
import LclBatchSection from './LclBatchSection';
import Navbar from './Navbar';
import PublicFooter from './PublicFooter';

interface CatalogClientProps {
  config: PublicConfig;
  products: CatalogProduct[];
  batches?: LclBatch[];
}

const SCALE_BADGE_STYLE: Record<ShipmentScale, string> = {
  lcl: 'bg-brand-soft text-brand border-[#BFD6F9]',
  fcl: 'bg-amber-50 text-amber-900 border-amber-300',
  lcl_fcl: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const ALL_CATEGORY_KEYS: CatalogCategory[] = [
  'kopi_fb',
  'walet',
  'otomotif',
  'bangunan',
  'fashion',
  'grooming',
  'industri_kebun',
  'rumah_tangga',
];

function formatRmbRange(min: number, max: number): string {
  const minText = formatNumberId(min, min % 1 === 0 ? 0 : 2);
  const maxText = formatNumberId(max, max % 1 === 0 ? 0 : 2);
  if (max <= min || max <= 0) return `RMB ${minText}`;
  return `RMB ${minText} - ${maxText}`;
}

export default function CatalogClient({
  config,
  products,
  batches = [],
}: CatalogClientProps) {
  const { dict } = useLanguage();
  const { customer } = useCustomerAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    CatalogCategory | 'all'
  >('all');
  const [selectedScale, setSelectedScale] = useState<'all' | 'lcl' | 'fcl'>(
    'all'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return ALL_CATEGORY_KEYS.filter((cat) => present.has(cat));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (
        selectedScale === 'lcl' &&
        p.shipment_scale !== 'lcl' &&
        p.shipment_scale !== 'lcl_fcl'
      ) {
        return false;
      }
      if (
        selectedScale === 'fcl' &&
        p.shipment_scale !== 'fcl' &&
        p.shipment_scale !== 'lcl_fcl'
      ) {
        return false;
      }
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.why_pontianak.toLowerCase().includes(q) ||
        (p.mandarin_keyword || '').toLowerCase().includes(q) ||
        (p.lcl_tip || '').toLowerCase().includes(q) ||
        p.origin_hub.toLowerCase().includes(q) ||
        dict.catalog.categoryLabels[p.category].toLowerCase().includes(q)
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedScale,
    dict.catalog.categoryLabels,
  ]);

  const copyKeyword = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedScale('all');
  };

  const groupWaUrl = buildWhatsAppUrl(
    config.settings.whatsapp_admin,
    dict.catalog.waGroupLclInquiry(config.settings.company_name)
  );

  const customSourcingWaUrl = buildWhatsAppUrl(
    config.settings.whatsapp_admin,
    dict.catalog.waCustomSourcing(config.settings.company_name)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD]">
      <Navbar settings={config.settings} isCatalogPage />

      <main id="main-content" className="flex-1">
        {/* Maritime Dark Navy Hero Banner for Catalog & LCL Consolidation */}
        <section className="relative overflow-hidden bg-navy text-white border-b border-navy-light">
          <img
            src="/images/tracking-ship-banner.jpg"
            alt=""
            width={1200}
            height={675}
            className="absolute inset-0 w-full h-full object-cover object-right opacity-45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0B2351] via-[#0B2351]/92 to-[#0B2351]/65"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-gold">
                <Container className="h-4 w-4" aria-hidden="true" />
                {dict.catalog.heroEyebrow}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-tight">
                {dict.catalog.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
                {dict.catalog.heroSubtitle}
              </p>

              <ul className="flex flex-wrap gap-2.5 text-xs font-semibold text-white">
                {dict.catalog.heroChips.map((chip) => (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3 py-2"
                  >
                    <Check
                      className="h-3.5 w-3.5 text-gold shrink-0"
                      aria-hidden="true"
                    />
                    <span>{chip}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={groupWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-6 text-sm shadow-sm transition-colors"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {dict.catalog.heroCtaWaGroup}
                </a>
                <Link
                  href="/#kalkulator"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-6 text-sm shadow-sm transition-colors"
                >
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                  {dict.catalog.heroCtaCalculator}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Live Shared LCL Container Schedule Strip */}
        <LclBatchSection batches={batches} settings={config.settings} compact />

        {/* Search, Scale & Category Filter Controls */}
        <section className="bg-white border-b border-[#DCE6F5] py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
              <div className="relative flex-1 max-w-2xl">
                <label htmlFor="catalog-search" className="sr-only">
                  {dict.catalog.searchPlaceholder}
                </label>
                <Search
                  className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                  aria-hidden="true"
                />
                <input
                  id="catalog-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dict.catalog.searchPlaceholder}
                  className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-ice pl-10 pr-4 py-2 text-sm text-ink placeholder:text-slate-500"
                />
              </div>

              <div
                role="group"
                aria-label="Scale filter"
                className="flex flex-wrap items-center gap-2"
              >
                {(['all', 'lcl', 'fcl'] as const).map((scaleKey) => {
                  const active = selectedScale === scaleKey;
                  return (
                    <button
                      key={scaleKey}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedScale(scaleKey)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold border transition-colors ${
                        active
                          ? 'bg-navy text-gold border-navy shadow-sm'
                          : 'bg-ice text-ink border-[#D4E2F6] hover:border-brand'
                      }`}
                    >
                      {dict.catalog.scaleFilters[scaleKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={selectedCategory === 'all'}
                  onClick={() => setSelectedCategory('all')}
                  className={`min-h-[38px] px-4 rounded-full text-xs font-bold border transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-white text-ink border-[#DCE6F5] hover:border-brand'
                  }`}
                >
                  {dict.catalog.allCategories}
                </button>
                {availableCategories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedCategory(cat)}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold border transition-colors ${
                        active
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-white text-ink border-[#DCE6F5] hover:border-brand'
                      }`}
                    >
                      {dict.catalog.categoryLabels[cat]}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-semibold text-slate-600">
                {dict.catalog.showingCount(filteredProducts.length)}
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Grid */}
        <section className="py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-white border border-[#DCE6F5] p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="mx-auto h-12 w-12 rounded-full bg-brand-soft text-brand flex items-center justify-center">
                  <Boxes className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h2 className="text-lg font-extrabold text-ink">
                    {dict.catalog.emptyTitle}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {dict.catalog.emptyDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-white font-bold px-6 text-sm transition-colors"
                >
                  {dict.catalog.resetFilterBtn}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const rmbRangeText = formatRmbRange(
                    Number(product.price_rmb_min),
                    Number(product.price_rmb_max)
                  );
                  const liveRmbIdrMin =
                    Number(product.price_rmb_min) *
                    config.settings.rate_rmb_idr;
                  const liveRmbIdrMax =
                    Number(product.price_rmb_max) *
                    config.settings.rate_rmb_idr;

                  const waUrl = buildWhatsAppUrl(
                    config.settings.whatsapp_admin,
                    dict.catalog.waProductInquiry({
                      companyName: config.settings.company_name,
                      title: product.title,
                      priceRmbRange: `${rmbRangeText} / ${product.unit_label}`,
                      url: product.supplier_url,
                    })
                  );

                  return (
                    <article
                      key={product.id}
                      className="rounded-2xl bg-white border border-[#DCE6F5] shadow-sm hover:shadow-md hover:border-brand/60 transition-all overflow-hidden flex flex-col"
                    >
                      {/* Clean 4:3 Product Photo */}
                      <Link
                        href={`/katalog/${product.slug}`}
                        className="relative aspect-[4/3] bg-[#F4F7FB] border-b border-[#E6EEF9] overflow-hidden block group"
                      >
                        <img
                          src={product.image_url}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-navy/90 text-white shadow-sm">
                            {dict.catalog.categoryLabels[product.category]}
                          </span>
                          {product.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gold text-ink shadow-sm">
                              <Sparkles
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              {dict.catalog.featuredBadge}
                            </span>
                          )}
                        </div>
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#DCE6F5] text-[11px] font-bold text-ink shadow-sm">
                          {product.origin_hub}
                        </span>
                      </Link>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3.5">
                          {/* Scale Pill & Title */}
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                SCALE_BADGE_STYLE[product.shipment_scale]
                              }`}
                            >
                              <Container
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              {
                                dict.catalog.scaleBadges[
                                  product.shipment_scale
                                ]
                              }
                            </span>

                            <Link
                              href={`/katalog/${product.slug}`}
                              className="block text-base sm:text-lg font-extrabold text-ink hover:text-brand leading-snug transition-colors"
                            >
                              <h2>{product.title}</h2>
                            </Link>
                          </div>

                          {/* Economics Breakdown Box */}
                          <div className="rounded-xl bg-ice border border-[#DCE6F5] p-3.5 space-y-2 text-xs">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-slate-600 font-semibold">
                                {dict.catalog.factoryPriceLabel}
                              </span>
                              <span className="font-mono font-extrabold text-brand text-sm text-right">
                                {rmbRangeText}{' '}
                                <span className="text-[11px] font-sans font-semibold text-slate-600">
                                  / {product.unit_label}
                                </span>
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between gap-2 text-[11px] text-slate-600">
                              <span>{dict.catalog.liveIdrPrefix}</span>
                              <span className="font-mono font-semibold text-slate-800">
                                {formatIdr(liveRmbIdrMin)}
                                {liveRmbIdrMax > liveRmbIdrMin
                                  ? ` - ${formatIdr(liveRmbIdrMax)}`
                                  : ''}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-[#DCE6F5] grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-[11px] text-slate-600">
                                  {dict.catalog.estLandedLabel}
                                </div>
                                <div className="font-mono font-bold text-ink mt-0.5">
                                  {formatIdr(product.est_landed_idr_min)}
                                  {product.est_landed_idr_max >
                                  product.est_landed_idr_min
                                    ? ` - ${formatIdr(product.est_landed_idr_max)}`
                                    : ''}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-slate-600">
                                  {dict.catalog.estSellLabel}
                                </div>
                                <div className="font-mono font-extrabold text-wa mt-0.5">
                                  {formatIdr(product.est_sell_idr_min)}
                                  {product.est_sell_idr_max >
                                  product.est_sell_idr_min
                                    ? ` - ${formatIdr(product.est_sell_idr_max)}`
                                    : ''}
                                </div>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-[#DCE6F5] flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 font-bold text-ink">
                                <TrendingUp
                                  className="h-3.5 w-3.5 text-wa"
                                  aria-hidden="true"
                                />
                                {dict.catalog.marginLabel}:
                              </span>
                              <span className="font-mono font-extrabold text-wa bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {product.margin_note}
                              </span>
                            </div>
                          </div>

                          {/* MOQ & Volume Notes */}
                          <div className="space-y-1.5 text-xs text-slate-700">
                            <div>
                              <strong className="text-ink">
                                {dict.catalog.moqLabel}:
                              </strong>{' '}
                              {product.moq_note}
                            </div>
                            <div>
                              <strong className="text-ink">
                                {dict.catalog.volumeLabel}:
                              </strong>{' '}
                              {product.estimated_cbm_note}
                            </div>
                          </div>

                          {/* Pontianak Insight & LCL Tip */}
                          <div className="space-y-2 text-xs leading-relaxed">
                            <p className="text-slate-700">
                              <strong className="text-ink block mb-0.5">
                                {dict.catalog.whyPontianakLabel}
                              </strong>
                              {product.why_pontianak}
                            </p>

                            {product.lcl_tip && (
                              <div className="rounded-xl bg-[#EEF5FF] border border-[#D4E4FA] px-3 py-2 text-slate-800">
                                <strong className="text-brand">
                                  {dict.catalog.lclTipLabel}{' '}
                                </strong>
                                {product.lcl_tip}
                              </div>
                            )}
                          </div>

                          {/* 1688 & Alibaba Direct Links + Mandarin Keyword Copy */}
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={product.supplier_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold px-3 text-xs transition-colors"
                              >
                                <ExternalLink
                                  className="h-3.5 w-3.5 shrink-0"
                                  aria-hidden="true"
                                />
                                {dict.catalog.openSupplierPrefix}{' '}
                                {product.supplier_platform}
                              </a>

                              {product.secondary_url && (
                                <a
                                  href={product.secondary_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-ice border border-[#D4E2F6] text-ink font-bold px-3 text-xs transition-colors"
                                >
                                  <ExternalLink
                                    className="h-3.5 w-3.5 text-brand shrink-0"
                                    aria-hidden="true"
                                  />
                                  {dict.catalog.openAlibabaBtn}
                                </a>
                              )}
                            </div>

                            {product.mandarin_keyword && (
                              <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-[11px]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Tag
                                    className="h-3 w-3 text-slate-500 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="text-slate-600 shrink-0">
                                    {dict.catalog.keyword1688Label}
                                  </span>
                                  <span className="font-semibold text-ink truncate">
                                    {product.mandarin_keyword}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyKeyword(
                                      product.id,
                                      product.mandarin_keyword || ''
                                    )
                                  }
                                  className="inline-flex items-center gap-1 font-bold text-brand hover:underline shrink-0 py-1 px-1.5"
                                >
                                  {copiedId === product.id ? (
                                    <>
                                      <Check
                                        className="h-3 w-3 text-wa"
                                        aria-hidden="true"
                                      />
                                      {dict.catalog.copiedBtn}
                                    </>
                                  ) : (
                                    <>
                                      <Copy
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                      />
                                      {dict.catalog.copyBtn}
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-[#E6EEF9] grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Link
                            href={
                              customer
                                ? `/dashboard/orders/new?catalog=${encodeURIComponent(product.slug)}`
                                : `/?catalog=${encodeURIComponent(product.slug)}#rfq`
                            }
                            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold px-3.5 text-xs transition-colors"
                          >
                            {dict.catalog.joinLclBtn}
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </Link>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-wa hover:bg-wa-dark text-white font-bold px-3.5 text-xs transition-colors"
                          >
                            <MessageCircle
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {dict.catalog.askWaBtn}
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Bottom Custom Sourcing CTA Banner */}
        <section className="py-12 bg-white border-t border-[#E2EAF6]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-r from-[#0B2351] to-[#1748A8] text-white p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-extrabold">
                  {dict.catalog.customTitle}
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  {dict.catalog.customDesc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href={customer ? '/dashboard/orders/new' : '/#rfq'}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-5 text-xs sm:text-sm transition-colors"
                >
                  {dict.catalog.customRfqBtn}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={customSourcingWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-5 text-xs sm:text-sm transition-colors"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {dict.catalog.customWaBtn}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={config.settings} />
    </div>
  );
}
