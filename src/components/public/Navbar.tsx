'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, PackageCheck, Search, ShieldCheck, Ship, X } from 'lucide-react';
import { formatIdr } from '@/lib/format';
import type { PublicSettings } from '@/lib/types';

interface NavbarProps {
  settings: PublicSettings;
  isTrackingPage?: boolean;
}

export default function Navbar({ settings, isTrackingPage = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = isTrackingPage
    ? [
        { href: '/', label: 'Beranda' },
        { href: '/#layanan', label: 'Layanan' },
        { href: '/#kalkulator', label: 'Kalkulator Ongkir' },
        { href: '/#gudang', label: 'Gudang Transit' },
        { href: '/#rfq', label: 'Ajukan RFQ' },
      ]
    : [
        { href: '#layanan', label: 'Layanan' },
        { href: '#keunggulan', label: 'Rute Kalbar' },
        { href: '#kalkulator', label: 'Kalkulator' },
        { href: '#gudang', label: 'Gudang Transit' },
        { href: '#faq', label: 'FAQ' },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        Lewati ke konten utama
      </a>

      <div className="bg-navy text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-teal-300 font-semibold">
              <span className="h-2 w-2 rounded-full bg-teal-300" aria-hidden="true" />
              Kurs Transaksi:
            </span>
            <span className="font-mono">
              1 RMB = <strong className="text-white">{formatIdr(settings.rate_rmb_idr)}</strong>
            </span>
            <span className="font-mono">
              1 MYR = <strong className="text-white">{formatIdr(settings.rate_myr_idr)}</strong>
            </span>
            <span className="font-mono">
              1 SGD = <strong className="text-white">{formatIdr(settings.rate_sgd_idr)}</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-300">
            <span>{settings.operating_hours}</span>
            <span aria-hidden="true">|</span>
            <span>Hub: Pontianak, Kalimantan Barat</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 min-h-[44px]">
          <div className="h-10 w-10 rounded-lg bg-navy text-white flex items-center justify-center group-hover:bg-navy-light transition-colors">
            <Ship className="h-5 w-5 text-teal-300" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-navy text-base leading-tight tracking-tight">
              {settings.company_name}
            </div>
            <div className="text-xs font-medium text-slate-600">
              China, Malaysia, Singapura ke Kalbar
            </div>
          </div>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-700"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 px-1 hover:text-teal-dark transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/tracking"
            className={`inline-flex items-center gap-1.5 py-2 px-1 font-semibold transition-colors ${
              isTrackingPage
                ? 'text-teal-dark underline underline-offset-4'
                : 'text-slate-700 hover:text-teal-dark'
            }`}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Cek Resi
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-semibold text-slate-700 hover:text-navy hover:bg-slate-100 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Admin
          </Link>
          <Link
            href={isTrackingPage ? '/#rfq' : '#rfq'}
            className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-semibold transition-colors"
          >
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
            Ajukan Order / RFQ
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-100"
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
          className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/tracking"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-teal-dark hover:bg-teal-50"
          >
            Cek Resi / Live Tracking
          </Link>
          <div className="pt-2 flex flex-col gap-2 border-t border-slate-200">
            <Link
              href={isTrackingPage ? '/#rfq' : '#rfq'}
              onClick={() => setMobileOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center px-4 rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-semibold"
            >
              Ajukan Order / RFQ
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center px-4 rounded-lg border border-slate-300 text-slate-800 text-sm font-medium hover:bg-slate-50"
            >
              Dashboard Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
