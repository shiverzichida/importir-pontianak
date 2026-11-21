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
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy text-white">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal text-white flex items-center justify-center shrink-0">
            <Ship className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">Importir Pontianak</div>
            <div className="text-[11px] text-teal-300 truncate">
              Admin Panel Operasional
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-teal text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-xl bg-white/5 px-3.5 py-2.5">
            <div className="text-xs font-bold text-white truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {user.email}
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-teal-300 hover:bg-white/10 transition"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-navy text-white px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <Ship className="h-5 w-5 text-teal-300" />
          <span className="font-bold text-sm">Admin Importir PNK</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          className="p-2 rounded-lg bg-white/10"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden bg-navy-light text-white px-4 py-3 space-y-1.5 border-b border-white/10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold ${
                  active ? 'bg-teal text-white' : 'text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <Link href="/" className="text-xs text-teal-300 font-semibold">
              Website Publik →
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-rose-300 font-semibold"
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
