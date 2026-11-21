'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Ship,
  X,
} from 'lucide-react';
import type { AdminSessionUser } from '@/lib/types';

interface AdminShellProps {
  user: AdminSessionUser;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/rfq', label: 'RFQ & Order', icon: FileSpreadsheet },
  { href: '/admin/shipments', label: 'Pengiriman & Tracking', icon: Package },
  { href: '/admin/settings', label: 'Tarif & Pengaturan', icon: Settings },
];

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy text-white border-r border-navy-light">
        <div className="p-5 border-b border-white/15 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal text-white flex items-center justify-center shrink-0">
            <Ship className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">Importir Pontianak</div>
            <div className="text-xs text-teal-300 truncate">
              Admin Panel Operasional
            </div>
          </div>
        </div>

        <nav aria-label="Menu admin" className="flex-1 p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-teal text-white'
                    : 'text-slate-200 hover:bg-navy-light hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/15 space-y-2.5">
          <div className="rounded-lg bg-navy-light px-3.5 py-2.5 border border-white/10">
            <div className="text-xs font-bold text-white truncate">
              {user.name}
            </div>
            <div className="text-xs text-slate-300 truncate">
              {user.email}
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between min-h-[40px] px-3.5 rounded-lg text-xs font-semibold text-teal-300 hover:bg-navy-light transition-colors"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[44px] flex items-center gap-2 px-3.5 rounded-lg text-xs font-semibold text-rose-200 hover:bg-rose-900/40 transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Keluar
          </button>
        </div>
      </aside>

      <header className="lg:hidden bg-navy text-white px-4 h-14 flex items-center justify-between sticky top-0 z-30 border-b border-navy-light">
        <div className="flex items-center gap-2.5">
          <Ship className="h-5 w-5 text-teal-300" aria-hidden="true" />
          <span className="font-bold text-sm">Admin Importir PNK</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-navy-light border border-white/15"
          aria-label="Toggle Menu Admin"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </header>

      {mobileOpen && (
        <nav
          id="admin-mobile-nav"
          aria-label="Menu admin seluler"
          className="lg:hidden bg-navy-light text-white px-4 py-3 space-y-1.5 border-b border-white/15"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 min-h-[44px] px-3 rounded-lg text-sm font-semibold ${
                  active ? 'bg-teal text-white' : 'text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
            <Link
              href="/"
              className="min-h-[44px] inline-flex items-center text-xs text-teal-300 font-semibold"
            >
              Lihat Website Publik
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] px-3 text-xs text-rose-200 font-semibold"
            >
              Keluar
            </button>
          </div>
        </nav>
      )}

      <main id="main-content" className="flex-1 lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
