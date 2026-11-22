'use client';

import Link from 'next/link';
import { Globe, Mail, MapPin, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/format';
import { formatOperatingHours } from '@/lib/i18n/dictionaries';
import type { PublicSettings } from '@/lib/types';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from './LanguageProvider';

interface PublicFooterProps {
  settings: PublicSettings;
}

export default function PublicFooter({ settings }: PublicFooterProps) {
  const { locale, dict } = useLanguage();

  const waUrl = buildWhatsAppUrl(
    settings.whatsapp_admin,
    dict.footer.waGreeting(settings.company_name)
  );

  return (
    <footer
      id="kontak"
      className="bg-navy text-white relative overflow-hidden border-t border-navy-light"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/15">
          <div className="md:col-span-4 space-y-3">
            <BrandLogo
              variant="dark"
              showSubtitle
              companyName={settings.company_name}
              subtitle={dict.brand.subtitle}
            />
            <p className="text-xs text-blue-100 leading-relaxed max-w-xs pt-1">
              {settings.company_address}
              <br />
              {formatOperatingHours(settings.operating_hours, locale)}
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-bold text-white mb-3">
              {dict.footer.quickLink}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-blue-100">
              <Link href="/" className="hover:text-gold transition-colors">
                {dict.footer.links.home}
              </Link>
              <Link
                href="/katalog"
                className="hover:text-gold transition-colors"
              >
                {dict.footer.links.catalog}
              </Link>
              <Link
                href="/#layanan"
                className="hover:text-gold transition-colors"
              >
                {dict.footer.links.services}
              </Link>
              <Link
                href="/#kalkulator"
                className="hover:text-gold transition-colors"
              >
                {dict.footer.links.calculator}
              </Link>
              <Link
                href="/#gudang"
                className="hover:text-gold transition-colors"
              >
                {dict.footer.links.warehouse}
              </Link>
              <Link
                href="/tracking"
                className="hover:text-gold transition-colors"
              >
                {dict.footer.links.tracking}
              </Link>
              <Link href="/#rfq" className="hover:text-gold transition-colors">
                {dict.footer.links.rfq}
              </Link>
              <Link href="/#faq" className="hover:text-gold transition-colors">
                {dict.footer.links.faq}
              </Link>
              <Link href="/admin" className="hover:text-gold transition-colors">
                {dict.footer.links.admin}
              </Link>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-sm font-bold text-white mb-3">
              {dict.footer.contactUs}
            </h3>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-blue-100 hover:text-white transition-colors"
            >
              <span className="h-7 w-7 rounded-full bg-wa text-white inline-flex items-center justify-center shrink-0">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="font-mono font-semibold">
                +{settings.whatsapp_admin}
              </span>
            </a>
            <a
              href="mailto:info@importirpontianak.id"
              className="flex items-center gap-2.5 text-xs text-blue-100 hover:text-white transition-colors"
            >
              <span className="h-7 w-7 rounded-full bg-navy-light border border-white/20 text-white inline-flex items-center justify-center shrink-0">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>info@importirpontianak.id</span>
            </a>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white">
              {dict.footer.quickAccess}
            </h3>
            <div className="flex items-center gap-2.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dict.footer.waAria}
                className="h-9 w-9 rounded-full bg-white text-navy hover:bg-gold transition-colors inline-flex items-center justify-center"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="mailto:info@importirpontianak.id"
                aria-label={dict.footer.emailAria}
                className="h-9 w-9 rounded-full bg-white text-navy hover:bg-gold transition-colors inline-flex items-center justify-center"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/tracking"
                aria-label={dict.footer.trackingAria}
                className="h-9 w-9 rounded-full bg-white text-navy hover:bg-gold transition-colors inline-flex items-center justify-center"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/#gudang"
                aria-label={dict.footer.warehouseAria}
                className="h-9 w-9 rounded-full bg-white text-navy hover:bg-gold transition-colors inline-flex items-center justify-center"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100">
          <span>
            © {new Date().getFullYear()} {settings.company_name}.{' '}
            {dict.footer.allRightsReserved}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            {dict.footer.locationLabel}
          </span>
        </div>
      </div>

      {/* Subtle decorative wave at footer bottom */}
      <svg
        viewBox="0 0 1440 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-full h-10 sm:h-12 pointer-events-none select-none opacity-35 -mt-6"
        preserveAspectRatio="none"
      >
        <path
          d="M0 45C240 10 480 65 720 35C960 5 1200 55 1440 28V70H0V45Z"
          fill="#1E64D8"
        />
      </svg>
    </footer>
  );
}
