import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { CustomerAuthProvider } from '@/components/public/CustomerAuthProvider';
import { LanguageProvider } from '@/components/public/LanguageProvider';
import { getCustomerSession } from '@/lib/auth';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/i18n/types';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ||
        'https://importir-pontianak.43-173-33-53.sslip.io'
    ),
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, initialCustomer] = await Promise.all([
    cookies(),
    getCustomerSession(),
  ]);
  const initialLocale = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value
  );

  return (
    <html
      lang={initialLocale === 'zh' ? 'zh-CN' : initialLocale}
      className={`${plusJakarta.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased bg-paper text-slate-900">
        <LanguageProvider initialLocale={initialLocale}>
          <CustomerAuthProvider initialCustomer={initialCustomer}>
            {children}
          </CustomerAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
