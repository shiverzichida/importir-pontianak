'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { buildWhatsAppUrl, formatIdr } from '@/lib/format';
import type { PublicSettings } from '@/lib/types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  settings: PublicSettings;
  isTrackingPage?: boolean;
}

export default function Navbar({
  settings,
  isTrackingPage = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'layanan' | 'panduan' | null>(
    null
  );

  const waUrl = buildWhatsAppUrl(
    settings.whatsapp_admin,
    `Halo Admin ${settings.company_name}, saya ingin konsultasi layanan impor ke Pontianak / Kalbar.`
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2EAF6]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        Lewati ke konten utama
      </a>

      {/* Slim top FX strip */}
      <div className="bg-navy text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-blue-200">Kurs Transaksi:</span>
            <span className="font-mono">
              1 RMB = <strong>{formatIdr(settings.rate_rmb_idr)}</strong>
            </span>
            <span className="font-mono">
              1 MYR = <strong>{formatIdr(settings.rate_myr_idr)}</strong>
            </span>
            <span className="font-mono">
              1 SGD = <strong>{formatIdr(settings.rate_sgd_idr)}</strong>
            </span>
            <span className="hidden sm:inline text-blue-200">
              (
              {settings.fx_mode === 'manual'
                ? 'Kurs Manual Admin'
                : `Sumber: ${settings.fx_source}`}
              )
            </span>
          </div>

          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1 text-blue-100 hover:text-gold font-semibold transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Admin Panel
          </Link>
        </div>
      </div>

      {/* Main sticky navbar matching reference */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 min-h-[44px] flex items-center">
          <BrandLogo
            variant="light"
            showSubtitle
            companyName={settings.company_name}
          />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center gap-1 text-sm font-semibold text-ink"
        >
          <Link
            href="/"
            className={`px-4 py-2 rounded-full transition-colors ${
              !isTrackingPage
                ? 'bg-brand text-white'
                : 'text-ink hover:bg-brand-soft hover:text-brand'
            }`}
          >
            Beranda
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
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors"
            >
              Layanan
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {openDropdown === 'layanan' && (
              <div className="absolute left-0 top-full pt-1.5 w-60 z-50">
                <div className="rounded-xl bg-white border border-[#DCE6F5] shadow-lg p-1.5 space-y-0.5 text-xs font-semibold">
                  <Link
                    href="/#layanan"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    Jasa Titip Beli / Sourcing
                  </Link>
                  <Link
                    href="/#layanan"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    Freight Forwarder (Kirim Saja)
                  </Link>
                  <Link
                    href="/#layanan"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    Transfer Valas RMB / MYR / SGD
                  </Link>
                  <Link
                    href="/#gudang"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    Alamat Gudang Transit
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#kalkulator"
            className="px-3.5 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors"
          >
            Kalkulator
          </Link>

          <Link
            href="/tracking"
            className={`px-4 py-2 rounded-full transition-colors ${
              isTrackingPage
                ? 'bg-brand text-white'
                : 'text-ink hover:bg-brand-soft hover:text-brand'
            }`}
          >
            Cek Resi
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
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors"
            >
              Panduan
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {openDropdown === 'panduan' && (
              <div className="absolute left-0 top-full pt-1.5 w-56 z-50">
                <div className="rounded-xl bg-white border border-[#DCE6F5] shadow-lg p-1.5 space-y-0.5 text-xs font-semibold">
                  <Link
                    href="/#alur-kerja"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    Alur Kerja 4 Langkah
                  </Link>
                  <Link
                    href="/#gudang"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    Gudang & Marking Code
                  </Link>
                  <Link
                    href="/#faq"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2.5 rounded-lg text-ink hover:bg-brand-soft hover:text-brand"
                  >
                    FAQ Impor Kalbar
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#rfq"
            className="px-3.5 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors"
          >
            Form RFQ
          </Link>

          <Link
            href="/#kontak"
            className="px-3.5 py-2 rounded-full text-ink hover:bg-brand-soft hover:text-brand transition-colors"
          >
            Kontak
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-5 text-sm shadow-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat WhatsApp
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#DCE6F5] text-ink hover:bg-ice"
          aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
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
          aria-label="Navigasi seluler"
          className="lg:hidden border-t border-[#E2EAF6] bg-white px-4 py-3 space-y-1"
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-ink hover:bg-ice"
          >
            Beranda
          </Link>
          <Link
            href="/#layanan"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            Layanan
          </Link>
          <Link
            href="/#kalkulator"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            Kalkulator Impor
          </Link>
          <Link
            href="/tracking"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-brand hover:bg-ice"
          >
            Cek Resi / Live Tracking
          </Link>
          <Link
            href="/#gudang"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            Gudang Transit & Marking Code
          </Link>
          <Link
            href="/#rfq"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            Ajukan Order / Form RFQ
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-ink hover:bg-ice"
          >
            FAQ Impor
          </Link>
          <div className="pt-2 flex flex-col gap-2 border-t border-[#E2EAF6]">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white text-sm font-bold"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat WhatsApp Admin
            </a>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center rounded-lg border border-[#DCE6F5] text-ink text-sm font-semibold hover:bg-ice"
            >
              Dashboard Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
