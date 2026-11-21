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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      {/* Live FX Ticker Bar */}
      <div className="bg-navy text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-teal-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Kurs Live Hari Ini:
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
            <span>•</span>
            <span>Hub: Pontianak, Kalimantan Barat</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-10 w-10 rounded-xl bg-navy text-white flex items-center justify-center shadow-sm group-hover:bg-navy-light transition">
            <Ship className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <div className="font-bold text-navy text-base leading-tight tracking-tight">
              {settings.company_name}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              China • Malaysia • Singapura → Kalbar
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-teal-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/tracking"
            className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
              isTrackingPage
                ? 'text-teal-700'
                : 'text-slate-700 hover:text-teal-700'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Cek Resi
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-navy hover:bg-slate-100 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
          <Link
            href={isTrackingPage ? '/#rfq' : '#rfq'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-semibold shadow-sm transition"
          >
            <PackageCheck className="h-4 w-4" />
            Ajukan Order / RFQ
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/tracking"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-teal-700 hover:bg-teal-50"
          >
            Cek Resi / Live Tracking
          </Link>
          <div className="pt-2 flex flex-col gap-2 border-t border-slate-100">
            <Link
              href={isTrackingPage ? '/#rfq' : '#rfq'}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold"
            >
              Ajukan Order / RFQ
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium"
            >
              Dashboard Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
