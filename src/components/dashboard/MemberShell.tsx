'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Ship,
  ShoppingBag,
  UserCog,
  Warehouse,
  X,
} from 'lucide-react';
import { useCustomerAuth } from '@/components/public/CustomerAuthProvider';
import { useLanguage } from '@/components/public/LanguageProvider';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type { Locale } from '@/lib/i18n/types';
import type { CustomerProfile } from '@/lib/types';

interface MemberShellProps {
  profile: CustomerProfile;
  children: React.ReactNode;
}

const LOCALE_OPTIONS: Array<{ code: Locale; label: string }> = [
  { code: 'id', label: 'ID' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
];

export default function MemberShell({ profile, children }: MemberShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const { customer, setCustomer, logout } = useCustomerAuth();
  const portal = getPortalDictionary(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!customer) {
      setCustomer({
        customerId: profile.id,
        memberCode: profile.member_code,
        markingCodeBase: profile.marking_code_base,
        email: profile.email,
        fullName: profile.full_name,
        whatsapp: profile.whatsapp,
        companyName: profile.company_name,
        defaultDestinationCity: profile.default_destination_city,
      });
    }
  }, [customer, profile, setCustomer]);

  const navItems = [
    { href: '/dashboard', label: portal.shell.nav.overview, icon: LayoutDashboard },
    {
      href: '/dashboard/orders/new',
      label: portal.shell.nav.newOrder,
      icon: PlusCircle,
    },
    { href: '/dashboard/orders', label: portal.shell.nav.orders, icon: FileSpreadsheet },
    { href: '/dashboard/shipments', label: portal.shell.nav.shipments, icon: Package },
    {
      href: '/dashboard/warehouses',
      label: portal.shell.nav.warehouses,
      icon: Warehouse,
    },
    { href: '/dashboard/profile', label: portal.shell.nav.profile, icon: UserCog },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy text-white border-r border-navy-light">
        <div className="p-5 border-b border-white/15 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand text-gold flex items-center justify-center shrink-0">
            <Ship className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm truncate">Importir Pontianak</div>
            <div className="text-xs text-gold font-semibold truncate">
              {portal.shell.portalTitle}
            </div>
          </div>
        </div>

        <nav aria-label={portal.shell.portalTitle} className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-200 hover:bg-navy-light hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-gold' : ''}`}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/15 space-y-2.5">
          {/* Language Switcher */}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-200">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              Lang
            </span>
            <div className="inline-flex items-center gap-0.5 rounded-full bg-white/10 p-0.5">
              {LOCALE_OPTIONS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                    locale === item.code
                      ? 'bg-gold text-ink'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-navy-light px-3.5 py-2.5 border border-white/10 space-y-0.5">
            <div className="text-xs font-extrabold text-white truncate">
              {profile.full_name}
            </div>
            {profile.company_name && (
              <div className="text-[11px] text-blue-200 truncate">
                {profile.company_name}
              </div>
            )}
            <div className="text-[11px] font-mono font-bold text-gold truncate">
              {profile.member_code}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <Link
              href="/katalog"
              className="flex items-center justify-between min-h-[36px] px-3 rounded-lg text-xs font-semibold text-blue-100 hover:bg-navy-light hover:text-gold transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                {portal.shell.catalogLink}
              </span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="flex items-center justify-between min-h-[36px] px-3 rounded-lg text-xs font-semibold text-blue-200 hover:bg-navy-light hover:text-white transition-colors"
            >
              <span>{portal.shell.publicSiteLink}</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[42px] flex items-center gap-2 px-3.5 rounded-xl text-xs font-bold text-rose-200 hover:bg-rose-900/40 transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {portal.shell.logoutBtn}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-navy text-white px-4 h-14 flex items-center justify-between sticky top-0 z-30 border-b border-navy-light">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <Ship className="h-5 w-5 text-gold shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="font-extrabold text-sm block truncate">
              {profile.full_name}
            </span>
            <span className="font-mono text-[10px] text-gold block leading-none">
              {profile.member_code}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-full bg-white/10 p-0.5">
            {LOCALE_OPTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLocale(item.code)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  locale === item.code ? 'bg-gold text-ink' : 'text-blue-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-navy-light border border-white/15"
            aria-label={portal.shell.mobileToggleAria}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav
          aria-label={portal.shell.portalTitle}
          className="lg:hidden bg-navy-light text-white px-4 py-3 space-y-1.5 border-b border-white/15"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 min-h-[44px] px-3 rounded-xl text-sm font-semibold ${
                  active ? 'bg-brand text-white' : 'text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="min-h-[40px] inline-flex items-center text-xs text-blue-200 font-semibold"
              >
                {portal.shell.publicSiteLink}
              </Link>
              <Link
                href="/katalog"
                className="min-h-[40px] inline-flex items-center text-xs text-gold font-semibold"
              >
                {portal.shell.catalogLink}
              </Link>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[40px] px-3 text-xs text-rose-200 font-bold"
            >
              {portal.shell.logoutBtn}
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 lg:pl-64">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
