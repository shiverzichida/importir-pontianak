'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Menu,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { buildWhatsAppUrl, formatIdr } from '@/lib/format';
import type { Locale } from '@/lib/i18n/types';
import type { PublicSettings } from '@/lib/types';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from './LanguageProvider';

interface NavbarProps {
  settings: PublicSettings;
  isTrackingPage?: boolean;
  isCatalogPage?: boolean;
}

const LOCALE_OPTIONS: Array<{ code: Locale; label: string; aria: string }> = [
  { code: 'id', label: 'ID', aria: 'Bahasa Indonesia' },
  { code: 'en', label: 'EN', aria: 'English' },
  { code: 'zh', label: '中文', aria: 'Mandarin Chinese' },
];

export default function Navbar({
  settings,
  isTrackingPage = false,
  isCatalogPage = false,
}: NavbarProps) {
  const { locale, setLocale, dict } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'layanan' | 'panduan' | null>(
    null
  );

  const waUrl = buildWhatsAppUrl(
    settings.whatsapp_admin,
    dict.nav.waGreeting(settings.company_name)
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2EAF6]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        {dict.nav.skipToContent}
      </a>

      {/* Slim top FX & language utility bar */}
      <div className="bg-navy text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-blue-200">
              {dict.nav.fxLabel}
            </span>
            <span className="font-mono">
              1 RMB = <strong>{formatIdr(settings.rate_rmb_idr)}</strong>
            </span>
            <span className="font-mono">
              1 MYR = <strong>{formatIdr(settings.rate_myr_idr)}</strong>
            </span>
            <span className="font-mono">
              1 SGD = <strong>{formatIdr(settings.rate_sgd_idr)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div
              role="group"
              aria-label={dict.nav.languageSwitcherAria}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/10 border border-white/15 p-0.5"
            >
              <Globe
                className="h-3.5 w-3.5 text-blue-200 ml-1.5 mr-0.5 hidden sm:inline-block"
                aria-hidden="true"
              />
              {LOCALE_OPTIONS.map((item) => {
                const active = locale === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    aria-label={item.aria}
                    aria-pressed={active}
                    onClick={() => setLocale(item.code)}
                    className={`px-2 py-0.5 rounded-full text-[11px] leading-tight transition-colors ${
                      active
                        ? 'bg-gold text-ink font-extrabold shadow-sm'
                        : 'text-blue-100 hover:text-white font-semibold'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 text-blue-100 hover:text-gold font-semibold transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.nav.adminPanel}
            </Link>
          </div>
        </div>
      </div>

      {/* Main sticky navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 min-h-[44px] flex items-center">
          <BrandLogo
            variant="light"
            showSubtitle
            companyName={settings.company_name}
            subtitle={dict.brand.subtitle}
          />
        </Link>

        <nav
          aria-label={dict.nav.mainNavAria}
          className="hidden lg:flex items-center gap-0.5 text-sm font-semibold text-ink"
        >
          <Link
            href="/"
            className={`px-3 py-2 rounded-full transition-colors whitespace-nowrap ${
              !isTrackingPage && !isCatalogPage
                ? 'bg-brand text-white'
                : 'text-ink hover:bg-brand-soft hover:text-brand'
            }`}
          >
            {dict.nav.home}
          </Link>

          <Link
            href="/katalog"
            className={`px-3 py-2 rounded-full transition-colors whitespace-nowrap ${
              isCatalogPage
                ? 'bg-brand text-white'
                : 'text-ink hover:bg-brand-soft hover:text-brand'
            }`}
          >
            {dict.nav.catalog}
          </Link>

          {/* Layanan dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('layanan')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              aria-expanded={openDropdown === 'layanan'}
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === 'layanan' ? null : 'layanan'
                )
              }
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors whitespace-nowrap"
            >
              {dict.nav.services}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {openDropdown === 'layanan' && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                <div className="rounded-xl bg-white border border-[#DCE6F5] shadow-lg p-1.5 space-y-0.5 text-xs font-semibold">
                  <Link
                    href="/#layanan"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.serviceItems.titipBeli}
                  </Link>
                  <Link
                    href="/#layanan"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.serviceItems.forwarder}
                  </Link>
                  <Link
                    href="/#layanan"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.serviceItems.transferValas}
                  </Link>
                  <Link
                    href="/#gudang"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.serviceItems.warehouse}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#kalkulator"
            className="px-3 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors whitespace-nowrap"
          >
            {dict.nav.calculator}
          </Link>

          <Link
            href="/tracking"
            className={`px-3 py-2 rounded-full transition-colors whitespace-nowrap ${
              isTrackingPage
                ? 'bg-brand text-white'
                : 'text-ink hover:bg-brand-soft hover:text-brand'
            }`}
          >
            {dict.nav.tracking}
          </Link>

          {/* Panduan dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('panduan')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              aria-expanded={openDropdown === 'panduan'}
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === 'panduan' ? null : 'panduan'
                )
              }
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors whitespace-nowrap"
            >
              {dict.nav.guide}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {openDropdown === 'panduan' && (
              <div className="absolute left-0 top-full pt-1.5 w-60 z-50">
                <div className="rounded-xl bg-white border border-[#DCE6F5] shadow-lg p-1.5 space-y-0.5 text-xs font-semibold">
                  <Link
                    href="/#alur-kerja"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.guideItems.workflow}
                  </Link>
                  <Link
                    href="/#gudang"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.guideItems.warehouseMarking}
                  </Link>
                  <Link
                    href="/#faq"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    {dict.nav.guideItems.faq}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#rfq"
            className="px-3 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors whitespace-nowrap"
          >
            {dict.nav.rfq}
          </Link>

          <Link
            href="/#kontak"
            className="hidden xl:inline-flex px-3 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors whitespace-nowrap"
          >
            {dict.nav.contact}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-5 text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {dict.nav.chatWhatsapp}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#DCE6F5] text-ink hover:bg-ice"
          aria-label={mobileOpen ? dict.nav.closeMenuAria : dict.nav.openMenuAria}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label={dict.nav.mobileNavAria}
          className="lg:hidden border-t border-[#E2EAF6] bg-white px-4 py-3 space-y-1"
        >
          {/* Touch-friendly language selector inside mobile drawer */}
          <div
            role="group"
            aria-label={dict.nav.languageSwitcherAria}
            className="grid grid-cols-3 gap-2 pb-2 mb-1 border-b border-[#E2EAF6]"
          >
            {LOCALE_OPTIONS.map((item) => {
              const active = locale === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  aria-label={item.aria}
                  aria-pressed={active}
                  onClick={() => setLocale(item.code)}
                  className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-ice text-ink border-[#DCE6F5] hover:border-brand'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-ink hover:bg-ice"
          >
            {dict.nav.home}
          </Link>
          <Link
            href="/katalog"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-brand hover:bg-ice"
          >
            {dict.nav.catalogMobile}
          </Link>
          <Link
            href="/#layanan"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            {dict.nav.services}
          </Link>
          <Link
            href="/#kalkulator"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            {dict.nav.calculatorMobile}
          </Link>
          <Link
            href="/tracking"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-brand hover:bg-ice"
          >
            {dict.nav.trackingMobile}
          </Link>
          <Link
            href="/#gudang"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            {dict.nav.warehouseMobile}
          </Link>
          <Link
            href="/#rfq"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            {dict.nav.rfqMobile}
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            {dict.nav.faqMobile}
          </Link>
          <div className="pt-2 flex flex-col gap-2 border-t border-[#E2EAF6]">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white text-sm font-bold"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {dict.nav.chatWhatsappAdmin}
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center rounded-lg border border-[#DCE6F5] text-ink text-sm font-semibold hover:bg-ice"
            >
              {dict.nav.adminDashboard}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
