'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Container,
  Copy,
  ExternalLink,
  MessageCircle,
  Share2,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { buildWhatsAppUrl, formatIdr, formatNumberId } from '@/lib/format';
import type { CatalogProduct, LclBatch, PublicConfig } from '@/lib/types';
import { useLanguage } from './LanguageProvider';
import LclBatchSection from './LclBatchSection';
import Navbar from './Navbar';
import PublicFooter from './PublicFooter';

interface CatalogDetailClientProps {
  config: PublicConfig;
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
  batches: LclBatch[];
}

function formatRmbRange(min: number, max: number): string {
  const minText = formatNumberId(min, min % 1 === 0 ? 0 : 2);
  const maxText = formatNumberId(max, max % 1 === 0 ? 0 : 2);
  if (max <= min || max <= 0) return `RMB ${minText}`;
  return `RMB ${minText} - ${maxText}`;
}

export default function CatalogDetailClient({
  config,
  product,
  relatedProducts,
  batches,
}: CatalogDetailClientProps) {
  const { dict } = useLanguage();
  const [copiedKw, setCopiedKw] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const rmbRangeText = formatRmbRange(
    Number(product.price_rmb_min),
    Number(product.price_rmb_max)
  );
  const liveRmbIdrMin =
    Number(product.price_rmb_min) * config.settings.rate_rmb_idr;
  const liveRmbIdrMax =
    Number(product.price_rmb_max) * config.settings.rate_rmb_idr;

  const siteBase =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://importir-pontianak.43-173-33-53.sslip.io';
  const shareUrl = `${siteBase}/katalog/${product.slug}`;

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    dict.catalogDetail.shareWaText({
      title: product.title,
      priceRmbRange: `${rmbRangeText} / ${product.unit_label}`,
      margin: product.margin_note,
      url: shareUrl,
    })
  )}`;

  const waAdminUrl = buildWhatsAppUrl(
    config.settings.whatsapp_admin,
    dict.catalog.waProductInquiry({
      companyName: config.settings.company_name,
      title: product.title,
      priceRmbRange: `${rmbRangeText} / ${product.unit_label}`,
      url: product.supplier_url,
    })
  );

  const copyKeyword = async () => {
    if (!product.mandarin_keyword) return;
    try {
      await navigator.clipboard.writeText(product.mandarin_keyword);
      setCopiedKw(true);
      setTimeout(() => setCopiedKw(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD]">
      <Navbar settings={config.settings} isCatalogPage />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-[#E2EAF6] py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
            >
              <Link href="/" className="hover:text-brand">
                {dict.catalogDetail.breadcrumbHome}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link href="/katalog" className="hover:text-brand">
                {dict.catalogDetail.breadcrumbCatalog}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-ink font-bold truncate max-w-[240px] sm:max-w-md">
                {product.title}
              </span>
            </nav>

            <Link
              href="/katalog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.catalogDetail.backToCatalog}
            </Link>
          </div>
        </div>

        {/* Main 2-Column Product Detail */}
        <section className="py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white border border-[#DCE6F5] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left 5 cols: Photo & Share box */}
              <div className="lg:col-span-5 bg-[#F4F7FB] border-b lg:border-b-0 lg:border-r border-[#E2EAF6] p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#DCE6F5] shadow-sm">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy text-white shadow-sm">
                        {dict.catalog.categoryLabels[product.category]}
                      </span>
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gold text-ink shadow-sm">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {dict.catalog.featuredBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Share to WhatsApp Group */}
                  <div className="rounded-2xl bg-white border border-[#DCE6F5] p-4 space-y-3">
                    <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Share2
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden="true"
                      />
                      {dict.catalogDetail.shareProductLabel}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={copyShareLink}
                        className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-ice hover:bg-brand-soft border border-[#D4E2F6] text-ink font-bold text-xs px-3 transition-colors"
                      >
                        {copiedLink ? (
                          <>
                            <Check
                              className="h-3.5 w-3.5 text-wa"
                              aria-hidden="true"
                            />
                            {dict.catalogDetail.linkCopiedBtn}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            {dict.catalogDetail.copyLinkBtn}
                          </>
                        )}
                      </button>

                      <a
                        href={waShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-wa hover:bg-wa-dark text-white font-bold text-xs px-3 transition-colors"
                      >
                        <MessageCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {dict.catalogDetail.shareWaBtn}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Supplier & Mandarin Keyword */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={product.supplier_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold px-3 text-xs transition-colors"
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
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-ice border border-[#D4E2F6] text-ink font-bold px-3 text-xs transition-colors"
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
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-white border border-[#DCE6F5] px-3.5 py-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag
                          className="h-3.5 w-3.5 text-brand shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-slate-600 shrink-0">
                          {dict.catalog.keyword1688Label}
                        </span>
                        <span className="font-bold text-ink truncate">
                          {product.mandarin_keyword}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={copyKeyword}
                        className="inline-flex items-center gap-1 font-bold text-brand hover:underline shrink-0 py-1 px-1.5"
                      >
                        {copiedKw ? (
                          <>
                            <Check
                              className="h-3.5 w-3.5 text-wa"
                              aria-hidden="true"
                            />
                            {dict.catalog.copiedBtn}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            {dict.catalog.copyBtn}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right 7 cols: Economics, Pontianak Insight & CTAs */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-soft border border-[#BFD6F9] text-brand text-xs font-bold">
                      <Container className="h-3.5 w-3.5" aria-hidden="true" />
                      {dict.catalog.scaleBadges[product.shipment_scale]}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-ink text-xs font-bold">
                      {product.origin_hub}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-snug">
                    {product.title}
                  </h1>

                  {/* Highlight Price Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="rounded-2xl bg-ice border border-[#DCE6F5] p-4 space-y-1">
                      <div className="text-xs font-semibold text-slate-600">
                        {dict.catalog.factoryPriceLabel}
                      </div>
                      <div className="font-mono font-extrabold text-brand text-base">
                        {rmbRangeText}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        {dict.catalog.liveIdrPrefix} {formatIdr(liveRmbIdrMin)}
                        {liveRmbIdrMax > liveRmbIdrMin
                          ? ` - ${formatIdr(liveRmbIdrMax)}`
                          : ''}{' '}
                        / {product.unit_label}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-ice border border-[#DCE6F5] p-4 space-y-1">
                      <div className="text-xs font-semibold text-slate-600">
                        {dict.catalog.estLandedLabel}
                      </div>
                      <div className="font-mono font-extrabold text-ink text-base">
                        {formatIdr(product.est_landed_idr_min)}
                      </div>
                      {product.est_landed_idr_max >
                        product.est_landed_idr_min && (
                        <div className="text-[11px] font-mono text-slate-600">
                          s/d {formatIdr(product.est_landed_idr_max)}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1">
                      <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        {dict.catalog.estSellLabel}
                      </div>
                      <div className="font-mono font-extrabold text-wa text-base">
                        {formatIdr(product.est_sell_idr_min)} -{' '}
                        {formatIdr(product.est_sell_idr_max)}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-800">
                        {dict.catalog.marginLabel}: {product.margin_note}
                      </div>
                    </div>
                  </div>

                  {/* Logistics specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                      <span className="font-bold text-ink block mb-1">
                        {dict.catalog.moqLabel}
                      </span>
                      <span className="text-slate-700">{product.moq_note}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                      <span className="font-bold text-ink block mb-1">
                        {dict.catalog.volumeLabel}
                      </span>
                      <span className="text-slate-700">
                        {product.estimated_cbm_note}
                      </span>
                    </div>
                  </div>

                  {/* Demand & LCL Tip */}
                  <div className="space-y-3 text-sm leading-relaxed">
                    <div>
                      <h2 className="font-bold text-ink mb-1">
                        {dict.catalog.whyPontianakLabel}
                      </h2>
                      <p className="text-slate-700">{product.why_pontianak}</p>
                    </div>

                    {product.lcl_tip && (
                      <div className="rounded-2xl bg-[#EEF5FF] border border-[#D4E4FA] p-4 text-xs sm:text-sm text-ink">
                        <strong className="text-brand block mb-1">
                          {dict.catalog.lclTipLabel}
                        </strong>
                        {product.lcl_tip}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6EEF9] flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/?catalog=${encodeURIComponent(product.slug)}#rfq`}
                    className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-6 text-sm shadow-sm transition-colors"
                  >
                    {dict.catalog.joinLclBtn}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={waAdminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-6 text-sm shadow-sm transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {dict.catalog.askWaBtn}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active LCL Container Batches */}
        <LclBatchSection batches={batches} settings={config.settings} compact />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-[#F8FAFD]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-ink">
                  {dict.catalogDetail.relatedHeading}
                </h2>
                <Link
                  href="/katalog"
                  className="text-xs sm:text-sm font-bold text-brand hover:underline"
                >
                  {dict.catalogDetail.backToCatalog} →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/katalog/${rel.slug}`}
                    className="rounded-2xl bg-white border border-[#DCE6F5] hover:border-brand shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    <div className="aspect-[4/3] bg-[#F4F7FB] border-b border-[#E6EEF9] overflow-hidden">
                      <img
                        src={rel.image_url}
                        alt={rel.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-brand">
                          {dict.catalog.categoryLabels[rel.category]}
                        </span>
                        <h3 className="font-bold text-ink text-sm mt-1 leading-snug line-clamp-2">
                          {rel.title}
                        </h3>
                      </div>
                      <div className="pt-2 border-t border-[#E6EEF9] flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-ink">
                          {formatIdr(rel.est_sell_idr_min)} -{' '}
                          {formatIdr(rel.est_sell_idr_max)}
                        </span>
                        <span className="font-extrabold text-wa">
                          {rel.margin_note}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter settings={config.settings} />
    </div>
  );
}
